import { and, desc, eq, gte, ilike, isNull, lte, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  airlines,
  bookings,
  flights,
  passengers,
  payments,
  tickets,
  trackingEvents,
  trackingSessions,
  type RouteWaypoint,
} from "@/db/schema";
import { trackingId as createTrackingId } from "./ids";
import { AIRLINES, ROUTE_DEFS, buildRoute } from "./seed-routes";
import { getSupportThreads, type SupportThread } from "./support";

export type AirlineRecord = typeof airlines.$inferSelect;
export type FlightRecord = typeof flights.$inferSelect;
export type BookingRecord = typeof bookings.$inferSelect;
export type PassengerRecord = typeof passengers.$inferSelect;
export type TicketRecord = typeof tickets.$inferSelect;
export type TrackingSessionRecord = typeof trackingSessions.$inferSelect;
export type PaymentRecord = typeof payments.$inferSelect;

export type BookingBundle = {
  booking: BookingRecord;
  flight: FlightRecord;
  airline: AirlineRecord | null;
  passengers: PassengerRecord[];
  tickets: TicketRecord[];
  payment?: PaymentRecord;
  trackingSession?: TrackingSessionRecord;
};

export type TicketBundle = {
  ticket: TicketRecord;
  booking: BookingRecord;
  flight: FlightRecord;
  airline: AirlineRecord | null;
  passengers: PassengerRecord[];
  trackingSession?: TrackingSessionRecord;
};

export type FlightWithAirline = {
  flight: FlightRecord;
  airline: AirlineRecord | null;
};

async function uniqueTrackingId() {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const value = createTrackingId();
    const existing = await db
      .select({ id: trackingSessions.id })
      .from(trackingSessions)
      .where(eq(trackingSessions.trackingId, value))
      .limit(1);

    if (!existing.length) return value;
  }

  throw new Error("Unable to generate a unique tracking ID");
}

export async function ensureAirlines() {
  try {
  const existing = await db.select().from(airlines);

  const golden = existing.find((row) => row.code === "GA" || row.name.toLowerCase().includes("golden"));
  const aeroLinkExists = existing.some((row) => row.code === "AL");
  if (golden && !aeroLinkExists) {
    await db
      .update(airlines)
      .set({
        name: "AeroLink",
        code: "AL",
        callsign: "AEROLINK",
        country: "United Kingdom",
        hub: "London",
        hubCode: "LHR",
        color: "#1565C0",
      })
      .where(eq(airlines.id, golden.id));
  }

  const condor = existing.find((row) => row.code === "CA" && row.name.toLowerCase().includes("condor"));
  const hanseaticExists = existing.some((row) => row.code === "HA");
  if (condor && !hanseaticExists) {
    await db
      .update(airlines)
      .set({
        name: "Hanseatic",
        code: "HA",
        callsign: "HANSEATIC",
        country: "Germany",
        hub: "Frankfurt",
        hubCode: "FRA",
        color: "#455A64",
      })
      .where(eq(airlines.id, condor.id));
  }

  const refreshed = await db.select().from(airlines);
  const codes = new Set(refreshed.map((row) => row.code));
  const missing = AIRLINES.filter((airline) => !codes.has(airline.code));
  if (missing.length > 0) {
    await db.insert(airlines).values(missing);
  }

  if (existing.length === 0 && missing.length === 0 && refreshed.length === 0) {
    await db.insert(airlines).values(AIRLINES);
  }
  } catch {
    // Seed updates are best-effort so a race on first boot cannot take the site down.
  }
}

