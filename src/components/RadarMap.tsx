"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import L, { type LatLngExpression } from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import Link from "next/link";
import type { RadarAirline, RadarFlight } from "@/lib/radar";
import { statusTone } from "@/lib/format";

type RadarMapProps = {
  initialFlights: RadarFlight[];
  airlines: RadarAirline[];
};

function FlyToSelection({ position, selected }: { position: LatLngExpression; selected: string | null }) {
  const map = useMap();
  const lastSelected = useRef<string | null>(null);

  useEffect(() => {
    if (selected && selected !== lastSelected.current) {
      lastSelected.current = selected;
      map.flyTo(position, 5, { duration: 1.4 });
    }
  }, [selected, position, map]);

  return null;
}

function planeIcon(color: string, heading: number, selected: boolean) {
  return L.divIcon({
    className: "",
    html: `<div class="radar-plane" style="transform: rotate(${heading}deg); border-color: ${selected ? "#ffffff" : color}; box-shadow: 0 0 0 6px ${color}33, 0 12px 28px rgba(0,0,0,.45);"><span style="background:${color}">✈</span></div>`,
    iconSize: [46, 46],
    iconAnchor: [23, 23],
  });
}

export function RadarMap({ initialFlights, airlines }: RadarMapProps) {
  const [flights, setFlights] = useState(initialFlights);
  const [selected, setSelected] = useState<string | null>(null);
  const [airlineFilter, setAirlineFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [updatedAt, setUpdatedAt] = useState(() => new Date());
  const markerRefs = useRef<Record<string, L.Marker | null>>({});

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    let stopped = false;

    async function tick() {
      try {
        const response = await fetch("/api/radar", { cache: "no-store" });
        if (!response.ok) return;
        const payload = (await response.json()) as { flights: RadarFlight[] };
        if (!stopped) {
          setFlights(payload.flights);
          setUpdatedAt(new Date());
        }
      } catch {
        // keep last known positions during transient errors
      }
    }

    void tick();
    timer = setInterval(() => void tick(), 3000);

    return () => {
      stopped = true;
      if (timer) clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!selected) return;
    const marker = markerRefs.current[selected];
    if (marker) marker.openPopup();
  }, [selected]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return flights.filter((flight) => {
      if (airlineFilter !== "all" && flight.airline?.code !== airlineFilter) return false;
      if (statusFilter !== "all" && flight.status !== statusFilter) return false;
      if (query) {
        const haystack = `${flight.flightNumber} ${flight.origin} ${flight.destination} ${flight.originCode} ${flight.destinationCode} ${flight.airline?.name ?? ""}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [flights, airlineFilter, statusFilter, search]);

  const airborne = flights.filter((flight) => flight.status === "En Route" || flight.status.includes("In flight")).length;
  const statuses = useMemo(() => [...new Set(flights.map((flight) => flight.status))].sort(), [flights]);

  return (
    <section className="grid gap-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="relative h-[62vh] min-h-[480px] lg:h-[72vh]">
        <MapContainer center={[28, 8]} zoom={2} scrollWheelZoom className="h-full w-full" minZoom={2} worldCopyJump>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          {filtered.map((flight) => (
            <Marker
              key={flight.flightNumber}
              position={[flight.lat, flight.lng]}
                icon={planeIcon(flight.airline?.color ?? "#1565c0", flight.heading, selected === flight.flightNumber)}
              ref={(marker) => {
                markerRefs.current[flight.flightNumber] = marker;
              }}
            >
              <Popup>
                <div className="w-60 font-sans text-slate-900">
                  <div className="flex items-center gap-2">
                    <span className="grid h-7 w-7 place-items-center rounded-md text-[11px] font-semibold text-white" style={{ background: flight.airline?.color ?? "#1565c0" }}>
                      {flight.airline?.code ?? "PF"}
                    </span>
                    <span className="text-lg font-black">{flight.flightNumber}</span>
                    <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-black ring-1 ${statusTone(flight.status)}`}>{flight.status}</span>
                  </div>
                  <p className="mt-2 text-sm font-semibold">{flight.airline?.name ?? "Plane finder"} • {flight.aircraft}</p>
                  <p className="mt-1 text-sm">
                    {flight.origin} <span className="text-slate-400">({flight.originCode})</span> → {flight.destination}{" "}
                    <span className="text-slate-400">({flight.destinationCode})</span>
                  </p>
                  <p className="mt-2 font-mono text-xs text-slate-500">
                    {Math.round(flight.speed)} kt • {Math.round(flight.altitude).toLocaleString()} ft • {flight.heading}°
                  </p>
                  <Link href={`/track/${flight.trackingId}`} className="mt-3 block rounded-xl bg-slate-950 px-3 py-2 text-center text-sm font-black text-white">
                    Track this flight →
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
          <FlyToSelection
            position={filtered.find((flight) => flight.flightNumber === selected) ? [filtered.find((flight) => flight.flightNumber === selected)!.lat, filtered.find((flight) => flight.flightNumber === selected)!.lng] : [24, 10]}
            selected={selected}
          />
        </MapContainer>

        <div className="pointer-events-none absolute left-4 top-4 rounded-xl border border-slate-200 bg-white/95 px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </span>
            Live positions
          </div>
          <p className="mt-1 font-mono text-[11px] text-slate-500">Updated {updatedAt.toLocaleTimeString()}</p>
        </div>
      </div>

      <aside className="flex min-h-0 flex-col border-t border-slate-200 bg-white lg:border-l lg:border-t-0">
        <div className="space-y-3 border-b border-slate-200 p-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xl font-semibold text-slate-900">{flights.length}</p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Flights</p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-xl font-semibold text-emerald-800">{airborne}</p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-700">Airborne</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xl font-semibold text-slate-900">{airlines.length}</p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Airlines</p>
            </div>
          </div>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search flight, city, or airline…"
            className="w-full rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-[#1565c0]/20"
          />
          <div className="grid grid-cols-2 gap-2">
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

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          <p className="px-2 pb-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
            {filtered.length} flight{filtered.length === 1 ? "" : "s"} on radar
          </p>
          <div className="grid gap-2">
            {filtered.map((flight) => (
              <button
                key={flight.flightNumber}
                type="button"
                onClick={() => setSelected(flight.flightNumber)}
                className={`rounded-xl border p-3 text-left transition ${
                  selected === flight.flightNumber ? "border-[#1565c0] bg-sky-50" : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: flight.airline?.color ?? "#1565c0" }} />
                  <span className="font-mono text-sm font-semibold text-slate-900">{flight.flightNumber}</span>
                  <span className="ml-auto font-mono text-[11px] text-slate-500">{Math.round(flight.speed)} kt</span>
                </div>
                <p className="mt-1.5 text-xs font-semibold text-slate-700">
                  {flight.originCode} → {flight.destinationCode}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500">{flight.airline?.name ?? "Plane finder"} • {flight.status}</p>
              </button>
            ))}
          </div>
        </div>
      </aside>
    </section>
  );
}
