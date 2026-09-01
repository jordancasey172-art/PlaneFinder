"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type ChatMessage = {
  id: string;
  direction: "in" | "out";
  body: string;
  createdAt: string;
};

type Profile = { name: string; email: string };

export function SupportChat() {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const storedThread = window.localStorage.getItem("pf-chat-thread");
    if (storedThread) setThreadId(storedThread);
    const storedProfile = window.localStorage.getItem("pf-chat-profile");
    if (storedProfile) {
      try {
        setProfile(JSON.parse(storedProfile) as Profile);
      } catch {
        // ignore malformed profile
      }
    }
  }, []);

  useEffect(() => {
    if (!open || !threadId) return;
    let cancelled = false;

    void fetch(`/api/support/chat?threadId=${encodeURIComponent(threadId)}`, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (!cancelled && payload?.messages) setMessages(payload.messages);
      })
      .catch(() => {
        // keep local messages
      });

    return () => {
      cancelled = true;
    };
  }, [open, threadId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  async function sendMessage(event: React.FormEvent) {
    event.preventDefault();
    const body = input.trim();
    if (!body || sending) return;

    setSending(true);
    try {
      const response = await fetch("/api/support/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId,
          name: profile?.name ?? "",
          email: profile?.email ?? "",
          body,
        }),
      });
      const payload = (await response.json()) as { threadId: string; messages: ChatMessage[] };
      setThreadId(payload.threadId);
      setMessages(payload.messages);
      window.localStorage.setItem("pf-chat-thread", payload.threadId);
      setInput("");
    } catch {
      // show nothing on failure
    } finally {
      setSending(false);
    }
  }

  function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const nextProfile = {
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
    };
    setProfile(nextProfile);
    window.localStorage.setItem("pf-chat-profile", JSON.stringify(nextProfile));
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Open customer care chat"
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 to-amber-500 text-2xl shadow-2xl shadow-slate-950/40 transition hover:scale-105"
      >
        {open ? "✕" : "💬"}
      </button>

      {open ? (
        <div className="fixed bottom-24 right-4 z-50 flex h-[520px] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-2xl ring-1 ring-slate-200">
          <div className="bg-slate-950 p-5 text-white">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-amber-200 to-amber-500 text-lg font-black text-slate-950">✈</span>
              <div>
                <p className="font-black">Plane finder Care</p>
                <p className="text-xs text-slate-400">Customer support • replies stored securely</p>
              </div>
            </div>
          </div>

          {!profile ? (
            <form onSubmit={saveProfile} className="grid flex-1 content-center gap-3 p-5">
              <p className="text-center text-sm font-bold text-slate-700">Tell us who you are so we can reply.</p>
              <input name="name" required placeholder="Your name" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:ring-4 focus:ring-amber-300" />
              <input name="email" type="email" required placeholder="Your email" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:ring-4 focus:ring-amber-300" />
              <button className="rounded-2xl bg-slate-950 px-4 py-3 font-black text-white" type="submit">Start chat</button>
            </form>
          ) : (
            <>
              <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
                {messages.length === 0 ? (
                  <div className="rounded-2xl bg-slate-950 p-4 text-sm text-slate-300">
                    Welcome, {profile.name}! Ask us anything about bookings, tickets, or tracking.
                  </div>
                ) : null}
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.direction === "in" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-6 ${
                        message.direction === "in" ? "rounded-br-md bg-slate-950 text-white" : "rounded-bl-md bg-white text-slate-900 ring-1 ring-slate-200"
                      }`}
                    >
                      {message.body}
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={sendMessage} className="flex gap-2 border-t border-slate-200 bg-white p-3">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Type your message…"
                  className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-amber-300"
                />
                <button disabled={sending || !input.trim()} className="rounded-2xl bg-amber-300 px-4 py-3 font-black text-slate-950 disabled:opacity-50" type="submit">
                  Send
                </button>
              </form>
              <Link href="/support" className="border-t border-slate-100 bg-white px-4 py-2.5 text-center text-xs font-bold text-sky-600 hover:text-sky-700">
                Visit the full support center →
              </Link>
            </>
          )}
        </div>
      ) : null}
    </>
  );
}
