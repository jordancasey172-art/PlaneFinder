import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { RadarMapShell } from "@/components/RadarMapShell";
import { getAirlinesWithStats, getHomepageStats, getRadarFlights } from "@/lib/radar";
import { searchFlights } from "@/lib/flight-data";
import { formatDateTime, formatMoney, statusTone } from "@/lib/format";

export const dynamic = "force-dynamic";

type HomeSearchParams = Promise<Record<string, string | string[] | undefined>>;

function stringParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function isAirborne(status: string) {
  return status === "En Route" || status.toLowerCase().includes("in flight");
}

export default async function HomePage({ searchParams }: { searchParams?: HomeSearchParams }) {
  const params = (await searchParams) ?? {};
  const filters = {
    origin: stringParam(params, "origin"),
    destination: stringParam(params, "destination"),
    date: stringParam(params, "date"),
    passengers: stringParam(params, "passengers") || "1",
  };
  const [flightResults, stats, airlineStats, radarFlights] = await Promise.all([
    searchFlights(filters),
    getHomepageStats(),
    getAirlinesWithStats(),
    getRadarFlights(),
  ]);
  const livePreview = radarFlights.filter((flight) => isAirborne(flight.status)).slice(0, 8);

  return (
    <main className="min-h-screen bg-white">
      <SiteHeader />

      <section className="bg-white text-slate-900">
        <div className="mx-auto max-w-[1600px] px-4 pb-8 pt-8 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#1565c0]">Worldwide coverage</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Live flight map</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Follow {stats.liveFlights} flights across {stats.airlines} airlines. Search a route, open a tracker, or book in a few steps.
              </p>
            </div>
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <p className="text-2xl font-semibold text-slate-900">{stats.airborne}</p>
                <p className="text-slate-500">Airborne</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900">{stats.liveFlights}</p>
                <p className="text-slate-500">Flights</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900">{stats.airlines}</p>
                <p className="text-slate-500">Airlines</p>
              </div>
            </div>
          </div>
          <RadarMapShell initialFlights={radarFlights} airlines={airlineStats.map((item) => item.airline)} />
        </div>
      </section>

      <section id="search" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1565c0]">Book</p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-900">Search flights</h2>
            </div>
            <p className="max-w-xl text-sm text-slate-500">Enter origin, destination and travel date to see available services.</p>
          </div>
          <form className="mt-6 grid gap-4 md:grid-cols-[1fr_1fr_180px_140px_auto]" action="/#search" method="get">
            <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Origin
              <input name="origin" defaultValue={filters.origin} placeholder="London" className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#1565c0] focus:ring-2 focus:ring-[#1565c0]/20" />
            </label>
            <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Destination
              <input name="destination" defaultValue={filters.destination} placeholder="New York" className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#1565c0] focus:ring-2 focus:ring-[#1565c0]/20" />
            </label>
            <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Date
              <input name="date" type="date" defaultValue={filters.date} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#1565c0] focus:ring-2 focus:ring-[#1565c0]/20" />
            </label>
            <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Passengers
              <input name="passengers" type="number" min="1" max="9" defaultValue={filters.passengers} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#1565c0] focus:ring-2 focus:ring-[#1565c0]/20" />
            </label>
            <button className="rounded-md bg-[#1565c0] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1e88e5] md:self-end" type="submit">
              Search
            </button>
          </form>
        </div>

        <div className="mt-6 grid gap-3">
          {flightResults.slice(0, 8).map(({ flight, airline }) => (
            <article key={flight.id} className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="grid gap-4 md:grid-cols-[150px_1fr] md:items-center">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-slate-900">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{airline?.name ?? "Airline"}</p>
                  <h3 className="mt-1 font-mono text-2xl font-semibold">{flight.flightNumber}</h3>
                  <span className={`mt-3 inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${statusTone(flight.status)}`}>{flight.status}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {flight.originCode} → {flight.destinationCode}
                  </p>
                  <h4 className="mt-1 text-xl font-semibold text-slate-900">
                    {flight.origin} to {flight.destination}
                  </h4>
                  <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
                    <span>Departs {formatDateTime(flight.departureTime)}</span>
                    <span>Arrives {formatDateTime(flight.arrivalTime)}</span>
                    <span>From {formatMoney(flight.basePriceCents)}</span>
                  </div>
                </div>
              </div>
              <Link href={`/book/${flight.id}?passengers=${encodeURIComponent(filters.passengers)}`} className="rounded-md bg-[#1565c0] px-5 py-3 text-center text-sm font-semibold text-white hover:bg-[#1e88e5]">
                Select
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-100 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1565c0]">Airborne now</p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-900">Flights in the air</h2>
            </div>
            <Link href="/live" className="text-sm font-semibold text-[#1565c0] hover:text-[#0d47a1]">Open live map →</Link>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {livePreview.map((flight) => (
              <Link key={flight.flightNumber} href={`/track/${flight.trackingId}`} className="rounded-xl border border-slate-200 p-4 hover:border-[#1565c0]/40">
                <div className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-md text-[11px] font-semibold text-white" style={{ background: flight.airline?.color ?? "#1565c0" }}>
                    {flight.airline?.code ?? "PF"}
                  </span>
                  <div>
                    <p className="font-mono text-sm font-semibold text-slate-900">{flight.flightNumber}</p>
                    <p className="text-xs text-slate-500">{flight.airline?.name}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm font-medium text-slate-800">
                  {flight.originCode} → {flight.destinationCode}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {Math.round(flight.speed)} kt · {Math.round(flight.altitude).toLocaleString()} ft
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1565c0]">Airlines</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-900">Carriers on the network</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {airlineStats.map(({ airline, liveFlights }) => (
            <Link key={airline.id} href={`/airlines/${airline.code}`} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300">
              <span className="grid h-10 w-10 place-items-center rounded-md text-xs font-semibold text-white" style={{ background: airline.color }}>
                {airline.code}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{airline.name}</p>
                <p className="text-xs text-slate-500">{liveFlights} airborne</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
