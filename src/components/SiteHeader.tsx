"use client";

import { useState } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { href: "/live", label: "Live Map" },
  { href: "/flights", label: "Flights" },
  { href: "/airlines", label: "Airlines" },
  { href: "/track-booking", label: "My Booking" },
  { href: "/support", label: "Support" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 text-slate-900 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-[#1565c0] text-sm font-semibold tracking-tight text-white">
            PF
          </span>
          <span>
            <span className="block text-[17px] font-semibold leading-none tracking-tight">Plane Finder</span>
            <span className="mt-1 block text-[10px] font-medium uppercase tracking-[0.22em] text-slate-500">Live flight tracking</span>
          </span>
        </Link>

        <div className="hidden items-center gap-7 text-[13px] font-medium text-slate-600 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.label} className="hover:text-slate-900" href={link.href}>
              {link.label}
            </Link>
          ))}
          <Link className="rounded-md bg-[#1565c0] px-4 py-2 text-white hover:bg-[#1e88e5]" href="/flights">
            Book a flight
          </Link>
        </div>

        <button
          type="button"
          aria-label="Toggle navigation menu"
          onClick={() => setOpen((value) => !value)}
          className="rounded-md border border-slate-200 p-2 text-slate-900 lg:hidden"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </nav>

      {open ? (
        <div className="border-t border-slate-200 bg-white px-4 pb-5 pt-3 lg:hidden">
          <div className="grid gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/flights" onClick={() => setOpen(false)} className="rounded-md bg-[#1565c0] px-4 py-3 text-center text-sm font-semibold text-white">
              Book a flight
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
