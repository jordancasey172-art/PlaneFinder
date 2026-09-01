import { type NextRequest } from "next/server";
import { requireAdminRequest, adminRedirect } from "@/lib/admin-api";
import { createFlightFromFormData } from "@/lib/create-flight";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const unauthorized = requireAdminRequest(request);
  if (unauthorized) return unauthorized;

  const formData = await request.formData();
  const result = await createFlightFromFormData(formData);

  if (!result.ok) {
    return adminRedirect(request, `/ops-console-secure-access/dashboard?error=${encodeURIComponent(result.error)}`);
  }

  return adminRedirect(request, "/ops-console-secure-access/dashboard?created=flight");
}