export async function ensureSeedData() {
  await ensureAirlines();

  await db.execute(sql`update flights set status = 'En Route' where status ilike '%simulated%' or status ilike '%in flight%'`);
  await db.execute(sql`update tracking_sessions set status = 'En Route' where status ilike '%simulated%' or status ilike '%in flight%'`);

  const airlineRows = await db.select().from(airlines);
  const airlineByCode = new Map(airlineRows.map((airline) => [airline.code, airline]));
  const defaultAirline = airlineByCode.get("AL") ?? airlineByCode.get("GA") ?? airlineRows[0];

  const existingFlights = await db.select({ flightNumber: flights.flightNumber }).from(flights);
  const existingNumbers = new Set(existingFlights.map((row) => row.flightNumber));
  const toInsert = ROUTE_DEFS.filter((definition) => !existingNumbers.has(definition.flightNumber));

  if (toInsert.length > 0) {
    const now = Date.now();
    const values = toInsert.map((definition) => {
      const airline = airlineByCode.get(definition.airlineCode);
      let departureTime: Date;
      let arrivalTime: Date;

      if (definition.status === "En Route") {
        departureTime = new Date(now - (20 + Math.random() * 320) * 60000);
        arrivalTime = new Date(departureTime.getTime() + definition.durationMinutes * 60000);
      } else if (definition.status === "Arrived") {
        departureTime = new Date(now - (definition.durationMinutes + 180 + Math.random() * 300) * 60000);
        arrivalTime = new Date(departureTime.getTime() + definition.durationMinutes * 60000);
      } else if (definition.status === "Boarding") {
        departureTime = new Date(now + (20 + Math.random() * 70) * 60000);
        arrivalTime = new Date(departureTime.getTime() + definition.durationMinutes * 60000);
      } else {
        departureTime = new Date(now + (120 + Math.random() * 840) * 60000);
        arrivalTime = new Date(departureTime.getTime() + definition.durationMinutes * 60000);
      }

      return {
        flightNumber: definition.flightNumber,
        airlineId: airline?.id ?? defaultAirline?.id ?? null,
        aircraft: definition.aircraft,
        origin: definition.origin,
        destination: definition.destination,
        originCode: definition.originCode,
        destinationCode: definition.destinationCode,
        departureTime,
        arrivalTime,
        status: definition.status,
        capacity: 120 + Math.floor(Math.random() * 50),
        basePriceCents: definition.basePriceCents,
        routeCoordinates: buildRoute(definition),
      };
    });

    const created = await db.insert(flights).values(values).returning();

    for (const flight of created) {
      const definition = toInsert.find((item) => item.flightNumber === flight.flightNumber);
      await createSessionForFlight(flight, definition);
    }
  }

  if (defaultAirline) {
    await db.update(flights).set({ airlineId: defaultAirline.id }).where(isNull(flights.airlineId));
  }
}

async function createSessionForFlight(flight: FlightRecord, definition?: (typeof ROUTE_DEFS)[number]) {
  const status = definition?.status ?? flight.status;
  const durationSeconds = (definition?.durationMinutes ?? 480) * 60;
  const route = flight.routeCoordinates;
  const lastPoint = route[route.length - 1];

  let state: "running" | "paused" | "stopped" = "paused";
  let progress = 0;
  let lat = route[0]?.lat ?? 0;
  let lng = route[0]?.lng ?? 0;
  let altitude = 0;
  let speed = 0;

  if (status === "En Route" || status.toLowerCase().includes("in flight")) {
    state = "running";
    progress = 0.06 + Math.random() * 0.8;
    altitude = 36000;
    speed = 460 + Math.round(Math.random() * 70);
  } else if (status === "Boarding") {
    progress = 0.01;
  } else if (status === "Arrived") {
    state = "stopped";
    progress = 1;
    lat = lastPoint?.lat ?? lat;
    lng = lastPoint?.lng ?? lng;
  }

  const [session] = await db
    .insert(trackingSessions)
    .values({
      flightId: flight.id,
      trackingId: await uniqueTrackingId(),
      currentLat: lat,
      currentLng: lng,
      altitude,
      speed,
      heading: 70 + Math.floor(Math.random() * 80),
      status,
      simulationMode: true,
      simulationState: state,
      simulationProgress: progress,
      simulationSpeedMultiplier: 1 + Math.random() * 1.5,
      simulationDurationSeconds: Math.max(300, Math.round(durationSeconds)),
      lastUpdatedAt: new Date(),
    })
    .returning();

  const created = session;

  await db.insert(trackingEvents).values({
    trackingSessionId: created.id,
    lat: created.currentLat,
    lng: created.currentLng,
    altitude: created.altitude,
    speed: created.speed,
    heading: created.heading,
    status: created.status,
    message: "Tracking session created",
  });

  return created;
}

