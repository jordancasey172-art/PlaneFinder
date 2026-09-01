import Link from "next/link";
import { MapShell } from "@/components/MapShell";
import { formatDateTime, formatMoney, passengerFullName, statusTone } from "@/lib/format";
import { getAdminDashboardData } from "@/lib/flight-data";
import { requireAdminPage } from "@/lib/admin-auth";
import { getTrackingSnapshot } from "@/lib/tracking";

export const dynamic = "force-dynamic";

type DashboardProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function stringParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function datetimeLocal(date: Date) {
  return date.toISOString().slice(0, 16);
}

export default async function AdminDashboardPage({ searchParams }: DashboardProps) {
  await requireAdminPage();

  const params = (await searchParams) ?? {};
  const ticketQuery = stringParam(params, "ticketQuery");
  const error = stringParam(params, "error");
  const issued = stringParam(params, "issued");
  const issuedBooking = stringParam(params, "booking");
  const created = stringParam(params, "created");
  const data = await getAdminDashboardData(ticketQuery);
  const activeTracking = data.trackingSessions[0] ? await getTrackingSnapshot(data.trackingSessions[0].trackingId) : null;
  const openThreads = data.supportThreads.filter((thread) => thread.status === "open").length;

  return (
    <main className="min-h-screen bg-white">
      <header className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-600">Admin Console</p>
            <h1 className="text-3xl font-black text-slate-900">Flight Operations</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 transition">
              Home
            </Link>
            <form action="/ops-console-secure-access/logout" method="post" className="inline">
              <button className="rounded-lg bg-red-600 px-4 py-2 text-sm font-black text-white hover:bg-red-700 transition" type="submit">
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error ? <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{error}</div> : null}
        {created === "flight" ? (
          <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">
            Flight created and stored. It should now appear in the list and can be booked or issued a ticket.
          </div>
        ) : null}
        {issued ? (
          <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            Ticket created: <strong>{issued}</strong>
            {issuedBooking ? <> · Booking {issuedBooking}</> : null}
            <div className="mt-2 flex flex-wrap gap-3">
              <a className="font-semibold text-blue-700 underline" href={`/ticket/${issued}`}>Open ticket</a>
              <a className="font-semibold text-blue-700 underline" href={`/api/tickets/${issued}/pdf`}>Download PDF</a>
              <a className="font-semibold text-blue-700 underline" href={`/api/tickets/${issued}/image`}>Download PNG</a>
            </div>
          </div>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[440px_1fr]">
          <form action="/ops-console-secure-access/api/flights" method="post" className="rounded-lg border border-slate-200 bg-white p-6 shadow">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-600">Create Flight</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">New Route & Tracking</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <input name="flightNumber" placeholder="GT204" required className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900" />
              <select name="airlineCode" className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900">
                <option value="">Select airline…</option>
                {data.airlines.map((airline) => (
                  <option key={airline.id} value={airline.code}>{airline.name} ({airline.code})</option>
                ))}
              </select>
              <input name="aircraft" placeholder="Aircraft" defaultValue="Boeing 787-9" className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900" />
              <input name="status" placeholder="Status" defaultValue="Scheduled" className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900" />
              <input name="origin" placeholder="Origin city" required className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900" />
              <input name="destination" placeholder="Destination city" required className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900" />
              <input name="originCode" placeholder="Origin code" required className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900" />
              <input name="destinationCode" placeholder="Dest code" required className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900" />
              <label className="grid gap-1 text-xs font-bold uppercase tracking-wide text-slate-600">
                Departure
                <input name="departureTime" type="datetime-local" required className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900" />
              </label>
              <label className="grid gap-1 text-xs font-bold uppercase tracking-wide text-slate-600">
                Arrival
                <input name="arrivalTime" type="datetime-local" required className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900" />
              </label>
              <input name="capacity" type="number" placeholder="Capacity" defaultValue="126" className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900" />
              <input name="basePrice" type="number" step="0.01" placeholder="Base price" defaultValue="645" className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900" />
              <input name="startLat" type="number" step="0.0001" placeholder="Start lat" defaultValue="31.9686" className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900" />
              <input name="startLng" type="number" step="0.0001" placeholder="Start lng" defaultValue="-99.9018" className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900" />
              <input name="endLat" type="number" step="0.0001" placeholder="End lat" defaultValue="51.5074" className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900" />
              <input name="endLng" type="number" step="0.0001" placeholder="End lng" defaultValue="-0.1278" className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900" />
            </div>
            <button className="mt-5 w-full rounded-lg bg-blue-600 px-5 py-3 font-black text-white hover:bg-blue-700 transition" type="submit">
              Create Flight
            </button>
          </form>

          <form action="/ops-console-secure-access/api/tickets" method="post" className="rounded-lg border border-slate-200 bg-white p-6 shadow">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-600">Issue ticket</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">Create boarding pass</h2>
            <p className="mt-2 text-sm text-slate-500">This creates a real booking, passenger, ticket, and tracking ID in the database.</p>
            <div className="mt-5 grid gap-3">
              <select name="flightId" required className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900">
                <option value="">Select flight…</option>
                {data.flights.filter((flight) => !flight.status.toLowerCase().includes("cancel")).map((flight) => (
                  <option key={flight.id} value={flight.id}>
                    {flight.flightNumber} · {flight.origin} → {flight.destination}
                  </option>
                ))}
              </select>
              <div className="grid gap-3 sm:grid-cols-2">
                <input name="firstName" placeholder="First name" required className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900" />
                <input name="lastName" placeholder="Last name" required className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900" />
              </div>
              <input name="email" type="email" placeholder="Passenger email" required className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900" />
              <div className="grid gap-3 sm:grid-cols-2">
                <select name="cabinClass" className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900">
                  <option>Economy</option>
                  <option>Premium</option>
                  <option>Business</option>
                </select>
                <input name="seat" placeholder="Seat e.g. 12A" required className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900" />
              </div>
            </div>
            <button className="mt-5 w-full rounded-lg bg-slate-900 px-5 py-3 font-black text-white hover:bg-slate-800 transition" type="submit">
              Issue ticket
            </button>
          </form>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-600">Live Map</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">Aircraft Position</h2>
            <div className="mt-5">
              {activeTracking ? (
                <MapShell
                  route={activeTracking.route}
                  position={{ lat: activeTracking.session.currentLat, lng: activeTracking.session.currentLng }}
                  heading={activeTracking.session.heading}
                  label={`${activeTracking.flight.flightNumber} • ${activeTracking.currentLocationLabel}`}
                  className="h-[420px] overflow-hidden rounded-lg"
                />
              ) : (
                <div className="grid h-[420px] place-items-center rounded-lg bg-slate-50 text-slate-400">No tracking sessions</div>
              )}
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-600">Flights</p>
          <h2 className="mt-2 text-2xl font-black text-slate-900">Manage Routes</h2>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-4 py-3">Flight</th>
                  <th>Route</th>
                  <th>Status</th>
                  <th>Departure</th>
                  <th>Arrival</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {data.flights.slice(0, 10).map((flight) => {
                  const airline = data.airlines.find((a) => a.id === flight.airlineId);
                  return (
                    <tr key={flight.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold">{flight.flightNumber}</td>
                      <td className="px-4 py-3">
                        {flight.origin} → {flight.destination}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded px-2 py-1 text-xs font-bold ring-1 ${statusTone(flight.status)}`}>{flight.status}</span>
                      </td>
                      <td className="px-4 py-3 text-xs">{formatDateTime(flight.departureTime)}</td>
                      <td className="px-4 py-3 text-xs">{formatDateTime(flight.arrivalTime)}</td>
                      <td className="px-4 py-3">
                        <form action={`/ops-console-secure-access/api/flights/${flight.id}`} method="post" className="inline">
                          <input type="hidden" name="action" value="cancel" />
                          <button className="text-xs font-bold text-red-600 hover:text-red-700" type="submit">Cancel</button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-600">Bookings</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">Recent Bookings</h2>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[500px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-600">
                  <tr><th className="px-4 py-2">Reference</th><th>Email</th><th>Total</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {data.bookings.slice(0, 5).map((booking) => (
                    <tr key={booking.id}><td className="px-4 py-2 font-bold">{booking.bookingReference}</td><td>{booking.customerEmail}</td><td>{formatMoney(booking.totalAmountCents)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-600">Tickets</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">Recent Tickets</h2>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[500px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-600">
                  <tr><th className="px-4 py-2">Ticket</th><th>Status</th><th>Seat</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {data.tickets.slice(0, 5).map((ticket) => (
                    <tr key={ticket.id}><td className="px-4 py-2 font-bold text-xs">{ticket.ticketNumber}</td><td><span className={`rounded px-2 py-1 text-xs font-bold ring-1 ${statusTone(ticket.status)}`}>{ticket.status}</span></td><td>{ticket.seat}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
