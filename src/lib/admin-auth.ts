import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { secureCompare } from "./ids";

export const ADMIN_COOKIE_NAME = "plane_finder_admin";
export const ADMIN_SECRET_PATH = process.env.ADMIN_SECRET_PATH || "ops-console-secure-access";
const DEFAULT_ADMIN_CODE = "Goldenticket";

function adminAccessCode() {
  return process.env.ADMIN_ACCESS_CODE || process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_CODE;
}

function sessionSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    adminAccessCode()
  );
}

function sign(value: string) {
  const secret = sessionSecret();
  if (!secret) return "";

  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

export function isAdminConfigured() {
  return Boolean(adminAccessCode() && sessionSecret());
}

export function verifyAdminAccessCode(code: string) {
  const expected = adminAccessCode();
  if (!expected) return false;

  return secureCompare(code, expected);
}

export function verifyAdminTokenParam(token: string | null | undefined): boolean {
  if (!token) return false;
  const expected = process.env.ADMIN_TOKEN || process.env.ADMIN_SECRET_TOKEN || DEFAULT_ADMIN_CODE;
  return secureCompare(token, expected);
}

export function getAdminSecretPath() {
  return ADMIN_SECRET_PATH;
}

export function createAdminToken() {
  const expiresAt = Date.now() + 1000 * 60 * 60 * 8;
  const payload = String(expiresAt);
  const signature = sign(payload);

  return `${payload}.${signature}`;
}

export function verifyAdminToken(token?: string) {
  if (!token || !isAdminConfigured()) return false;

  const [expiresAt, signature] = token.split(".");
  if (!expiresAt || !signature) return false;
  if (Number(expiresAt) < Date.now()) return false;

  return secureCompare(sign(expiresAt), signature);
}

export async function isAdminSession() {
  const cookieStore = await cookies();
  return verifyAdminToken(cookieStore.get(ADMIN_COOKIE_NAME)?.value);
}

export async function requireAdminPage() {
  if (!(await isAdminSession())) {
    redirect(`/${ADMIN_SECRET_PATH}`);
  }
}
