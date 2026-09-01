import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { formatDateTime, passengerFullName, statusTone } from "@/lib/format";
import { getTicketByVerificationToken } from "@/lib/flight-data";

export const dynamic = "force-dynamic";

export default async function VerifyTokenPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const bundle = await getTicketByVerificationToken(token);

  return (
    <main className="min-h-screen bg-white">
      <SiteHeader />
      <section className="bg-white px-4 py-16 text-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#1565c0]">QR verification</p>
          <h1 className="mt-3 text-5xl font-semibold">Secure ticket check</h1>
          <p className="mt-4 max-w-2xl text-slate-600">
            QR tokens are backend-issued verification tokens. Browser-supplied passenger or ticket details are ignored.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {bundle ? (
          <div className="rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-slate-200">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-600">Authentic QR token</p>
                <h2 className="mt-2 text-3xl font-black text-slate-950">Ticket is {bundle.ticket.status}</h2>
                <p className="mt-2 text-slate-600">The token resolves to a real Ticket → Booking → Flight record.</p>
              </div>
              <span className={`rounded-full px-4 py-2 text-sm font-black ring-1 ${statusTone(bundle.ticket.status)}`}>{bundle.ticket.status}</span>
            </div>
            <div className="mt-7 grid gap-4 md:grid-cols-2">
              {[
                ["Passenger", passengerFullName(bundle.passengers[0]?.firstName, bundle.passengers[0]?.lastName)],
                ["Airline", bundle.airline ? `${bundle.airline.name} (${bundle.airline.code})` : "Plane finder"],
                ["Booking reference", bundle.booking.bookingReference],
                ["Ticket number", bundle.ticket.ticketNumber],
                ["Flight", bundle.flight.flightNumber],
                ["Route", `${bundle.flight.origin} → ${bundle.flight.destination}`],
                ["Departure", formatDateTime(bundle.flight.departureTime)],
                ["Seat", bundle.ticket.seat],
                ["Tracking ID", bundle.trackingSession?.trackingId ?? "Pending"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
                  <p className="mt-1 break-words font-black text-slate-950">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href={`/ticket/${bundle.ticket.ticketNumber}`} className="rounded-2xl bg-slate-950 px-6 py-3 text-center font-black text-white">Open ticket</Link>
              {bundle.trackingSession ? <Link href={`/track/${bundle.trackingSession.trackingId}`} className="rounded-2xl bg-sky-600 px-6 py-3 text-center font-black text-white">Track flight</Link> : null}
            </div>
          </div>
        ) : (
          <div className="rounded-[2rem] border border-red-200 bg-red-50 p-8 shadow-xl">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-red-600">Invalid QR</p>
            <h2 className="mt-2 text-3xl font-black text-red-950">Ticket verification failed.</h2>
            <p className="mt-2 text-red-800">No ticket exists for this backend-issued verification token.</p>
          </div>
        )}
      </section>
    </main>
  );
}
