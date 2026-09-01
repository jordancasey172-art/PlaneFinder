import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { ADMIN_COOKIE_NAME, verifyAdminToken, verifyAdminTokenParam, createAdminToken } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function stringParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function AdminAccessPage({ searchParams }: PageProps) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const params = (await searchParams) ?? {};
  const tokenParam = stringParam(params, "token");
  const error = stringParam(params, "error");

  // Check if user has valid session or token param
  if (verifyAdminToken(sessionCookie)) {
    // Already authenticated, redirect to admin dashboard
    redirect("/ops-console-secure-access/dashboard");
  }

  if (tokenParam && verifyAdminTokenParam(tokenParam)) {
    // Valid token param - set cookie and redirect
    const response = new Response(
      JSON.stringify({ redirectTo: "/ops-console-secure-access/dashboard" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
    
    // We need to actually set the cookie and redirect in the auth route instead
    redirect(`/ops-console-secure-access/auth?token=${encodeURIComponent(tokenParam)}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <h1 className="text-2xl font-black text-slate-900">Admin Access</h1>
          <p className="mt-2 text-sm text-slate-600">This is a restricted area for authorized administrators only.</p>

          {error ? (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
              {error}
            </div>
          ) : null}

          <form action="/ops-console-secure-access/auth" method="post" className="mt-6 space-y-4">
            <div>
              <label htmlFor="code" className="block text-sm font-bold text-slate-700">
                Access Code
              </label>
              <input
                id="code"
                name="code"
                type="password"
                required
                placeholder="Enter access code"
                className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-bold text-white hover:bg-blue-700 transition"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 border-t border-slate-200 pt-6">
            <p className="text-xs text-slate-500">
              If you don't have access credentials, contact your administrator.
            </p>
          </div>

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
