import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { supportMessages } from "@/db/schema";
import { randomCode } from "./ids";

export type SupportMessageRecord = typeof supportMessages.$inferSelect;

export type SupportThread = {
  threadId: string;
  name: string;
  email: string;
  subject: string;
  status: "open" | "resolved";
  createdAt: Date;
  messages: SupportMessageRecord[];
};

export function newThreadId() {
  return `TH-${randomCode(6)}`;
}

export async function createSupportMessage(input: {
  threadId?: string;
  name?: string;
  email?: string;
  subject?: string;
  body: string;
  direction?: "in" | "out";
  status?: "open" | "resolved";
}) {
  const threadId = input.threadId ?? newThreadId();
  const [row] = await db
    .insert(supportMessages)
    .values({
      threadId,
      name: input.name?.trim() || null,
      email: input.email?.trim() || null,
      subject: input.subject?.trim() || null,
      body: input.body.trim(),
      direction: input.direction ?? "in",
      status: input.status ?? "open",
    })
    .returning();

  return row;
}

export function botReplyFor(name: string, body: string) {
  const trimmed = body.trim();
  const lower = trimmed.toLowerCase();
  let topic = "your request";

  if (lower.includes("refund") || lower.includes("money")) topic = "refunds and payments";
  if (lower.includes("cancel")) topic = "cancellations";
  if (lower.includes("seat")) topic = "seat selection";
  if (lower.includes("track") || lower.includes("map")) topic = "live flight tracking";
  if (lower.includes("ticket") || lower.includes("pdf")) topic = "tickets and downloads";
  if (lower.includes("baggage") || lower.includes("luggage")) topic = "baggage";

  return `Hi ${name || "there"}! Thanks for contacting Plane finder Care. We've received your message about ${topic} and a support agent will reply shortly. Meanwhile, you can check the FAQ on our /support page or track any flight with its GTRK tracking ID.`;
}

export async function getThreadMessages(threadId: string) {
  return db
    .select()
    .from(supportMessages)
    .where(eq(supportMessages.threadId, threadId))
    .orderBy(supportMessages.createdAt);
}

export async function getSupportThreads(): Promise<SupportThread[]> {
  const rows = await db.select().from(supportMessages).orderBy(desc(supportMessages.createdAt));
  const map = new Map<string, SupportThread>();

  for (const row of rows) {
    let thread = map.get(row.threadId);
    if (!thread) {
      thread = {
        threadId: row.threadId,
        name: row.name ?? "",
        email: row.email ?? "",
        subject: row.subject ?? "",
        status: row.status === "resolved" ? "resolved" : "open",
        createdAt: row.createdAt,
        messages: [],
      };
      map.set(row.threadId, thread);
    }
    thread.messages.unshift(row);
    if (row.status === "resolved") thread.status = "resolved";
  }

  return [...map.values()].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function resolveThread(threadId: string) {
  await db.update(supportMessages).set({ status: "resolved" }).where(eq(supportMessages.threadId, threadId));
}

export async function reopenThread(threadId: string) {
  await db.update(supportMessages).set({ status: "open" }).where(eq(supportMessages.threadId, threadId));
}
