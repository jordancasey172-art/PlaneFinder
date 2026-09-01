import { type NextRequest } from "next/server";
import { adminRedirect, requireAdminRequest } from "@/lib/admin-api";
import { createSupportMessage, reopenThread, resolveThread } from "@/lib/support";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, { params }: { params: Promise<{ threadId: string }> }) {
  const unauthorized = requireAdminRequest(request);
  if (unauthorized) return unauthorized;

  const { threadId } = await params;
  const formData = await request.formData();
  const action = String(formData.get("action") ?? "resolve");

  if (action === "reply") {
    const reply = String(formData.get("reply") ?? "").trim();
    if (reply) {
      await createSupportMessage({
        threadId,
        body: reply,
        direction: "out",
        status: "open",
      });
    }
  } else if (action === "resolve") {
    await resolveThread(threadId);
  } else if (action === "reopen") {
    await reopenThread(threadId);
  }

  return adminRedirect(request, "/ops-console-secure-access/dashboard");
}
