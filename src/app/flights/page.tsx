import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { LiveFlightsBoard } from "@/components/LiveFlightsBoard";
import { getAirlinesWithStats, getRadarFlights } from "@/lib/radar";

export const dynamic = "force-dynamic";

export default async function FlightsPage() {
  const [flights, airlineStats] = await Promise.all([getRadarFlights(), getAirlinesWithStats()]);
  const airborne = flights.filter((flight) => flight.status === "En Route" || flight.status.includes("In flight")).length;

  return (
    <main className="min-h-screen bg-white">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#1565c0]">Flights by airline</p>
            <h1 className="mt-3 text-4xl font-semibold text-slate-900 sm:text-5xl">All live flights</h1>
            <p className="mt-3 max-w-2xl text-slate-600">
              Filter by airline, status, or search by flight number and city. Every row links to its tracker.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/live" className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50">
              Open map
            </Link>
            <span className="rounded-full bg-emerald-50 px-5 py-2.5 font-mono text-sm font-semibold text-emerald-800">
              {airborne} airborne
            </span>
          </div>
        </div>

        <div className="mt-8">
          <LiveFlightsBoard initialFlights={flights} airlines={airlineStats.map((item) => item.airline)} />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {airlineStats.map(({ airline, liveFlights, totalFlights }) => (
            <Link key={airline.id} href={`/airlines/${airline.code}`} className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-300">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl text-sm font-semibold text-white" style={{ background: airline.color }}>
                  {airline.code}
                </span>
                <div>
                  <p className="font-semibold text-slate-900">{airline.name}</p>
                  <p className="text-xs text-slate-500">{airline.hub} ({airline.hubCode}) hub</p>
                </div>
                <span className="ml-auto rounded-full bg-emerald-50 px-3 py-1 font-mono text-xs font-semibold text-emerald-800">{liveFlights} live</span>
              </div>
              <p className="mt-3 text-xs text-slate-500">{totalFlights} flights tracked on the network</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
