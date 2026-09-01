"use client";

import dynamic from "next/dynamic";
import type { RouteWaypoint } from "@/db/schema";

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="grid h-[420px] place-items-center rounded-xl border border-slate-200 bg-white text-sm text-slate-500">
      Loading secure flight map…
    </div>
  ),
});

type MapShellProps = {
  route: RouteWaypoint[];
  position: {
    lat: number;
    lng: number;
  };
  heading: number;
  label?: string;
  className?: string;
};

export function MapShell(props: MapShellProps) {
  return <LeafletMap {...props} />;
}
