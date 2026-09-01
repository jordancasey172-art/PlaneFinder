import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { formatDateTime, passengerFullName, statusTone } from "@/lib/format";
import { getTicketByNumber } from "@/lib/flight-data";
import { buildAbsoluteUrl } from "@/lib/ticket-rendering";

export const dynamic = "force-dynamic";

function originFromHeaders(headerStore: Headers) {
  const host = headerStore.get("host");
  if (!host) return undefined;
  const proto = headerStore.get("x-forwarded-proto") || "http";
  return `${proto}://${host}`;
}

export default async function OnlineTicketPage({ params }: { params: Promise<{ ticketNumber: string }> }) {
  const { ticketNumber } = await params;
  const bundle = await getTicketByNumber(ticketNumber);

  if (!bundle) notFound();

  const headerStore = await headers();
  const verificationUrl = buildAbsoluteUrl(`/verify/${bundle.ticket.verificationToken}`, originFromHeaders(headerStore));
  const qrDataUrl = await QRCode.toDataURL(verificationUrl, { width: 320, margin: 1 });
  const passenger = bundle.passengers[0];
  const trackingId = bundle.trackingSession?.trackingId;

  return (
    <main className="min-h-screen bg-white">
      <SiteHeader />
      <section className="bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Link href={`/booking/${bundle.booking.bookingReference}`} className="text-sm font-semibold text-[#1565c0] hover:text-[#0d47a1]">← Booking confirmation</Link>
          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white p-[3px] shadow-sm">
            <div className="relative overflow-hidden rounded-[1.7rem] bg-white p-6 text-slate-900 sm:p-10">
              <div className="absolute inset-y-10 right-[280px] hidden w-8 opacity-60 ticket-perforation lg:block" />
              <div className="grid gap-8 lg:grid-cols-[1fr_260px]">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#1565c0]">Boarding pass</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    {bundle.airline ? (
                      <span className="grid h-12 w-12 place-items-center rounded-2xl text-sm font-black text-white" style={{ background: bundle.airline.color }}>
                        {bundle.airline.code}
                      </span>
                    ) : null}
                    <h1 className="text-5xl font-semibold">Plane Finder</h1>
                  </div>
                  <p className="mt-3 text-slate-300">
                    {bundle.airline ? `${bundle.airline.name} • ` : ""}Electronic boarding pass. Scan the QR code to verify.
                  </p>

                  <div className="mt-10">
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-200">Passenger</p>
                    <p className="mt-2 text-4xl font-black">{passengerFullName(passenger?.firstName, passenger?.lastName)}</p>
                  </div>

                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    {[
                      ["Booking reference", bundle.booking.bookingReference],
                      ["Ticket number", bundle.ticket.ticketNumber],
                      ["Flight number", bundle.flight.flightNumber],
                      ["Tracking ID", trackingId ?? "Pending"],
                      ["Origin", `${bundle.flight.origin} (${bundle.flight.originCode})`],
                      ["Destination", `${bundle.flight.destination} (${bundle.flight.destinationCode})`],
                      ["Departure", formatDateTime(bundle.flight.departureTime)],
                      ["Arrival", formatDateTime(bundle.flight.arrivalTime)],
                      ["Seat", bundle.ticket.seat],
                      ["Cabin/class", bundle.ticket.cabinClass],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
                        <p className="mt-1 break-words text-lg font-semibold text-slate-900">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <aside className="rounded-[1.5rem] bg-white p-5 text-slate-950 shadow-xl">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">Verify QR</p>
                    <span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${statusTone(bundle.ticket.status)}`}>{bundle.ticket.status}</span>
                  </div>
                  <Image src={qrDataUrl} alt="Ticket verification QR code" width={240} height={240} className="mx-auto mt-5 rounded-2xl" unoptimized />
                  <p className="mt-4 break-all text-xs leading-5 text-slate-500">{verificationUrl}</p>
                  <div className="mt-6 grid gap-3">
                    <a href={`/api/tickets/${bundle.ticket.ticketNumber}/pdf`} className="rounded-2xl bg-slate-950 px-4 py-3 text-center font-black text-white">PDF</a>
                    <a href={`/api/tickets/${bundle.ticket.ticketNumber}/image`} className="rounded-2xl bg-amber-300 px-4 py-3 text-center font-black text-slate-950">PNG</a>
                    {trackingId ? <Link href={`/track/${trackingId}`} className="rounded-2xl bg-sky-600 px-4 py-3 text-center font-black text-white">Track flight</Link> : null}
                  </div>
                </aside>
              </div>
            </div>
          </div>
          <p className="mt-5 rounded-2xl bg-amber-50 px-5 py-4 text-sm font-semibold leading-6 text-amber-900 ring-1 ring-amber-200">
            Security note: this page never trusts ticket data from the browser. It loads Ticket → Booking → Flight from the backend database.
          </p>
        </div>
      </section>
    </main>
  );
}
