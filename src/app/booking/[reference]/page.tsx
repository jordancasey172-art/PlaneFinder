import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { formatDateTime, formatMoney, passengerFullName, statusTone } from "@/lib/format";
import { getBookingByReference } from "@/lib/flight-data";

export const dynamic = "force-dynamic";

export default async function BookingConfirmationPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const bundle = await getBookingByReference(reference);

  if (!bundle) notFound();

  const passenger = bundle.passengers[0];
  const ticket = bundle.tickets[0];
  const trackingId = bundle.trackingSession?.trackingId;

  return (
    <main className="min-h-screen bg-white">
      <SiteHeader />
      <section className="bg-white px-4 py-16 text-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#1565c0]">Booking confirmed</p>
                <div className="mt-3 flex items-center gap-3">
                  {bundle.airline ? (
                    <span className="grid h-12 w-12 place-items-center rounded-2xl text-sm font-black text-white" style={{ background: bundle.airline.color }}>
                      {bundle.airline.code}
                    </span>
                  ) : null}
                  <h1 className="text-4xl font-black sm:text-6xl">Your boarding pass is ready.</h1>
                </div>
                <p className="mt-4 max-w-2xl text-slate-600">
                  {bundle.airline ? `${bundle.airline.name} • ` : ""}The booking, ticket, payment, and tracking records were created
                  by the backend and stored in PostgreSQL.
                </p>
              </div>
              <span className={`inline-flex self-start rounded-full px-4 py-2 text-sm font-black ring-1 ${statusTone(bundle.booking.status)}`}>{bundle.booking.status}</span>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                ["Booking reference", bundle.booking.bookingReference],
                ["Ticket number", ticket?.ticketNumber ?? "Pending"],
                ["Flight number", bundle.flight.flightNumber],
                ["Tracking ID", trackingId ?? "Pending"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>
                  <p className="mt-2 break-words text-xl font-semibold text-slate-900">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
        <div className="rounded-[2rem] bg-white p-6 shadow-xl ring-1 ring-slate-200 sm:p-8">
          <h2 className="text-2xl font-black text-slate-950">Trip summary</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Passenger</p>
              <p className="mt-2 text-xl font-black text-slate-950">{passengerFullName(passenger?.firstName, passenger?.lastName)}</p>
              <p className="text-sm text-slate-500">{bundle.booking.customerEmail}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Payment</p>
              <p className="mt-2 text-xl font-black text-slate-950">{formatMoney(bundle.booking.totalAmountCents)}</p>
              <p className="text-sm text-slate-500">{bundle.payment?.providerPaymentId ?? "Payment"} • {bundle.payment?.status ?? "Succeeded"}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5 md:col-span-2">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Route</p>
              <p className="mt-2 text-2xl font-black text-slate-950">{bundle.flight.origin} ({bundle.flight.originCode}) → {bundle.flight.destination} ({bundle.flight.destinationCode})</p>
              <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                <span><strong className="block text-slate-950">Departure</strong>{formatDateTime(bundle.flight.departureTime)}</span>
                <span><strong className="block text-slate-950">Arrival</strong>{formatDateTime(bundle.flight.arrivalTime)}</span>
                <span><strong className="block text-slate-950">Seat</strong>{ticket?.seat ?? "Pending"}</span>
                <span><strong className="block text-slate-950">Cabin/class</strong>{ticket?.cabinClass ?? bundle.booking.cabinClass}</span>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          {ticket ? (
            <>
              <Link href={`/ticket/${ticket.ticketNumber}`} className="block rounded-[1.5rem] bg-slate-950 px-6 py-5 text-center font-black text-white shadow-xl hover:bg-slate-800">
                View online ticket
              </Link>
              <a href={`/api/tickets/${ticket.ticketNumber}/pdf`} className="block rounded-[1.5rem] bg-amber-300 px-6 py-5 text-center font-black text-slate-950 shadow-xl hover:bg-amber-200">
                Download PDF ticket
              </a>
              <a href={`/api/tickets/${ticket.ticketNumber}/image`} className="block rounded-[1.5rem] bg-white px-6 py-5 text-center font-black text-slate-950 shadow-xl ring-1 ring-slate-200 hover:bg-slate-50">
                Download PNG ticket
              </a>
              <Link href={`/verify/${ticket.verificationToken}`} className="block rounded-[1.5rem] bg-white px-6 py-5 text-center font-black text-slate-950 shadow-xl ring-1 ring-slate-200 hover:bg-slate-50">
                Verify ticket
              </Link>
            </>
          ) : null}
          {trackingId ? (
            <Link href={`/track/${trackingId}`} className="block rounded-[1.5rem] bg-sky-600 px-6 py-5 text-center font-black text-white shadow-xl hover:bg-sky-500">
              Open live tracker
            </Link>
          ) : null}
        </aside>
      </section>
    </main>
  );
}
