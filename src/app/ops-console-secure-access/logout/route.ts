import { type NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/lib/admin-auth";
import { cookieSecure, publicRedirect } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const response = publicRedirect(request, "/");
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: cookieSecure(request),
    path: "/",
    maxAge: 0,
  });

  return response;
}
