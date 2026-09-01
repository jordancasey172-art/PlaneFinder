import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { getBookingByReference } from "@/lib/flight-data";
import { formatDateTime, formatMoney, passengerFullName, statusTone } from "@/lib/format";

export const dynamic = "force-dynamic";

type TrackBookingProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function stringParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function TrackBookingPage({ searchParams }: TrackBookingProps) {
  const params = (await searchParams) ?? {};
  const query = stringParam(params, "ref");
  const bundle = query ? await getBookingByReference(query) : null;

  return (
    <main className="min-h-screen bg-white">
      <SiteHeader />

      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Link href="/" className="text-sm font-bold text-blue-600 hover:text-blue-700">← Back to Home</Link>

        <div className="mt-8">
          <h1 className="text-4xl font-black text-slate-900">Track Your Booking</h1>
          <p className="mt-2 text-slate-600">Enter your booking reference to find your flight and track its progress.</p>

          <form method="get" className="mt-8 flex flex-col gap-3 sm:flex-row">
            <input
              name="ref"
              defaultValue={query}
              placeholder="PF-XXXXXX"
              className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500"
            />
            <button className="rounded-lg bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700 transition" type="submit">
              Search
            </button>
          </form>

          {bundle ? (
            <div className="mt-10 space-y-6">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">Booking Confirmed</p>
                <h2 className="mt-2 text-3xl font-black text-slate-900">{bundle.booking.bookingReference}</h2>
                <p className="mt-1 text-slate-600">{bundle.booking.status}</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-white p-6">
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">Flight Details</p>
                  <h3 className="mt-3 text-3xl font-black text-slate-900">{bundle.flight.flightNumber}</h3>
                  {bundle.airline ? (
                    <p className="mt-2 text-slate-600">{bundle.airline.name} • {bundle.flight.aircraft}</p>
                  ) : null}
                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <div>
                      <p className="text-xs font-bold uppercase text-slate-500">Route</p>
                      <p className="font-semibold text-slate-900">
                        {bundle.flight.origin} ({bundle.flight.originCode}) → {bundle.flight.destination} ({bundle.flight.destinationCode})
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-slate-500">Departure</p>
                      <p className="font-semibold text-slate-900">{formatDateTime(bundle.flight.departureTime)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-slate-500">Arrival</p>
                      <p className="font-semibold text-slate-900">{formatDateTime(bundle.flight.arrivalTime)}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-6">
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">Passenger Information</p>
                  <div className="mt-4 space-y-3">
                    {bundle.passengers.map((passenger, index) => (
                      <div key={passenger.id}>
                        <p className="text-xs font-bold uppercase text-slate-500">Passenger {index + 1}</p>
                        <p className="font-semibold text-slate-900">{passengerFullName(passenger.firstName, passenger.lastName)}</p>
                      </div>
                    ))}
                    {bundle.tickets[0] ? (
                      <>
                        <div className="border-t border-slate-200 pt-3">
                          <p className="text-xs font-bold uppercase text-slate-500">Seat</p>
                          <p className="font-semibold text-slate-900">{bundle.tickets[0].seat}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase text-slate-500">Class</p>
                          <p className="font-semibold text-slate-900">{bundle.tickets[0].cabinClass}</p>
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>

              {bundle.tickets.map((ticket) => (
                <div key={ticket.id} className="rounded-lg border border-slate-200 bg-white p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">Ticket</p>
                      <p className="mt-2 font-mono text-lg font-bold text-slate-900">{ticket.ticketNumber}</p>
                      <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusTone(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Link href={`/ticket/${ticket.ticketNumber}`} className="rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-bold text-white hover:bg-blue-700 transition">
                        View Ticket
                      </Link>
                      <a href={`/api/tickets/${ticket.ticketNumber}/pdf`} className="rounded-lg border border-slate-300 px-4 py-2 text-center text-sm font-bold text-slate-900 hover:bg-slate-50 transition">
                        PDF
                      </a>
                    </div>
                  </div>
                </div>
              ))}

              {bundle.trackingSession ? (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">Live Tracking</p>
                  <p className="mt-2 text-slate-700">
                    Track your flight using ID: <span className="font-mono font-bold">{bundle.trackingSession.trackingId}</span>
                  </p>
                  <Link href={`/live?track=${bundle.trackingSession.trackingId}`} className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700 transition">
                    Open Live Tracker →
                  </Link>
                </div>
              ) : null}

              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">Order Summary</p>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Passengers</span>
                    <span className="font-semibold text-slate-900">{bundle.booking.passengerCount} × {bundle.booking.cabinClass}</span>
                  </div>
                  {bundle.payment ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Payment Status</span>
                        <span className="font-semibold text-emerald-700">{bundle.payment.status}</span>
                      </div>
                    </>
                  ) : null}
                  <div className="border-t border-slate-200 pt-2 flex justify-between">
                    <span className="font-bold text-slate-900">Total</span>
                    <span className="font-bold text-slate-900">{formatMoney(bundle.booking.totalAmountCents)}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : query ? (
            <div className="mt-10 rounded-lg border border-red-200 bg-red-50 p-6">
              <p className="font-bold text-red-900">Booking Not Found</p>
              <p className="mt-1 text-red-800">Please check your booking reference and try again.</p>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
