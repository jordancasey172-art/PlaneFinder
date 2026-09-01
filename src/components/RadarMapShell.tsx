"use client";

import dynamic from "next/dynamic";
import type { RadarAirline, RadarFlight } from "@/lib/radar";

const RadarMap = dynamic(() => import("./RadarMap").then((mod) => mod.RadarMap), {
  ssr: false,
  loading: () => (
    <div className="grid h-[72vh] place-items-center rounded-xl border border-slate-200 bg-white text-slate-500">
      Loading live radar…
    </div>
  ),
});

type RadarMapShellProps = {
  initialFlights: RadarFlight[];
  airlines: RadarAirline[];
};

export function RadarMapShell({ initialFlights, airlines }: RadarMapShellProps) {
  return <RadarMap initialFlights={initialFlights} airlines={airlines} />;
}
