import { type NextRequest } from "next/server";
import { requireAdminRequest } from "@/lib/admin-api";
import { createConfirmedBooking } from "@/lib/create-booking";
import { publicRedirect } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const unauthorized = requireAdminRequest(request);
  if (unauthorized) return unauthorized;

  const formData = await request.formData();
  const result = await createConfirmedBooking({
    flightId: String(formData.get("flightId") ?? ""),
    firstName: String(formData.get("firstName") ?? "").trim(),
    lastName: String(formData.get("lastName") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    phone: String(formData.get("phone") ?? "").trim(),
    cabinClass: String(formData.get("cabinClass") ?? "Economy").trim() || "Economy",
    seat: String(formData.get("seat") ?? "").trim().toUpperCase(),
  });

  if (!result.ok) {
    return publicRedirect(request, `/ops-console-secure-access/dashboard?error=${encodeURIComponent(result.error)}`);
  }

  return publicRedirect(
    request,
    `/ops-console-secure-access/dashboard?issued=${encodeURIComponent(result.ticketNumber)}&booking=${encodeURIComponent(result.bookingReference)}`,
  );
}
