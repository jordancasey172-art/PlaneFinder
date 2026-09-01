import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { TrackingExperience } from "@/components/TrackingExperience";
import { getTrackingSnapshot } from "@/lib/tracking";
import { toTrackingViewModel } from "@/lib/view-models";

export const dynamic = "force-dynamic";

export default async function TrackFlightPage({ params }: { params: Promise<{ trackingId: string }> }) {
  const { trackingId } = await params;
  const snapshot = await getTrackingSnapshot(trackingId);

  return (
    <main className="min-h-screen bg-white">
      <SiteHeader />
      <section className="bg-white px-4 py-12 text-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link href="/" className="text-sm font-semibold text-[#1565c0] hover:text-[#0d47a1]">← Back to home</Link>
          <div className="mt-8">
            {snapshot ? (
              <TrackingExperience initial={toTrackingViewModel(snapshot)} />
            ) : (
              <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-red-900">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-red-700">Not found</p>
                <h1 className="mt-2 text-4xl font-semibold">Tracking ID not found.</h1>
                <p className="mt-3 max-w-2xl text-red-800">
                  The tracking ID {trackingId.toUpperCase()} does not exist in the backend database. Plane Finder does not accept arbitrary IDs.
                </p>
                <Link href="/track" className="mt-6 inline-flex rounded-md bg-white px-6 py-3 font-semibold text-red-700 ring-1 ring-red-200">Try another tracking ID</Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
