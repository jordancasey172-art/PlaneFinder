import { eq } from "drizzle-orm";
import { getPool } from "@/db";
import { airlines, flights, type RouteWaypoint } from "@/db/schema";
import { db } from "@/db";
import { databaseErrorMessage } from "@/lib/db-error";
import { ensureTrackingSessionForFlight, type FlightRecord } from "@/lib/flight-data";
import { parseDateInput } from "@/lib/http";

function clip(value: string, max: number) {
  return value.trim().slice(0, max);
}

function num(value: FormDataEntryValue | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function mapFlightRow(row: Record<string, unknown>): FlightRecord {
  return {
    id: String(row.id),
    flightNumber: String(row.flight_number),
    airlineId: (row.airline_id as string | null) ?? null,
    aircraft: String(row.aircraft),
    origin: String(row.origin),
    destination: String(row.destination),
    originCode: String(row.origin_code),
    destinationCode: String(row.destination_code),
    departureTime: new Date(String(row.departure_time)),
    arrivalTime: new Date(String(row.arrival_time)),
    status: String(row.status),
    cabinClasses: Array.isArray(row.cabin_classes) ? (row.cabin_classes as string[]) : ["Economy", "Premium", "Business"],
    capacity: Number(row.capacity),
    basePriceCents: Number(row.base_price_cents),
    routeCoordinates: (row.route_coordinates as RouteWaypoint[]) ?? [],
    createdAt: new Date(String(row.created_at ?? Date.now())),
    updatedAt: new Date(String(row.updated_at ?? Date.now())),
  };
}

export type CreateFlightResult =
  | { ok: true; flight: FlightRecord; trackingWarning?: string }
  | { ok: false; error: string };

export async function createFlightFromFormData(formData: FormData): Promise<CreateFlightResult> {
  const flightNumber = clip(String(formData.get("flightNumber") ?? "").toUpperCase(), 24);
  const airlineCode = clip(String(formData.get("airlineCode") ?? "").toUpperCase(), 8);
  const aircraft = clip(String(formData.get("aircraft") ?? "Boeing 787-9") || "Boeing 787-9", 80);
  const origin = clip(String(formData.get("origin") ?? ""), 160);
  const destination = clip(String(formData.get("destination") ?? ""), 160);
  const originCode = clip(String(formData.get("originCode") ?? "").toUpperCase(), 8);
  const destinationCode = clip(String(formData.get("destinationCode") ?? "").toUpperCase(), 8);
  const departureTime = parseDateInput(String(formData.get("departureTime") ?? ""));
  const arrivalTime = parseDateInput(String(formData.get("arrivalTime") ?? ""));
  const status = clip(String(formData.get("status") ?? "Scheduled") || "Scheduled", 40);
  const startLat = num(formData.get("startLat"), 40.6413);
  const startLng = num(formData.get("startLng"), -73.7781);
  const endLat = num(formData.get("endLat"), 51.47);
  const endLng = num(formData.get("endLng"), -0.4543);
  const capacity = Math.min(500, Math.max(1, Math.round(num(formData.get("capacity"), 126))));
  const basePriceCents = Math.max(100, Math.round(num(formData.get("basePrice"), 645) * 100));

  if (!flightNumber || !origin || !destination || !originCode || !destinationCode) {
    return { ok: false, error: "Flight number, cities, and airport codes are required." };
  }
  if (originCode.length > 8 || destinationCode.length > 8) {
    return { ok: false, error: "Airport codes must be 8 characters or fewer (e.g. JFK, LHR)." };
  }
  if (Number.isNaN(departureTime.getTime()) || Number.isNaN(arrivalTime.getTime())) {
    return { ok: false, error: "Valid departure and arrival times are required." };
  }
  if (arrivalTime.getTime() <= departureTime.getTime()) {
    return { ok: false, error: "Arrival time must be after departure time." };
  }

  let airlineId: string | null = null;
  if (airlineCode) {
    const airlineRow = await db.select().from(airlines).where(eq(airlines.code, airlineCode)).limit(1);
    airlineId = airlineRow[0]?.id ?? null;
  }

  const routeCoordinates: RouteWaypoint[] = [
    { label: origin, lat: startLat, lng: startLng },
    { label: "Cruise waypoint", lat: (startLat + endLat) / 2 + 6, lng: (startLng + endLng) / 2 },
    { label: destination, lat: endLat, lng: endLng },
  ];

  const params = [
    flightNumber,
    airlineId,
    aircraft,
    origin,
    destination,
    originCode,
    destinationCode,
    departureTime.toISOString(),
    arrivalTime.toISOString(),
    status,
    JSON.stringify(["Economy", "Premium", "Business"]),
    capacity,
    basePriceCents,
    JSON.stringify(routeCoordinates),
  ];

  let flight: FlightRecord | undefined;

  try {
    const inserted = await getPool().query(
      `INSERT INTO flights (
        flight_number, airline_id, aircraft, origin, destination, origin_code, destination_code,
        departure_time, arrival_time, status, cabin_classes, capacity, base_price_cents, route_coordinates, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8::timestamptz, $9::timestamptz, $10, $11::jsonb, $12, $13, $14::jsonb, NOW()
      ) RETURNING *`,
      params,
    );
    if (inserted.rows[0]) flight = mapFlightRow(inserted.rows[0] as Record<string, unknown>);
  } catch (error) {
    const existing = await db.select().from(flights).where(eq(flights.flightNumber, flightNumber)).limit(1);
    if (existing[0]) {
      flight = existing[0];
    } else {
      return { ok: false, error: databaseErrorMessage(error) };
    }
  }

  if (!flight) {
    const [fallback] = await db.select().from(flights).where(eq(flights.flightNumber, flightNumber)).limit(1);
    flight = fallback;
  }

  if (!flight) {
    return { ok: false, error: "Flight insert did not return a row." };
  }

  try {
    await ensureTrackingSessionForFlight(flight);
    return { ok: true, flight };
  } catch (error) {
    return {
      ok: true,
      flight,
      trackingWarning: databaseErrorMessage(error),
    };
  }
}
