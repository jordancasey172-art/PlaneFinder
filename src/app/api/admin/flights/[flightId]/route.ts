import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { flights, tickets, trackingSessions } from "@/db/schema";
import { adminRedirect, requireAdminRequest } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, { params }: { params: Promise<{ flightId: string }> }) {
  const unauthorized = requireAdminRequest(request);
  if (unauthorized) return unauthorized;

  const { flightId } = await params;
  const formData = await request.formData();
  const action = String(formData.get("action") ?? "update");

  if (action === "cancel") {
    await db.update(flights).set({ status: "Cancelled", updatedAt: new Date() }).where(eq(flights.id, flightId));
    await db.update(trackingSessions).set({ status: "Cancelled", simulationState: "stopped", speed: 0, lastUpdatedAt: new Date() }).where(eq(trackingSessions.flightId, flightId));
    return adminRedirect(request, "/ops-console-secure-access/dashboard?updated=flight-cancelled");
  }

  if (action === "ticket-cancel") {
    const ticketId = String(formData.get("ticketId") ?? "");
    if (ticketId) {
      await db.update(tickets).set({ status: "Cancelled", cancelledAt: new Date() }).where(eq(tickets.id, ticketId));
    }
    return adminRedirect(request, "/ops-console-secure-access/dashboard?updated=ticket-cancelled");
  }

  const status = String(formData.get("status") ?? "Scheduled").trim() || "Scheduled";
  const departureTimeValue = String(formData.get("departureTime") ?? "");
  const arrivalTimeValue = String(formData.get("arrivalTime") ?? "");
  const departureTime = departureTimeValue ? new Date(departureTimeValue) : undefined;
  const arrivalTime = arrivalTimeValue ? new Date(arrivalTimeValue) : undefined;

  await db
    .update(flights)
    .set({
      status,
      ...(departureTime && !Number.isNaN(departureTime.getTime()) ? { departureTime } : {}),
      ...(arrivalTime && !Number.isNaN(arrivalTime.getTime()) ? { arrivalTime } : {}),
      updatedAt: new Date(),
    })
    .where(eq(flights.id, flightId));

  await db.update(trackingSessions).set({ status, lastUpdatedAt: new Date() }).where(eq(trackingSessions.flightId, flightId));

  return adminRedirect(request, "/ops-console-secure-access/dashboard?updated=flight");
}
