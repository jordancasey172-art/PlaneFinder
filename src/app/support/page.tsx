import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export const dynamic = "force-dynamic";

type SupportPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function stringParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

const FAQS = [
  {
    question: "How do I track a flight?",
    answer:
      "Open the live map, search by flight number, or enter your booking reference on My Booking. Each confirmed booking includes a tracking ID that opens the aircraft position, altitude and speed.",
  },
  {
    question: "How do I book a flight?",
    answer:
      "Search from the homepage or Flights page, choose a service, enter passenger details, select a seat and cabin, then complete payment. You will receive a booking reference and e-ticket immediately.",
  },
  {
    question: "Where do I find my tracking ID?",
    answer:
      "It is shown on your booking confirmation and boarding pass. Open My Booking with your PF- reference if you need it again.",
  },
  {
    question: "How does ticket verification work?",
    answer:
      "Each ticket includes a QR code that opens a secure verification page. Plane Finder checks Ticket → Booking → Flight in the database. Unknown ticket numbers are rejected.",
  },
  {
    question: "Can I download my ticket?",
    answer:
      "Yes. From the ticket page you can download a PDF or PNG boarding pass, including the verification QR code.",
  },
  {
    question: "How do I contact support?",
    answer:
      "Use the chat on any page or send a message with the form on this page. Our team replies to the email you provide.",
  },
];

export default async function SupportPage({ searchParams }: SupportPageProps) {
  const params = (await searchParams) ?? {};
  const sent = stringParam(params, "sent");
  const error = stringParam(params, "error");

  return (
    <main className="min-h-screen bg-white">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1565c0]">Customer support</p>
        <h1 className="mt-2 text-4xl font-semibold text-slate-900">How can we help?</h1>
        <p className="mt-3 max-w-2xl text-slate-600">Bookings, tickets, tracking and payments. Use live chat, the form, or the guides below.</p>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">Contact the team</h2>
              {sent ? (
                <div className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                  Message received. A specialist will reply to your email shortly.
                </div>
              ) : null}
              {error ? (
                <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">{error}</div>
              ) : null}
              <form action="/api/support/contact" method="post" className="mt-6 grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-1.5 text-sm font-medium text-slate-700">
                    Name
                    <input required name="name" className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#1565c0]/20" />
                  </label>
                  <label className="grid gap-1.5 text-sm font-medium text-slate-700">
                    Email
                    <input required type="email" name="email" className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#1565c0]/20" />
                  </label>
                </div>
                <label className="grid gap-1.5 text-sm font-medium text-slate-700">
                  Subject
                  <select name="subject" className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#1565c0]/20">
                    <option>Booking help</option>
                    <option>Ticket download</option>
                    <option>Flight tracking</option>
                    <option>Refund or cancellation</option>
                    <option>Payment</option>
                    <option>Something else</option>
                  </select>
                </label>
                <label className="grid gap-1.5 text-sm font-medium text-slate-700">
                  Message
                  <textarea required name="message" rows={5} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#1565c0]/20" />
                </label>
                <button className="rounded-md bg-[#1565c0] px-5 py-3 font-semibold text-white hover:bg-[#1e88e5]" type="submit">
                  Send message
                </button>
              </form>
            </div>
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">Frequently asked questions</h2>
              <div className="mt-4 grid gap-2">
                {FAQS.map((faq) => (
                  <details key={faq.question} className="rounded-md border border-slate-200 px-4 py-3">
                    <summary className="cursor-pointer text-sm font-semibold text-slate-900">{faq.question}</summary>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
          <aside className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Quick links</h2>
              <div className="mt-4 grid gap-2">
                <Link href="/track" className="rounded-md bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100">Track a flight</Link>
                <Link href="/verify" className="rounded-md bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100">Verify a ticket</Link>
                <Link href="/#search" className="rounded-md bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100">Book a flight</Link>
                <Link href="/airlines" className="rounded-md bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100">Browse airlines</Link>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
