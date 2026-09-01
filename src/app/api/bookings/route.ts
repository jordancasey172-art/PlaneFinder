import { type NextRequest } from "next/server";
import { createConfirmedBooking } from "@/lib/create-booking";
import { publicRedirect } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const flightId = String(formData.get("flightId") ?? "");

  if (!flightId) {
    return publicRedirect(request, "/flights?bookingError=Missing%20flight");
  }

  const result = await createConfirmedBooking({
    flightId,
    firstName: String(formData.get("firstName") ?? "").trim(),
    lastName: String(formData.get("lastName") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    phone: String(formData.get("phone") ?? "").trim(),
    nationality: String(formData.get("nationality") ?? "").trim(),
    documentNumber: String(formData.get("documentNumber") ?? "").trim(),
    cabinClass: String(formData.get("cabinClass") ?? "Economy").trim() || "Economy",
    seat: String(formData.get("seat") ?? "").trim().toUpperCase(),
  });

  if (!result.ok) {
    return publicRedirect(request, `/book/${flightId}?error=${encodeURIComponent(result.error)}`);
  }

  return publicRedirect(request, `/booking/${result.bookingReference}?tracking=${encodeURIComponent(result.trackingId)}`);
}
