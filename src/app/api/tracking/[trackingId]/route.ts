import { NextResponse } from "next/server";
import { getTrackingSnapshot } from "@/lib/tracking";
import { toTrackingViewModel } from "@/lib/view-models";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ trackingId: string }> }) {
  const { trackingId } = await params;
  const snapshot = await getTrackingSnapshot(trackingId);

  if (!snapshot) {
    return NextResponse.json({ error: "Tracking ID not found." }, { status: 404 });
  }

  return NextResponse.json({ tracking: toTrackingViewModel(snapshot) });
}
