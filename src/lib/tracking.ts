import { eq } from "drizzle-orm";
import { db } from "@/db";
import { airlines, flights, trackingEvents, trackingSessions, type RouteWaypoint } from "@/db/schema";
import type { AirlineRecord, FlightRecord, TrackingSessionRecord } from "./flight-data";

export type TrackingSnapshot = {
  flight: FlightRecord;
  airline: AirlineRecord | null;
  session: TrackingSessionRecord;
  route: RouteWaypoint[];
  currentLocationLabel: string;
  simulatedNotice: string;
};

type Point = {
  lat: number;
  lng: number;
};

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function toDegrees(value: number) {
  return (value * 180) / Math.PI;
}

function distance(a: Point, b: Point) {
  const lat = a.lat - b.lat;
  const lng = a.lng - b.lng;
  return Math.sqrt(lat * lat + lng * lng);
}

function bearing(a: Point, b: Point) {
  const startLat = toRadians(a.lat);
  const endLat = toRadians(b.lat);
  const deltaLng = toRadians(b.lng - a.lng);
  const y = Math.sin(deltaLng) * Math.cos(endLat);
  const x = Math.cos(startLat) * Math.sin(endLat) - Math.sin(startLat) * Math.cos(endLat) * Math.cos(deltaLng);

  return Math.round((toDegrees(Math.atan2(y, x)) + 360) % 360);
}

export function interpolateRoute(route: RouteWaypoint[], progress: number) {
  if (route.length === 0) {
    return { lat: 0, lng: 0, heading: 0, label: "Unknown" };
  }

  if (route.length === 1 || progress <= 0) {
    return { ...route[0], heading: 90 };
  }

  if (progress >= 1) {
    const previous = route[Math.max(0, route.length - 2)];
    const last = route[route.length - 1];
    return { ...last, heading: bearing(previous, last) };
  }

  const segments = route.slice(1).map((point, index) => ({
    from: route[index],
    to: point,
    distance: distance(route[index], point),
  }));
  const totalDistance = segments.reduce((sum, segment) => sum + segment.distance, 0);
  let targetDistance = totalDistance * progress;

  for (const segment of segments) {
    if (targetDistance <= segment.distance) {
      const ratio = segment.distance === 0 ? 0 : targetDistance / segment.distance;
      return {
        lat: segment.from.lat + (segment.to.lat - segment.from.lat) * ratio,
        lng: segment.from.lng + (segment.to.lng - segment.from.lng) * ratio,
        heading: bearing(segment.from, segment.to),
        label: `${segment.from.label} → ${segment.to.label}`,
      };
    }

    targetDistance -= segment.distance;
  }

  const previous = route[Math.max(0, route.length - 2)];
  const last = route[route.length - 1];
  return { ...last, heading: bearing(previous, last) };
}

export function altitudeForProgress(progress: number, currentAltitude: number) {
  if (progress <= 0 || progress >= 1) return 0;
  if (progress < 0.14) return Math.round(36000 * (progress / 0.14));
  if (progress > 0.88) return Math.round(36000 * ((1 - progress) / 0.12));
  return Math.max(currentAltitude, 36000);
}

export function speedForProgress(progress: number, currentSpeed: number) {
  if (progress <= 0 || progress >= 1) return 0;
  if (progress < 0.14) return Math.max(currentSpeed, 320);
  if (progress > 0.88) return Math.max(220, Math.round(currentSpeed * 0.65));
  return Math.max(currentSpeed, 488);
}

