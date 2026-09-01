import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { formatDateTime, formatMoney, statusTone } from "@/lib/format";
import { getAvailableSeats, getFlightWithAirline } from "@/lib/flight-data";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ flightId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function stringParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function BookFlightPage({ params, searchParams }: PageProps) {
  const { flightId } = await params;
  const query = (await searchParams) ?? {};
  const result = await getFlightWithAirline(flightId);

  if (!result) notFound();

  const { flight, airline } = result;
  const availableSeats = await getAvailableSeats(flight.id, flight.capacity);
  const passengers = stringParam(query, "passengers") || "1";
  const error = stringParam(query, "error");

  return (
    <main className="min-h-screen bg-white">
      <SiteHeader />
      <section className="bg-white px-4 py-12 text-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link href="/" className="text-sm font-semibold text-[#1565c0] hover:text-[#0d47a1]">← Back to search</Link>
          <div className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <aside className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#1565c0]">Selected flight</p>
              <div className="mt-4 flex items-center gap-3">
                {airline ? (
                  <span className="grid h-12 w-12 place-items-center rounded-2xl text-sm font-black text-white" style={{ background: airline.color }}>
                    {airline.code}
                  </span>
                ) : null}
                <div>
                  <h1 className="text-5xl font-black">{flight.flightNumber}</h1>
                  <p className="text-sm font-semibold text-slate-500">{airline ? `${airline.name} • ${flight.aircraft}` : flight.aircraft}</p>
                </div>
              </div>
              <p className="mt-4 text-xl text-slate-700">{flight.origin} → {flight.destination}</p>
              <span className={`mt-6 inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusTone(flight.status)}`}>{flight.status}</span>
              <dl className="mt-8 grid gap-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Departure</dt>
                  <dd className="mt-1 font-semibold">{formatDateTime(flight.departureTime)}</dd>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Arrival</dt>
                  <dd className="mt-1 font-semibold">{formatDateTime(flight.arrivalTime)}</dd>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Base fare</dt>
                  <dd className="mt-1 font-semibold">{formatMoney(flight.basePriceCents)}</dd>
                </div>
                <div className="rounded-2xl bg-[#1565c0] p-4 text-white">
                  <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-100">Secure payment</dt>
                  <dd className="mt-1 text-sm font-medium">Your fare is processed securely and a boarding pass is issued immediately.</dd>
                </div>
              </dl>
            </aside>

            <form action="/api/bookings" method="post" className="rounded-[2rem] bg-white p-6 shadow-2xl ring-1 ring-slate-200 sm:p-8">
              <input type="hidden" name="flightId" value={flight.id} />
              <input type="hidden" name="passengers" value={passengers} />
              <div className="flex flex-col gap-3 border-b border-slate-200 pb-6 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-600">Passenger information</p>
                  <h2 className="mt-2 text-3xl font-black text-slate-950">Complete booking</h2>
                </div>
                <p className="max-w-md text-sm leading-6 text-slate-600">
                  Ticket numbers, booking references, and tracking IDs are generated only after backend validation.
                </p>
              </div>

              {error ? (
                <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{error}</div>
              ) : null}

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-bold text-slate-700">
                  First name
                  <input required name="firstName" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:ring-4 focus:ring-amber-300" />
                </label>
                <label className="grid gap-2 text-sm font-bold text-slate-700">
                  Last name
                  <input required name="lastName" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:ring-4 focus:ring-amber-300" />
                </label>
                <label className="grid gap-2 text-sm font-bold text-slate-700">
                  Email
                  <input required type="email" name="email" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:ring-4 focus:ring-amber-300" />
                </label>
                <label className="grid gap-2 text-sm font-bold text-slate-700">
                  Phone
                  <input name="phone" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:ring-4 focus:ring-amber-300" />
                </label>
                <label className="grid gap-2 text-sm font-bold text-slate-700">
                  Nationality
                  <input name="nationality" placeholder="United States" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:ring-4 focus:ring-amber-300" />
                </label>
                <label className="grid gap-2 text-sm font-bold text-slate-700">
                  Passport / document number
                  <input name="documentNumber" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:ring-4 focus:ring-amber-300" />
                </label>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-bold text-slate-700">
                  Cabin/class
                  <select name="cabinClass" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:ring-4 focus:ring-amber-300">
                    {flight.cabinClasses.map((cabin) => (
                      <option key={cabin} value={cabin}>{cabin}</option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-bold text-slate-700">
                  Seat
                  <select required name="seat" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:ring-4 focus:ring-amber-300">
                    {availableSeats.slice(0, 84).map((seat) => (
                      <option key={seat} value={seat}>{seat}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="mt-8 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Payment</p>
                    <p className="mt-2 text-sm text-slate-600">Complete payment to confirm your booking and issue a boarding pass.</p>
                  </div>
                  <div className="rounded-2xl bg-white px-5 py-3 text-right shadow-sm ring-1 ring-slate-200">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Due now</p>
                    <p className="text-2xl font-black text-slate-950">{formatMoney(flight.basePriceCents)}</p>
                  </div>
                </div>
                <label className="mt-5 flex gap-3 text-sm font-semibold text-slate-700">
                  <input required type="checkbox" name="sandboxConsent" className="mt-1 h-4 w-4" />
                  I confirm the passenger details are correct and authorize this payment.
                </label>
              </div>

              <button className="mt-8 w-full rounded-2xl bg-slate-950 px-6 py-4 text-lg font-black text-white hover:bg-slate-800" type="submit">
                Confirm payment & issue ticket
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
