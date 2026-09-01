import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";

export const dynamic = "force-dynamic";

type TrackPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function stringParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function TrackLookupPage({ searchParams }: TrackPageProps) {
  const params = (await searchParams) ?? {};
  const id = stringParam(params, "id").trim().toUpperCase();

  if (id) redirect(`/track/${encodeURIComponent(id)}`);

  return (
    <main className="min-h-screen bg-white">
      <SiteHeader />
      <section className="bg-white px-4 py-16 text-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#1565c0]">Flight tracking</p>
          <h1 className="mt-3 text-5xl font-semibold">Enter a tracking ID</h1>
          <p className="mt-4 text-slate-600">Only tracking IDs from confirmed flight records can return tracking information.</p>
          <form action="/track" method="get" className="mt-8 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 text-slate-900 shadow-sm sm:flex-row">
            <input name="id" placeholder="TRK-91F72A" className="min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#1565c0]/20" />
            <button className="rounded-md bg-[#1565c0] px-6 py-3 font-semibold text-white" type="submit">Track</button>
          </form>
        </div>
      </section>
    </main>
  );
}
