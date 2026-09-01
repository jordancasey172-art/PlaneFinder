import { NextResponse } from "next/server";
import { botReplyFor, createSupportMessage, getThreadMessages } from "@/lib/support";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const threadId = searchParams.get("threadId");

  if (!threadId) {
    return NextResponse.json({ messages: [] });
  }

  const messages = await getThreadMessages(threadId);
  return NextResponse.json({
    messages: messages.map((message) => ({
      id: message.id,
      direction: message.direction,
      body: message.body,
      createdAt: message.createdAt.toISOString(),
    })),
  });
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as {
    threadId?: string;
    name?: string;
    email?: string;
    body?: string;
  } | null;

  const body = payload?.body?.trim() ?? "";
  if (!body || body.length > 2000) {
    return NextResponse.json({ error: "Message is required (max 2000 characters)." }, { status: 400 });
  }

  const incoming = await createSupportMessage({
    threadId: payload?.threadId || undefined,
    name: payload?.name || undefined,
    email: payload?.email || undefined,
    body,
    direction: "in",
    status: "open",
  });

  const reply = await createSupportMessage({
    threadId: incoming.threadId,
    name: payload?.name || undefined,
    email: payload?.email || undefined,
    body: botReplyFor(payload?.name ?? "", body),
    direction: "out",
    status: "open",
  });

  const all = await getThreadMessages(incoming.threadId);

  return NextResponse.json({
    threadId: incoming.threadId,
    messages: all.map((message) => ({
      id: message.id,
      direction: message.direction,
      body: message.body,
      createdAt: message.createdAt.toISOString(),
    })),
    replyId: reply.id,
  });
}
