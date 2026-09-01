import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { trackingSessions } from "@/db/schema";
import { adminRedirect, requireAdminRequest } from "@/lib/admin-api";
import { getTrackingSnapshot, setTrackingState, writeTrackingEvent } from "@/lib/tracking";

export const dynamic = "force-dynamic";

function num(value: FormDataEntryValue | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const unauthorized = requireAdminRequest(request);
  if (unauthorized) return unauthorized;

  const { sessionId } = await params;
  const formData = await request.formData();
  const action = String(formData.get("action") ?? "manual");
  const [session] = await db.select().from(trackingSessions).where(eq(trackingSessions.id, sessionId)).limit(1);

  if (!session) {
    return NextResponse.json({ error: "Tracking session not found" }, { status: 404 });
  }

  if (action === "start" || action === "pause" || action === "stop") {
    await setTrackingState(sessionId, action === "start" ? "running" : action === "pause" ? "paused" : "stopped");
    return adminRedirect(request, `/ops-console-secure-access/dashboard?tracking=${action}`);
  }

  if (action === "speed") {
    await getTrackingSnapshot(session.trackingId);
    const multiplier = Math.min(20, Math.max(0.1, num(formData.get("simulationSpeedMultiplier"), session.simulationSpeedMultiplier)));
    const [updated] = await db
      .update(trackingSessions)
      .set({ simulationSpeedMultiplier: multiplier, lastUpdatedAt: new Date() })
      .where(eq(trackingSessions.id, sessionId))
      .returning();

    if (updated) await writeTrackingEvent(updated, `Simulation speed changed to ${multiplier}x`);
    return adminRedirect(request, "/ops-console-secure-access/dashboard?tracking=speed");
  }

  const currentLat = num(formData.get("currentLat"), session.currentLat);
  const currentLng = num(formData.get("currentLng"), session.currentLng);
  const altitude = Math.max(0, Math.round(num(formData.get("altitude"), session.altitude)));
  const speed = Math.max(0, Math.round(num(formData.get("speed"), session.speed)));
  const heading = Math.round(num(formData.get("heading"), session.heading)) % 360;
  const status = String(formData.get("status") ?? session.status).trim() || session.status;

  const [updated] = await db
    .update(trackingSessions)
    .set({
      currentLat,
      currentLng,
      altitude,
      speed,
      heading: heading < 0 ? heading + 360 : heading,
      status,
      simulationState: "paused",
      lastUpdatedAt: new Date(),
    })
    .where(eq(trackingSessions.id, sessionId))
    .returning();

  if (updated) await writeTrackingEvent(updated, "Manual admin position update");
  return adminRedirect(request, "/ops-console-secure-access/dashboard?tracking=manual");
}
