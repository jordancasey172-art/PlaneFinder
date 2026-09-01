import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { formatTime, statusTone } from "@/lib/format";
import { getAirlinesWithStats, getRadarFlights } from "@/lib/radar";

export const dynamic = "force-dynamic";

export default async function AirlineDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const normalizedCode = code.toUpperCase();
  const [airlineStats, flights] = await Promise.all([getAirlinesWithStats(), getRadarFlights()]);
  const airlineStat = airlineStats.find((item) => item.airline.code === normalizedCode);

  if (!airlineStat) notFound();

  const { airline } = airlineStat;
  const airlineFlights = flights.filter((flight) => flight.airline?.code === normalizedCode);
  const airborne = airlineFlights.filter((flight) => flight.status.includes("In flight")).length;

  return (
    <main className="min-h-screen bg-white">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Link href="/airlines" className="text-sm font-semibold text-[#1565c0] hover:text-[#0d47a1]">← All airlines</Link>

        <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white" style={{ background: `linear-gradient(135deg, ${airline.color}14, #ffffff)` }}>
          <div className="p-8 sm:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-5">
                <span className="grid h-20 w-20 place-items-center rounded-2xl text-2xl font-semibold text-white shadow-sm" style={{ background: airline.color }}>
                  {airline.code}
                </span>
                <div>
                  <h1 className="text-4xl font-semibold text-slate-900 sm:text-5xl">{airline.name}</h1>
                  <p className="mt-2 text-sm uppercase tracking-[0.2em] text-slate-500">Callsign {airline.callsign}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-2xl font-semibold text-slate-900">{airlineFlights.length}</p>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Flights</p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-2xl font-semibold text-emerald-800">{airborne}</p>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-700">Airborne</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-2xl font-semibold text-slate-900">{airline.hub}</p>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Hub</p>
                </div>
              </div>
            </div>
            <p className="mt-6 max-w-2xl text-slate-600">
              Based in {airline.country} with its main hub at {airline.hub} ({airline.hubCode}).
            </p>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-xl font-semibold text-slate-900">{airline.name} live flights</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm text-slate-700">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-[0.16em] text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Flight</th>
                  <th className="px-5 py-3.5">Aircraft</th>
                  <th className="px-5 py-3.5">Route</th>
                  <th className="px-5 py-3.5">Departure</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Speed</th>
                  <th className="px-5 py-3.5 text-right">Altitude</th>
                  <th className="px-5 py-3.5">Tracking</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {airlineFlights.map((flight) => (
                  <tr key={flight.flightNumber} className="transition hover:bg-slate-50">
                    <td className="px-5 py-3.5 font-mono font-semibold text-slate-900">{flight.flightNumber}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">{flight.aircraft}</td>
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-slate-900">{flight.originCode}</span>
                      <span className="mx-1.5 text-slate-400">→</span>
                      <span className="font-semibold text-slate-900">{flight.destinationCode}</span>
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
            {airlineFlights.length === 0 ? <div className="p-10 text-center text-slate-400">No flights for this airline yet.</div> : null}
          </div>
        </div>
      </section>
    </main>
  );
}
