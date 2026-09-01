export function databaseErrorMessage(error: unknown) {
  const err = error as {
    message?: string;
    code?: string;
    detail?: string;
    cause?: { message?: string; code?: string; detail?: string };
  };

  const code = err?.cause?.code || err?.code;
  const message = err?.cause?.message || err?.message || "Unknown database error";
  const detail = err?.cause?.detail || err?.detail;
  return [code, message, detail].filter(Boolean).join(" — ").slice(0, 280);
}
