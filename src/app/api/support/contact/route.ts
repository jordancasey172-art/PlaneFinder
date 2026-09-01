import { type NextRequest } from "next/server";
import { createSupportMessage } from "@/lib/support";
import { publicRedirect } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !subject || !message) {
    return publicRedirect(request, "/support?error=All%20fields%20are%20required.");
  }

  await createSupportMessage({ name, email, subject, body: message, direction: "in", status: "open" });
  return publicRedirect(request, "/support?sent=1");
}
