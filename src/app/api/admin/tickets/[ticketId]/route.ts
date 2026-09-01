import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { tickets } from "@/db/schema";
import { adminRedirect, requireAdminRequest } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, { params }: { params: Promise<{ ticketId: string }> }) {
  const unauthorized = requireAdminRequest(request);
  if (unauthorized) return unauthorized;

  const { ticketId } = await params;
  const formData = await request.formData();
  const action = String(formData.get("action") ?? "cancel");

  if (action !== "cancel") {
    return NextResponse.json({ error: "Unsupported ticket action" }, { status: 400 });
  }

  await db.update(tickets).set({ status: "Cancelled", cancelledAt: new Date() }).where(eq(tickets.id, ticketId));
  return adminRedirect(request, "/ops-console-secure-access/dashboard?updated=ticket");
}