export function evaluateFlightState(flight: FlightRecord, session: TrackingSessionRecord, now = Date.now()) {
  if (flight.status === "Cancelled" || session.status === "Cancelled") {
    const start = flight.routeCoordinates[0] ?? { lat: 0, lng: 0 };
    return {
      lat: start.lat,
      lng: start.lng,
      altitude: 0,
      speed: 0,
      heading: 90,
      status: "Cancelled",
      progress: 0,
      state: "stopped",
    };
  }

  const departureTime = new Date(flight.departureTime).getTime();
  const arrivalTime = new Date(flight.arrivalTime).getTime();
  const route = flight.routeCoordinates;

  if (now < departureTime) {
    const timeToDep = departureTime - now;
    const status = timeToDep <= 1000 * 60 * 45 ? "Boarding" : "Scheduled";
    const start = route[0] ?? { lat: 0, lng: 0 };
    return {
      lat: start.lat,
      lng: start.lng,
      altitude: 0,
      speed: 0,
      heading: 90,
      status,
      progress: 0,
      state: "paused",
    };
  }

  if (now >= arrivalTime) {
    const end = route[route.length - 1] ?? { lat: 0, lng: 0 };
    const prev = route[Math.max(0, route.length - 2)] ?? end;
    return {
      lat: end.lat,
      lng: end.lng,
      altitude: 0,
      speed: 0,
      heading: bearing(prev, end),
      status: "Arrived",
      progress: 1,
      state: "stopped",
    };
  }

  const duration = Math.max(1000, arrivalTime - departureTime);
  const elapsed = now - departureTime;
  const progress = Math.min(1, Math.max(0, elapsed / duration));
  const point = interpolateRoute(route, progress);

  return {
    lat: point.lat,
    lng: point.lng,
    altitude: altitudeForProgress(progress, 36000),
    speed: speedForProgress(progress, 488),
    heading: point.heading,
    status: "En Route",
    progress,
    state: "running",
  };
}

export async function getTrackingSnapshot(trackingId: string): Promise<TrackingSnapshot | null> {
  const normalizedTrackingId = trackingId.toUpperCase();
  const [session] = await db
    .select()
    .from(trackingSessions)
    .where(eq(trackingSessions.trackingId, normalizedTrackingId))
    .limit(1);

  if (!session) return null;

  const [flight] = await db.select().from(flights).where(eq(flights.id, session.flightId)).limit(1);
  if (!flight) return null;

  const [airline] = flight.airlineId ? await db.select().from(airlines).where(eq(airlines.id, flight.airlineId)).limit(1) : [];
  const route = flight.routeCoordinates;

  const computed = evaluateFlightState(flight, session);

  const [updated] = await db
    .update(trackingSessions)
    .set({
      currentLat: computed.lat,
      currentLng: computed.lng,
      heading: computed.heading,
      altitude: computed.altitude,
      speed: computed.speed,
      status: computed.status,
      simulationState: computed.state,
      simulationProgress: computed.progress,
      lastUpdatedAt: new Date(),
    })
    .where(eq(trackingSessions.id, session.id))
    .returning();

  const currentSession = updated ?? session;
  const nearestPoint = interpolateRoute(route, currentSession.simulationProgress);

  return {
    flight,
    airline: airline ?? null,
    session: currentSession,
    route,
    currentLocationLabel: nearestPoint.label,
    simulatedNotice: "",
  };
}

export async function writeTrackingEvent(session: TrackingSessionRecord, message: string) {
  await db.insert(trackingEvents).values({
    trackingSessionId: session.id,
    lat: session.currentLat,
    lng: session.currentLng,
    altitude: session.altitude,
    speed: session.speed,
    heading: session.heading,
    status: session.status,
    message,
  });
}

export async function setTrackingState(sessionId: string, state: "running" | "paused" | "stopped") {
  const [session] = await db.select().from(trackingSessions).where(eq(trackingSessions.id, sessionId)).limit(1);
  if (!session) return null;

  const [flight] = await db.select().from(flights).where(eq(flights.id, session.flightId)).limit(1);
  if (!flight) return null;

  const computed = evaluateFlightState(flight, session);
  const [updated] = await db
    .update(trackingSessions)
    .set({
      simulationState: state,
      currentLat: computed.lat,
      currentLng: computed.lng,
      heading: computed.heading,
      status: computed.status,
      speed: computed.speed,
      altitude: computed.altitude,
      lastUpdatedAt: new Date(),
    })
    .where(eq(trackingSessions.id, sessionId))
    .returning();

  if (updated) await writeTrackingEvent(updated, `Simulation state set to ${state}`);
  return updated ?? null;
}
