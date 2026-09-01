import { type NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME, createAdminToken, verifyAdminAccessCode, verifyAdminTokenParam } from "@/lib/admin-auth";
import { cookieSecure, publicRedirect } from "@/lib/http";

export const dynamic = "force-dynamic";

function setSessionCookie(request: NextRequest, response: ReturnType<typeof publicRedirect>) {
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

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const code = String(formData.get("code") ?? "");

  if (!verifyAdminAccessCode(code)) {
    return publicRedirect(request, "/ops-console-secure-access?error=Invalid%20access%20code.");
  }

  return setSessionCookie(request, publicRedirect(request, "/ops-console-secure-access/dashboard"));
}

export async function GET(request: NextRequest) {
  const token = new URL(request.url).searchParams.get("token");

  if (token && verifyAdminTokenParam(token)) {
    return setSessionCookie(request, publicRedirect(request, "/ops-console-secure-access/dashboard"));
  }

  return publicRedirect(request, "/ops-console-secure-access?error=Invalid%20token");
}
