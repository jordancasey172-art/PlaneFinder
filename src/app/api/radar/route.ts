import { NextResponse } from "next/server";
import { getRadarFlights } from "@/lib/radar";

export const dynamic = "force-dynamic";

export async function GET() {
  const flights = await getRadarFlights();
  return NextResponse.json({ flights }, { headers: { "Cache-Control": "no-store" } });
}
