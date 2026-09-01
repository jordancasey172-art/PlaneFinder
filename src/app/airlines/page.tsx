import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { getAirlinesWithStats } from "@/lib/radar";

export const dynamic = "force-dynamic";

export default async function AirlinesPage() {
  const airlineStats = await getAirlinesWithStats();
  const totalLive = airlineStats.reduce((sum, item) => sum + item.liveFlights, 0);

  return (
    <main className="min-h-screen bg-white">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#1565c0]">Airlines directory</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-900 sm:text-5xl">Fly with our network</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          {airlineStats.length} airlines on the Plane Finder network with {totalLive} airborne flights right now.
          Choose an airline to browse its routes and live aircraft.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {airlineStats.map(({ airline, liveFlights, totalFlights }) => (
            <Link key={airline.id} href={`/airlines/${airline.code}`} className="group rounded-xl border border-slate-200 bg-white p-6 transition hover:border-slate-300">
              <div className="flex items-start justify-between">
                <span className="grid h-14 w-14 place-items-center rounded-xl text-lg font-semibold text-white" style={{ background: airline.color }}>
                  {airline.code}
                </span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 font-mono text-xs font-semibold text-emerald-800">{liveFlights} live</span>
              </div>
              <h2 className="mt-5 text-2xl font-semibold text-slate-900 group-hover:text-[#1565c0]">{airline.name}</h2>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">Callsign {airline.callsign}</p>
              <div className="mt-5 grid gap-2 text-sm text-slate-600">
                <p><span className="text-slate-400">Country:</span> {airline.country}</p>
                <p><span className="text-slate-400">Hub:</span> {airline.hub} ({airline.hubCode})</p>
                <p><span className="text-slate-400">Flights tracked:</span> {totalFlights}</p>
              </div>
              <p className="mt-5 text-sm font-semibold text-[#1565c0]">Browse routes →</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
