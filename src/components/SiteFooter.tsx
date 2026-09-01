import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-[#1565c0] text-sm font-semibold text-white">PF</span>
            <div>
              <p className="text-base font-semibold text-slate-900">Plane Finder</p>
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-slate-500">Live flight tracking</p>
            </div>
          </div>
          <p className="mt-5 max-w-md text-sm leading-6 text-slate-500">
            Global flight tracking, airline schedules, and secure e-tickets. Follow aircraft in real time and manage bookings from one platform.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Explore</p>
          <div className="mt-4 grid gap-2.5 text-sm">
            <Link href="/live" className="hover:text-slate-900">Live map</Link>
            <Link href="/flights" className="hover:text-slate-900">Search flights</Link>
            <Link href="/airlines" className="hover:text-slate-900">Airlines</Link>
            <Link href="/track-booking" className="hover:text-slate-900">Find booking</Link>
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Help</p>
          <div className="mt-4 grid gap-2.5 text-sm">
            <Link href="/support" className="hover:text-slate-900">Customer support</Link>
            <Link href="/track" className="hover:text-slate-900">Track a flight</Link>
            <Link href="/verify" className="hover:text-slate-900">Verify ticket</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Plane Finder. All rights reserved.
      </div>
    </footer>
  );
}
