import { eq } from "drizzle-orm";
import { type NextRequest } from "next/server";
import { db } from "@/db";
import { flights, trackingSessions } from "@/db/schema";
import { requireAdminRequest } from "@/lib/admin-api";
import { publicRedirect } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, { params }: { params: Promise<{ flightId: string }> }) {
  const unauthorized = requireAdminRequest(request);
  if (unauthorized) return unauthorized;

  const { flightId } = await params;
  const formData = await request.formData();
  const action = String(formData.get("action") ?? "cancel");

  if (action === "cancel") {
    await db.update(flights).set({ status: "Cancelled", updatedAt: new Date() }).where(eq(flights.id, flightId));
    await db
      .update(trackingSessions)
      .set({ status: "Cancelled", simulationState: "stopped", speed: 0, lastUpdatedAt: new Date() })
      .where(eq(trackingSessions.flightId, flightId));
  }

  return publicRedirect(request, "/ops-console-secure-access/dashboard?updated=flight");
}