export async function ensureTrackingSessionForFlight(flight: FlightRecord) {
  const existing = await db
    .select()
    .from(trackingSessions)
    .where(eq(trackingSessions.flightId, flight.id))
    .limit(1);

  if (existing[0]) return existing[0];

  const start = flight.routeCoordinates[0] ?? { lat: 0, lng: 0, label: "Start" };
  const created = await db
    .insert(trackingSessions)
    .values({
      flightId: flight.id,
      trackingId: await uniqueTrackingId(),
      currentLat: start.lat,
      currentLng: start.lng,
      altitude: flight.status === "Boarding" ? 12000 : 0,
      speed: flight.status === "Boarding" ? 340 : 0,
      heading: 70,
      status: flight.status,
      simulationMode: true,
      simulationState: flight.status === "Boarding" ? "running" : "paused",
      simulationProgress: flight.status === "Boarding" ? 0.08 : 0,
      simulationSpeedMultiplier: 1,
      simulationDurationSeconds: 900,
      lastUpdatedAt: new Date(),
    })
    .returning();

  const session = created[0] ?? (
    await db.select().from(trackingSessions).where(eq(trackingSessions.flightId, flight.id)).limit(1)
  )[0];

  if (!session) {
    throw new Error("Tracking session was not created.");
  }

  await db.insert(trackingEvents).values({
    trackingSessionId: session.id,
    lat: session.currentLat,
    lng: session.currentLng,
    altitude: session.altitude,
    speed: session.speed,
    heading: session.heading,
    status: session.status,
    message: "Tracking session created",
  });

  return session;
}

export type FlightSearch = {
  origin?: string;
  destination?: string;
  date?: string;
  passengers?: string;
};

export async function searchFlights(filters: FlightSearch = {}): Promise<FlightWithAirline[]> {
  await ensureSeedData();

  const conditions = [];

  if (filters.origin) {
    conditions.push(ilike(flights.origin, `%${filters.origin}%`));
  }

  if (filters.destination) {
    conditions.push(ilike(flights.destination, `%${filters.destination}%`));
  }

  if (filters.date) {
    const start = new Date(`${filters.date}T00:00:00.000Z`);
    const end = new Date(`${filters.date}T23:59:59.999Z`);

    if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
      conditions.push(gte(flights.departureTime, start), lte(flights.departureTime, end));
    }
  }

  const baseQuery = db
    .select({ flight: flights, airline: airlines })
    .from(flights)
    .leftJoin(airlines, eq(airlines.id, flights.airlineId))
    .orderBy(flights.departureTime);

  const rows = conditions.length ? await baseQuery.where(and(...conditions)) : await baseQuery;

  return rows.map((row) => ({ flight: row.flight, airline: row.airline }));
}

export async function getFlightById(flightId: string) {
  await ensureSeedData();

  const [flight] = await db.select().from(flights).where(eq(flights.id, flightId)).limit(1);
  return flight ?? null;
}

export async function getFlightWithAirline(flightId: string): Promise<FlightWithAirline | null> {
  const [row] = await db
    .select({ flight: flights, airline: airlines })
    .from(flights)
    .leftJoin(airlines, eq(airlines.id, flights.airlineId))
    .where(eq(flights.id, flightId))
    .limit(1);

  return row ? { flight: row.flight, airline: row.airline } : null;
}

export function generateSeatMap(capacity: number) {
  const letters = ["A", "B", "C", "D", "E", "F"];
  const rows = Math.ceil(capacity / letters.length);
  const seats: string[] = [];

  for (let row = 1; row <= rows; row += 1) {
    for (const letter of letters) {
      if (seats.length < capacity) seats.push(`${row}${letter}`);
    }
  }

  return seats;
}

export async function getBookedSeats(flightId: string) {
  const rows = await db
    .select({ seat: tickets.seat })
    .from(tickets)
    .innerJoin(bookings, eq(bookings.id, tickets.bookingId))
    .where(and(eq(bookings.flightId, flightId), ne(tickets.status, "Cancelled")));

  return rows.map((row) => row.seat);
}

