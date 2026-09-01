import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "./admin-auth";
import { publicRedirect } from "./http";

export function requireAdminRequest(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

  if (!verifyAdminToken(token)) {
    return publicRedirect(request, "/ops-console-secure-access?error=Please%20sign%20in%20again.");
  }

  return null;
}

export function adminRedirect(request: NextRequest, path = "/ops-console-secure-access/dashboard") {
  return publicRedirect(request, path);
}
