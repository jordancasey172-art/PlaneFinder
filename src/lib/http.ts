import { NextResponse } from "next/server";

export function publicOrigin(request: Request) {
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || request.headers.get("host") || "";
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const envOrigin = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");

  const isLocalHost = !host || host.startsWith("0.0.0.0") || host.startsWith("127.0.0.1") || host.startsWith("[::]");

  if (isLocalHost && envOrigin) return envOrigin;

  if (isLocalHost) {
    try {
      const fromUrl = new URL(request.url);
      if (fromUrl.hostname !== "0.0.0.0" && fromUrl.hostname !== "127.0.0.1") {
        return fromUrl.origin;
      }
    } catch {
      // fall through
    }
    return envOrigin || "http://localhost:3000";
  }

  const proto = forwardedProto || (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export function publicUrl(request: Request, path: string) {
  return new URL(path, `${publicOrigin(request)}/`);
}

export function publicRedirect(request: Request, path: string, status = 303) {
  return NextResponse.redirect(publicUrl(request, path), status);
}

export function cookieSecure(request: Request) {
  return publicOrigin(request).startsWith("https://");
}

export function parseDateInput(value: string) {
  const raw = value.trim();
  if (!raw) return new Date(Number.NaN);
  if (/Z$|[+-]\d{2}:\d{2}$/.test(raw)) return new Date(raw);
  const normalized = raw.length === 16 ? `${raw}:00` : raw;
  const parsed = new Date(normalized);
  return parsed;
}
