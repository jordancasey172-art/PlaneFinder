"use client";

import { useEffect, useMemo, useState } from "react";
import type { RouteWaypoint } from "@/db/schema";
import { MapShell } from "./MapShell";

export type TrackingViewModel = {
  flightNumber: string;
  airline: { name: string; code: string; color: string } | null;
  aircraft: string;
  origin: string;
  destination: string;
  originCode: string;
  destinationCode: string;
  departureTime: string;
  arrivalTime: string;
  trackingId: string;
  currentLat: number;
  currentLng: number;
  altitude: number;
  speed: number;
  heading: number;
  status: string;
  lastUpdatedAt: string;
  currentLocationLabel: string;
  route: RouteWaypoint[];
  simulatedNotice: string;
  simulationState: string;
  simulationSpeedMultiplier: number;
};

function numberFormatter(value: number) {
  return new Intl.NumberFormat("en", { maximumFractionDigits: 0 }).format(value);
}

function timeFormatter(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(value));
}

export function TrackingExperience({ initial }: { initial: TrackingViewModel }) {
  const [snapshot, setSnapshot] = useState(initial);
  const [connectionState, setConnectionState] = useState("Connecting to live stream");

  useEffect(() => {
    let pollTimer: ReturnType<typeof setInterval> | undefined;
    let closed = false;

    async function refresh() {
      const response = await fetch(`/api/tracking/${encodeURIComponent(initial.trackingId)}`, { cache: "no-store" });
      if (!response.ok) return;
      const payload = (await response.json()) as { tracking: TrackingViewModel };
      setSnapshot(payload.tracking);
      setConnectionState("Live refresh active");
    }

    const source = new EventSource(`/api/tracking/${encodeURIComponent(initial.trackingId)}/stream`);

    source.onopen = () => setConnectionState("Live stream active");
    source.onmessage = (event) => {
      const payload = JSON.parse(event.data) as TrackingViewModel;
      setSnapshot(payload);
      setConnectionState("Live stream active");
    };
    source.onerror = () => {
      source.close();
      if (!closed && !pollTimer) {
        setConnectionState("Live polling fallback active");
        void refresh();
        pollTimer = setInterval(() => void refresh(), 3000);
      }
    };

    return () => {
      closed = true;
      source.close();
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [initial.trackingId]);

  const airlineColor = snapshot.airline?.color ?? "#f5b42b";
  const stats = useMemo(
    () => [
      { label: "Flight status", value: snapshot.status },
      { label: "Current location", value: snapshot.currentLocationLabel },
      { label: "Altitude", value: `${numberFormatter(snapshot.altitude)} ft` },
      { label: "Speed", value: `${numberFormatter(snapshot.speed)} kt` },
      { label: "Heading", value: `${snapshot.heading}°` },
      { label: "Aircraft", value: snapshot.aircraft },
      { label: "Last updated", value: timeFormatter(snapshot.lastUpdatedAt) },
    ],
    [snapshot],
  );

  return (
    <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-2">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
              Live position · {connectionState}
            </span>
          </div>
        </div>
        <MapShell
          route={snapshot.route}
          position={{ lat: snapshot.currentLat, lng: snapshot.currentLng }}
          heading={snapshot.heading}
          label={`${snapshot.flightNumber} • ${snapshot.currentLocationLabel}`}
          className="h-[560px] overflow-hidden rounded-[1.5rem]"
        />
      </div>

      <aside className="space-y-5">
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="border-b border-slate-100 p-6" style={{ background: `linear-gradient(135deg, ${airlineColor}22, #ffffff)` }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="grid h-9 w-9 place-items-center rounded-xl font-black text-white" style={{ background: airlineColor }}>
                    {snapshot.airline?.code ?? "PF"}
                  </span>
                  <p className="text-sm font-bold text-slate-500">{snapshot.airline?.name ?? "Plane finder"}</p>
                </div>
                <h1 className="mt-3 text-4xl font-black text-slate-950">{snapshot.flightNumber}</h1>
                <p className="mt-1 font-mono text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{snapshot.trackingId}</p>
                <p className="mt-3 text-slate-600">
                  {snapshot.origin} ({snapshot.originCode}) → {snapshot.destination} ({snapshot.destinationCode})
                </p>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-800">
                {snapshot.status}
              </span>
            </div>
          </div>
          <div className="grid gap-3 p-6">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Departure</p>
              <p className="mt-1 font-semibold text-slate-900">{timeFormatter(snapshot.departureTime)}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Estimated arrival</p>
              <p className="mt-1 font-semibold text-slate-900">{timeFormatter(snapshot.arrivalTime)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-xl ring-1 ring-slate-200">
          <h2 className="text-lg font-black text-slate-950">Aircraft telemetry</h2>
          <dl className="mt-5 grid gap-3">
            {stats.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
                <dt className="text-sm text-slate-500">{item.label}</dt>
                <dd className="text-right text-sm font-bold text-slate-950">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </aside>
    </section>
  );
}
