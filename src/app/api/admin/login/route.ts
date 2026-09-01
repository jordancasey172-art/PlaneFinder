import { type NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME, createAdminToken, verifyAdminAccessCode } from "@/lib/admin-auth";
import { cookieSecure, publicRedirect } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const code = String(formData.get("code") ?? "");

  if (!verifyAdminAccessCode(code)) {
    return publicRedirect(request, "/ops-console-secure-access?error=Invalid%20admin%20access%20code.");
  }

  const response = publicRedirect(request, "/ops-console-secure-access/dashboard");
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: createAdminToken(),
    httpOnly: true,
    sameSite: "lax",
    secure: cookieSecure(request),
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
}
