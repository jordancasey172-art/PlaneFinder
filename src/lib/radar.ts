import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { airlines, flights, tickets, trackingSessions } from "@/db/schema";
import { ensureSeedData, type AirlineRecord } from "./flight-data";
import { altitudeForProgress, interpolateRoute, speedForProgress } from "./tracking";

export type RadarAirline = {
  id: string;
  name: string;
  code: string;
  color: string;
  hub: string;
  hubCode: string;
  country: string;
  callsign: string;
};

export type RadarFlight = {
  flightId: string;
  flightNumber: string;
  airline: RadarAirline | null;
  aircraft: string;
  origin: string;
  destination: string;
  originCode: string;
  destinationCode: string;
  status: string;
  trackingId: string;
  lat: number;
  lng: number;
  heading: number;
  altitude: number;
  speed: number;
  progress: number;
  departureTime: string;
  arrivalTime: string;
  simulationState: string;
  lastUpdatedAt: string;
};

export async function getRadarFlights(): Promise<RadarFlight[]> {
  await ensureSeedData();

  const [flightRows, sessionRows, airlineRows] = await Promise.all([
    db.select().from(flights),
    db.select().from(trackingSessions),
    db.select().from(airlines),
  ]);

  const airlineById = new Map(airlineRows.map((airline) => [airline.id, airline]));
  const sessionByFlight = new Map(sessionRows.map((session) => [session.flightId, session]));
  const now = Date.now();
  const output: RadarFlight[] = [];

  const africaCities = new Set(["Johannesburg", "Cape Town", "Lagos", "Nairobi", "Cairo", "Casablanca", "Accra"]);

  for (const flight of flightRows) {
    const session = sessionByFlight.get(flight.id);
    if (!session) continue;
    if (flight.status === "Cancelled") continue;
    if (africaCities.has(flight.origin) || africaCities.has(flight.destination)) continue;

    let current = session;

    if (session.simulationMode && session.simulationState === "running") {
      const elapsedSeconds = Math.max(0, (now - session.lastUpdatedAt.getTime()) / 1000);
      const progress = Math.min(
        1,
        session.simulationProgress + (elapsedSeconds * session.simulationSpeedMultiplier) / session.simulationDurationSeconds,
      );
      const point = interpolateRoute(flight.routeCoordinates, progress);
      const arrived = progress >= 1;

      current = {
        ...session,
        currentLat: point.lat,
        currentLng: point.lng,
        heading: point.heading,
        altitude: altitudeForProgress(progress, session.altitude),
        speed: speedForProgress(progress, session.speed),
        status: arrived ? "Arrived" : "En Route",
        simulationState: arrived ? "stopped" : "running",
        simulationProgress: progress,
        lastUpdatedAt: new Date(),
      };

      await db
        .update(trackingSessions)
        .set({
          currentLat: current.currentLat,
          currentLng: current.currentLng,
          heading: current.heading,
          altitude: current.altitude,
          speed: current.speed,
          status: current.status,
          simulationState: current.simulationState,
          simulationProgress: current.simulationProgress,
          lastUpdatedAt: current.lastUpdatedAt,
        })
        .where(eq(trackingSessions.id, session.id));
    }

    const airlineRecord = flight.airlineId ? airlineById.get(flight.airlineId) ?? null : null;
    const airline = airlineRecord
      ? {
          id: airlineRecord.id,
          name: airlineRecord.name,
          code: airlineRecord.code,
          color: airlineRecord.color,
          hub: airlineRecord.hub,
          hubCode: airlineRecord.hubCode,
          country: airlineRecord.country,
          callsign: airlineRecord.callsign,
        }
      : null;

    output.push({
      flightId: flight.id,
      flightNumber: flight.flightNumber,
      airline,
      aircraft: flight.aircraft,
      origin: flight.origin,
      destination: flight.destination,
      originCode: flight.originCode,
      destinationCode: flight.destinationCode,
      status: current.status,
      trackingId: current.trackingId,
      lat: current.currentLat,
      lng: current.currentLng,
      heading: current.heading,
      altitude: current.altitude,
      speed: current.speed,
      progress: current.simulationProgress,
      departureTime: flight.departureTime.toISOString(),
      arrivalTime: flight.arrivalTime.toISOString(),
      simulationState: current.simulationState,
      lastUpdatedAt: current.lastUpdatedAt.toISOString(),
    });
  }

  return output.sort((a, b) => a.flightNumber.localeCompare(b.flightNumber));
}

export type AirlineStats = {
  airline: AirlineRecord;
  liveFlights: number;
  totalFlights: number;
};

export async function getAirlinesWithStats(): Promise<AirlineStats[]> {
  const [airlineRows, radarFlights] = await Promise.all([db.select().from(airlines).orderBy(airlines.name), getRadarFlights()]);

  return airlineRows.map((airline) => {
    const airlineFlights = radarFlights.filter((flight) => flight.airline?.id === airline.id);
    return {
      airline,
      liveFlights: airlineFlights.filter((flight) => flight.status === "En Route" || flight.status.includes("In flight")).length,
      totalFlights: airlineFlights.length,
    };
  });
}

export async function getHomepageStats() {
  const [flightCount, airlineCount, ticketCount, radarFlights] = await Promise.all([
    db.select({ value: count() }).from(flights),
    db.select({ value: count() }).from(airlines),
    db.select({ value: count() }).from(tickets),
    getRadarFlights(),
  ]);

  return {
    totalFlights: flightCount[0]?.value ?? 0,
    airlines: airlineCount[0]?.value ?? 0,
    ticketsIssued: ticketCount[0]?.value ?? 0,
    airborne: radarFlights.filter((flight) => flight.status === "En Route" || flight.status.includes("In flight")).length,
    liveFlights: radarFlights.length,
  };
}