export async function getAvailableSeats(flightId: string, capacity: number) {
  const bookedSeats = new Set(await getBookedSeats(flightId));
  return generateSeatMap(capacity).filter((seat) => !bookedSeats.has(seat));
}

export async function getBookingByReference(reference: string): Promise<BookingBundle | null> {
  const [booking] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.bookingReference, reference.toUpperCase()))
    .limit(1);

  if (!booking) return null;

  const [flight] = await db.select().from(flights).where(eq(flights.id, booking.flightId)).limit(1);
  if (!flight) return null;

  const [airline] = flight.airlineId ? await db.select().from(airlines).where(eq(airlines.id, flight.airlineId)).limit(1) : [];
  const [payment] = await db.select().from(payments).where(eq(payments.bookingId, booking.id)).limit(1);
  const bookingPassengers = await db.select().from(passengers).where(eq(passengers.bookingId, booking.id));
  const bookingTickets = await db.select().from(tickets).where(eq(tickets.bookingId, booking.id));
  const [trackingSession] = await db
    .select()
    .from(trackingSessions)
    .where(eq(trackingSessions.flightId, flight.id))
    .limit(1);

  return {
    booking,
    flight,
    airline: airline ?? null,
    passengers: bookingPassengers,
    tickets: bookingTickets,
    payment,
    trackingSession,
  };
}

export async function getTicketByNumber(ticketNumberValue: string): Promise<TicketBundle | null> {
  const [ticket] = await db
    .select()
    .from(tickets)
    .where(eq(tickets.ticketNumber, ticketNumberValue.toUpperCase()))
    .limit(1);

  return ticket ? getTicketBundle(ticket) : null;
}

export async function getTicketByVerificationToken(token: string): Promise<TicketBundle | null> {
  const [ticket] = await db
    .select()
    .from(tickets)
    .where(eq(tickets.verificationToken, token))
    .limit(1);

  return ticket ? getTicketBundle(ticket) : null;
}

async function getTicketBundle(ticket: TicketRecord): Promise<TicketBundle | null> {
  const [booking] = await db.select().from(bookings).where(eq(bookings.id, ticket.bookingId)).limit(1);
  if (!booking) return null;

  const [flight] = await db.select().from(flights).where(eq(flights.id, booking.flightId)).limit(1);
  if (!flight) return null;

  const [airline] = flight.airlineId ? await db.select().from(airlines).where(eq(airlines.id, flight.airlineId)).limit(1) : [];
  const bookingPassengers = await db.select().from(passengers).where(eq(passengers.bookingId, booking.id));
  const [trackingSession] = await db
    .select()
    .from(trackingSessions)
    .where(eq(trackingSessions.flightId, flight.id))
    .limit(1);

  return {
    ticket,
    booking,
    flight,
    airline: airline ?? null,
    passengers: bookingPassengers,
    trackingSession,
  };
}

export async function getAdminDashboardData(ticketQuery?: string) {
  await ensureSeedData();

  const [flightRows, bookingRows, passengerRows, trackingRows, airlineRows, supportThreads] = await Promise.all([
    db.select().from(flights).orderBy(flights.departureTime),
    db.select().from(bookings).orderBy(desc(bookings.createdAt)).limit(50),
    db.select().from(passengers).orderBy(desc(passengers.createdAt)).limit(50),
    db.select().from(trackingSessions).orderBy(desc(trackingSessions.lastUpdatedAt)),
    db.select().from(airlines).orderBy(airlines.name),
    getSupportThreads(),
  ]);

  const ticketConditions = ticketQuery
    ? sql`${tickets.ticketNumber} ilike ${`%${ticketQuery}%`} or ${tickets.status} ilike ${`%${ticketQuery}%`}`
    : undefined;

  const ticketRows = ticketConditions
    ? await db.select().from(tickets).where(ticketConditions).orderBy(desc(tickets.issuedAt)).limit(50)
    : await db.select().from(tickets).orderBy(desc(tickets.issuedAt)).limit(50);

  return {
    flights: flightRows,
    bookings: bookingRows,
    passengers: passengerRows,
    tickets: ticketRows,
    trackingSessions: trackingRows,
    airlines: airlineRows,
    supportThreads,
  };
}

export type { SupportThread };
