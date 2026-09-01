import type { TicketBundle } from "./flight-data";
import { escapeHtml, passengerFullName } from "./format";

export function buildAbsoluteUrl(path: string, origin?: string) {
  const configured = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL;
  const base = origin || (configured?.startsWith("http") ? configured : configured ? `https://${configured}` : "http://localhost:3000");

  return new URL(path, base).toString();
}

export function ticketDetails(bundle: TicketBundle) {
  const passenger = bundle.passengers[0];
  const departure = new Date(bundle.flight.departureTime);
  const timeFormatter = new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "UTC" });
  const dateFormatter = new Intl.DateTimeFormat("en", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" });

  return {
    passengerName: passengerFullName(passenger?.firstName, passenger?.lastName).toUpperCase(),
    airlineName: bundle.airline?.name ?? "Plane Finder",
    airlineCode: bundle.airline?.code ?? "PF",
    bookingReference: bundle.booking.bookingReference,
    ticketNumber: bundle.ticket.ticketNumber,
    ticketDigits: bundle.ticket.ticketNumber.replace(/[^0-9A-Za-z]/g, "").slice(-12).padStart(12, "0"),
    flightNumber: bundle.flight.flightNumber,
    aircraft: bundle.flight.aircraft,
    originCity: bundle.flight.origin,
    destinationCity: bundle.flight.destination,
    originCode: bundle.flight.originCode,
    destinationCode: bundle.flight.destinationCode,
    boardingTime: timeFormatter.format(new Date(departure.getTime() - 30 * 60000)),
    departureDate: dateFormatter.format(departure),
    departureTime: timeFormatter.format(departure),
    seat: bundle.ticket.seat,
    cabinClass: bundle.ticket.cabinClass.toUpperCase(),
    group: ["A", "B", "C", "D"][Math.abs([...bundle.ticket.seat].reduce((sum, chr) => sum + chr.charCodeAt(0), 0)) % 4],
    gate: `E${(Math.abs([...bundle.flight.flightNumber].reduce((sum, chr) => sum + chr.charCodeAt(0), 0)) % 28) + 3}`,
    ticketStatus: bundle.ticket.status,
    trackingId: bundle.trackingSession?.trackingId ?? "Pending",
  };
}

