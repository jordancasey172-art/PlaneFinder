import { eq } from "drizzle-orm";
import { db } from "@/db";
import { bookings, passengers, payments, tickets } from "@/db/schema";
import { bookingReference, sandboxPaymentId, ticketNumber, verificationToken } from "@/lib/ids";
import { ensureTrackingSessionForFlight, generateSeatMap, getAvailableSeats, getFlightById } from "@/lib/flight-data";

async function uniqueBookingReference() {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const value = bookingReference();
    const existing = await db.select({ id: bookings.id }).from(bookings).where(eq(bookings.bookingReference, value)).limit(1);
    if (!existing.length) return value;
  }

  throw new Error("Unable to generate unique booking reference");
}

async function uniqueTicketNumber() {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const value = ticketNumber();
    const existing = await db.select({ id: tickets.id }).from(tickets).where(eq(tickets.ticketNumber, value)).limit(1);
    if (!existing.length) return value;
  }

  throw new Error("Unable to generate unique ticket number");
}

async function uniquePaymentId() {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const value = sandboxPaymentId();
    const existing = await db.select({ id: payments.id }).from(payments).where(eq(payments.providerPaymentId, value)).limit(1);
    if (!existing.length) return value;
  }

  throw new Error("Unable to generate unique payment ID");
}

export async function createConfirmedBooking(input: {
  flightId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  nationality?: string;
  documentNumber?: string;
  cabinClass: string;
  seat: string;
}) {
  const flight = await getFlightById(input.flightId);
  if (!flight) return { ok: false as const, error: "Flight not found." };
  if (flight.status.toLowerCase().includes("cancel")) {
    return { ok: false as const, error: "This flight is cancelled and cannot be booked." };
  }

  const cabinClass = input.cabinClass || "Economy";
  const seat = input.seat.trim().toUpperCase();

  if (!input.firstName || !input.lastName || !input.email || !seat) {
    return { ok: false as const, error: "Passenger name, email, and seat are required." };
  }

  if (!flight.cabinClasses.includes(cabinClass)) {
    return { ok: false as const, error: "Selected cabin class is not available." };
  }

  if (!generateSeatMap(flight.capacity).includes(seat)) {
    return { ok: false as const, error: "Selected seat does not exist on this aircraft." };
  }

  const availableSeats = await getAvailableSeats(flight.id, flight.capacity);
  if (!availableSeats.includes(seat)) {
    return { ok: false as const, error: "Selected seat has already been booked." };
  }

  const trackingSession = await ensureTrackingSessionForFlight(flight);
  const reference = await uniqueBookingReference();
  const generatedTicketNumber = await uniqueTicketNumber();
  const paymentId = await uniquePaymentId();
  const totalAmountCents = Math.round(
    flight.basePriceCents * (cabinClass === "Business" ? 2.4 : cabinClass === "First" ? 3.8 : cabinClass === "Premium" ? 1.45 : 1),
  );

  await db.transaction(async (tx) => {
    const [booking] = await tx
      .insert(bookings)
      .values({
        bookingReference: reference,
        flightId: flight.id,
        customerEmail: input.email.trim().toLowerCase(),
        passengerCount: 1,
        cabinClass,
        totalAmountCents,
        status: "Confirmed",
      })
      .returning();

    await tx.insert(passengers).values({
      bookingId: booking.id,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone || null,
      nationality: input.nationality || null,
      documentNumber: input.documentNumber || null,
    });

    await tx.insert(tickets).values({
      bookingId: booking.id,
      ticketNumber: generatedTicketNumber,
      verificationToken: verificationToken(),
      seat,
      cabinClass,
      status: "Valid",
    });

    await tx.insert(payments).values({
      bookingId: booking.id,
      amountCents: totalAmountCents,
      currency: "USD",
      provider: "Card",
      providerPaymentId: paymentId,
      status: "Succeeded",
    });
  });

  return {
    ok: true as const,
    bookingReference: reference,
    ticketNumber: generatedTicketNumber,
    trackingId: trackingSession.trackingId,
  };
}
