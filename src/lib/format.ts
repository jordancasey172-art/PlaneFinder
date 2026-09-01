export function formatDateTime(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(date);
}

export function formatTime(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;

  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(date);
}

export function formatMoney(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export function passengerFullName(firstName?: string | null, lastName?: string | null) {
  return [firstName, lastName].filter(Boolean).join(" ").trim() || "Passenger";
}

export function escapeHtml(value: string | number | null | undefined) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function statusTone(status: string) {
  const normalized = status.toLowerCase();

  if (normalized.includes("cancel")) return "bg-red-100 text-red-800 ring-red-200";
  if (normalized.includes("arrived") || normalized.includes("valid") || normalized.includes("confirm")) {
    return "bg-emerald-100 text-emerald-800 ring-emerald-200";
  }
  if (normalized.includes("delayed") || normalized.includes("paused")) {
    return "bg-amber-100 text-amber-900 ring-amber-200";
  }

  return "bg-sky-100 text-sky-800 ring-sky-200";
}
