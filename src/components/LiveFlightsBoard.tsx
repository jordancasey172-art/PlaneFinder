"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { RadarAirline, RadarFlight } from "@/lib/radar";
import { formatTime, statusTone } from "@/lib/format";

type LiveFlightsBoardProps = {
  initialFlights: RadarFlight[];
  airlines: RadarAirline[];
};

export function LiveFlightsBoard({ initialFlights, airlines }: LiveFlightsBoardProps) {
  const [flights, setFlights] = useState(initialFlights);
  const [airlineFilter, setAirlineFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [live, setLive] = useState(true);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    let stopped = false;

    async function tick() {
      try {
        const response = await fetch("/api/radar", { cache: "no-store" });
        if (!response.ok) return;
        const payload = (await response.json()) as { flights: RadarFlight[] };
        if (!stopped) setFlights(payload.flights);
      } catch {
        // keep last known data
      }
    }

    void tick();
    timer = setInterval(() => void tick(), 4000);

    return () => {
      stopped = true;
      if (timer) clearInterval(timer);
    };
  }, []);

  const statuses = useMemo(() => [...new Set(flights.map((flight) => flight.status))].sort(), [flights]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return flights
      .filter((flight) => {
        if (airlineFilter !== "all" && flight.airline?.code !== airlineFilter) return false;
        if (statusFilter !== "all" && flight.status !== statusFilter) return false;
        if (query) {
          const haystack = `${flight.flightNumber} ${flight.origin} ${flight.destination} ${flight.originCode} ${flight.destinationCode} ${flight.airline?.name ?? ""}`.toLowerCase();
          if (!haystack.includes(query)) return false;
        }
        return true;
      })
      .sort((a, b) => a.flightNumber.localeCompare(b.flightNumber));
  }, [flights, airlineFilter, statusFilter, search]);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
          </span>
          <h2 className="text-lg font-semibold text-slate-900">Live flights board</h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-widest text-slate-500">
            {flights.length} flights
          </span>
          <button
            type="button"
            onClick={() => setLive((value) => !value)}
            className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-widest ${live ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-500"}`}
          >
            {live ? "Live updates on" : "Live updates off"}
          </button>
        </div>
        <div className="grid flex-1 gap-2 md:grid-cols-[1fr_190px_170px]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search flight, city, or airline…"
            className="w-full rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-[#1565c0]/20"
          />
          <select value={airlineFilter} onChange={(event) => setAirlineFilter(event.target.value)} className="rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none">
            <option value="all">All airlines</option>
            {airlines.map((airline) => (
              <option key={airline.id} value={airline.code}>{airline.name} ({airline.code})</option>
            ))}
          </select>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none">
            <option value="all">All statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm text-slate-700">
          <thead className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-[0.16em] text-slate-500">
            <tr>
              <th className="px-5 py-3.5">Airline</th>
              <th className="px-5 py-3.5">Flight</th>
              <th className="px-5 py-3.5">Route</th>
              <th className="px-5 py-3.5">Departure</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Speed</th>
              <th className="px-5 py-3.5 text-right">Altitude</th>
              <th className="px-5 py-3.5">Tracking</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((flight) => (
              <tr key={flight.flightNumber} className="transition hover:bg-slate-50">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <span className="grid h-7 w-7 place-items-center rounded-lg text-[10px] font-black text-white" style={{ background: flight.airline?.color ?? "#f5b42b" }}>
                      {flight.airline?.code ?? "PF"}
                    </span>
                    <span className="hidden font-semibold text-slate-700 xl:inline">{flight.airline?.name ?? "Plane Finder"}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 font-mono font-semibold text-slate-900">{flight.flightNumber}</td>
                <td className="px-5 py-3.5">
                  <span className="font-semibold text-slate-900">{flight.originCode}</span>
                  <span className="mx-1.5 text-slate-400">→</span>
                  <span className="font-semibold text-slate-900">{flight.destinationCode}</span>
                  <span className="ml-2 hidden text-xs text-slate-500 lg:inline">{flight.aircraft}</span>
                </td>
                <td className="px-5 py-3.5 font-mono text-xs text-slate-400">{formatTime(flight.departureTime)} UTC</td>
                <td className="px-5 py-3.5">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ring-1 ${statusTone(flight.status)}`}>{flight.status}</span>
                </td>
                <td className="px-5 py-3.5 text-right font-mono text-xs text-slate-300">{Math.round(flight.speed)} kt</td>
                <td className="px-5 py-3.5 text-right font-mono text-xs text-slate-300">{Math.round(flight.altitude).toLocaleString()} ft</td>
                <td className="px-5 py-3.5">
                  <Link href={`/track/${flight.trackingId}`} className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-[#1565c0] hover:bg-sky-100">
                    Track
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-slate-400">No flights match the current filters.</div>
        ) : null}
      </div>
    </div>
  );
}