export function boardingPassSvg(bundle: TicketBundle, verificationUrl: string, qrDataUrl: string, barcodeLeftPng: string, barcodeRightPng: string) {
  const d = ticketDetails(bundle);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="520" viewBox="0 0 1200 520">
  <rect width="1200" height="520" fill="#ffffff"/>
  <text x="14" y="260" transform="rotate(-90 14 260)" font-family="Inter, Arial, Helvetica, sans-serif" font-size="22" font-weight="700" fill="#2f5d8a" letter-spacing="8" text-anchor="middle">${escapeHtml(d.airlineName).toUpperCase()}</text>
  <image href="${barcodeLeftPng}" x="76" y="52" width="760" height="88" preserveAspectRatio="none" transform="rotate(90 456 486)"/>
  <text x="150" y="470" transform="rotate(-90 150 470)" font-family="Inter, Arial, Helvetica, sans-serif" font-size="26" fill="#2f5d8a" letter-spacing="6">${escapeHtml(d.ticketDigits)}</text>
  <line x1="212" y1="40" x2="212" y2="480" stroke="#cfd8e3" stroke-width="2" stroke-dasharray="6 6"/>

  <g font-family="Inter, Arial, Helvetica, sans-serif">
    <text x="248" y="86" font-size="17" fill="#5b6b7c">Passenger</text>
    <text x="248" y="122" font-size="30" font-weight="700" fill="#2f5d8a">${escapeHtml(d.passengerName)}</text>
    <line x1="248" y1="142" x2="430" y2="142" stroke="#cfd8e3" stroke-width="2" stroke-dasharray="4 4"/>
    <text x="248" y="186" font-size="17" fill="#5b6b7c">Boarding Time</text>
    <text x="248" y="222" font-size="26" font-weight="700" fill="#2f5d8a">${escapeHtml(d.boardingTime)}</text>
    <text x="392" y="186" font-size="17" fill="#5b6b7c">Gate</text>
    <text x="392" y="222" font-size="26" font-weight="700" fill="#2f5d8a">${escapeHtml(d.gate)}</text>
    <line x1="248" y1="242" x2="430" y2="242" stroke="#cfd8e3" stroke-width="2" stroke-dasharray="4 4"/>
    <text x="248" y="286" font-size="17" fill="#5b6b7c">Date</text>
    <text x="248" y="322" font-size="26" font-weight="700" fill="#2f5d8a">${escapeHtml(d.departureDate)}</text>
    <text x="248" y="366" font-size="17" fill="#5b6b7c">To</text>
    <text x="248" y="402" font-size="26" font-weight="700" fill="#2f5d8a">${escapeHtml(d.destinationCity)}, ${escapeHtml(d.destinationCode)}</text>
    <line x1="248" y1="422" x2="430" y2="422" stroke="#cfd8e3" stroke-width="2" stroke-dasharray="4 4"/>
    <text x="248" y="466" font-size="17" fill="#5b6b7c">Seat</text>
    <text x="248" y="500" font-size="26" font-weight="700" fill="#2f5d8a">${escapeHtml(d.seat)}</text>
    <text x="392" y="466" font-size="17" fill="#5b6b7c">Group</text>
    <text x="392" y="500" font-size="26" font-weight="700" fill="#2f5d8a">${escapeHtml(d.group)}</text>
  </g>

  <line x1="486" y1="40" x2="486" y2="480" stroke="#cfd8e3" stroke-width="2" stroke-dasharray="6 6"/>

  <g font-family="Inter, Arial, Helvetica, sans-serif">
    <text x="520" y="64" font-size="42" font-weight="800" fill="#2f5d8a" letter-spacing="4">${escapeHtml(d.cabinClass)}</text>
    <path d="M640 110 l60 8 0 8 -24 14 -50 16 -6 -14 -18 -6 -18 -18 -8 -10 44 2z" fill="#2f5d8a" transform="translate(30 40)"/>
    <text x="520" y="212" font-size="18" fill="#5b6b7c">Flight-ID — ${escapeHtml(d.flightNumber)}${escapeHtml(d.airlineCode)}XY</text>
    <text x="520" y="266" font-size="18" fill="#2f5d8a" text-decoration="underline">${escapeHtml(verificationUrl)}</text>
    <image href="${escapeHtml(qrDataUrl)}" x="720" y="300" width="112" height="112"/>
    <text x="520" y="360" font-size="15" fill="#5b6b7c">Please watch the departure board for</text>
    <text x="520" y="384" font-size="15" fill="#5b6b7c">boarding &amp; gate updates. Boarding ends</text>
    <text x="520" y="408" font-size="15" fill="#5b6b7c">15 min before departure.</text>
    <text x="520" y="452" font-size="15" fill="#2f5d8a">Booking ${escapeHtml(d.bookingReference)} · Track ${escapeHtml(d.trackingId)}</text>
  </g>

  <rect x="846" y="0" width="354" height="520" rx="0" fill="#2f5d8a"/>
  <image href="${barcodeRightPng}" x="880" y="40" width="288" height="96" preserveAspectRatio="none"/>
  <text x="1024" y="176" font-family="Inter, Arial, Helvetica, sans-serif" font-size="22" fill="#ffffff" letter-spacing="6" text-anchor="middle">${escapeHtml(d.ticketDigits)}</text>

  <g font-family="Inter, Arial, Helvetica, sans-serif" fill="#ffffff">
    <text x="880" y="226" font-size="15" opacity="0.85">Passenger</text>
    <text x="880" y="256" font-size="24" font-weight="700">${escapeHtml(d.passengerName)}</text>
    <line x1="880" y1="274" x2="1170" y2="274" stroke="#ffffff" stroke-opacity="0.5" stroke-dasharray="4 4"/>
    <text x="880" y="312" font-size="15" opacity="0.85">Boarding Time</text>
    <text x="880" y="342" font-size="20" font-weight="700">${escapeHtml(d.boardingTime)}</text>
    <text x="1000" y="312" font-size="15" opacity="0.85">Gate</text>
    <text x="1000" y="342" font-size="20" font-weight="700">${escapeHtml(d.gate)}</text>
    <text x="1088" y="312" font-size="15" opacity="0.85">Flight</text>
    <text x="1088" y="342" font-size="18" font-weight="700">${escapeHtml(d.aircraft)}</text>
    <text x="880" y="392" font-size="15" opacity="0.85">From</text>
    <text x="880" y="422" font-size="19" font-weight="700">${escapeHtml(d.originCity)}, ${escapeHtml(d.originCode)}</text>
    <text x="880" y="462" font-size="15" opacity="0.85">To</text>
    <text x="880" y="492" font-size="19" font-weight="700">${escapeHtml(d.destinationCity)}, ${escapeHtml(d.destinationCode)}</text>
  </g>
  <circle cx="1152" cy="468" r="42" fill="#ffffff" fill-opacity="0.16"/>
  <image href="${escapeHtml(qrDataUrl)}" x="1126" y="442" width="52" height="52"/>
</svg>`;
}
