import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { RadarMapShell } from "@/components/RadarMapShell";
import { getAirlinesWithStats, getRadarFlights } from "@/lib/radar";

export const dynamic = "force-dynamic";

export default async function LivePage() {
  const [flights, airlineStats] = await Promise.all([getRadarFlights(), getAirlinesWithStats()]);
  const airborne = flights.filter((flight) => flight.status === "En Route" || flight.status.toLowerCase().includes("in flight")).length;

  return (
    <main className="min-h-screen bg-white">
      <SiteHeader />
      <section className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link href="/" className="text-sm font-medium text-[#1565c0] hover:text-[#0d47a1]">← Home</Link>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">Live flight map</h1>
            <p className="mt-2 text-sm text-slate-600">
              {flights.length} flights · {airborne} airborne · {airlineStats.length} airlines
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/flights" className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50">
              Flight list
            </Link>
            <Link href="/#search" className="rounded-md bg-[#1565c0] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1e88e5]">
              Book
            </Link>
          </div>
        </div>
        <div className="mt-6">
          <RadarMapShell initialFlights={flights} airlines={airlineStats.map((item) => item.airline)} />
        </div>
      </section>
    </main>
  );
}
