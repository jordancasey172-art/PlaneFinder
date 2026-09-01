import { type NextRequest } from "next/server";
import { requireAdminRequest } from "@/lib/admin-api";
import { createFlightFromFormData } from "@/lib/create-flight";
import { publicRedirect } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const unauthorized = requireAdminRequest(request);
  if (unauthorized) return unauthorized;

  const formData = await request.formData();
  const result = await createFlightFromFormData(formData);

  if (!result.ok) {
    return publicRedirect(request, `/ops-console-secure-access/dashboard?error=${encodeURIComponent(result.error)}`);
  }

  if (result.trackingWarning) {
    return publicRedirect(
      request,
      `/ops-console-secure-access/dashboard?created=flight&error=${encodeURIComponent(`Flight saved. Tracking setup warning: ${result.trackingWarning}`)}`,
    );
  }

  return publicRedirect(request, "/ops-console-secure-access/dashboard?created=flight");
}
