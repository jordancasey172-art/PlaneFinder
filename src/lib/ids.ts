import crypto from "crypto";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function randomCode(length: number) {
  const bytes = crypto.randomBytes(length);
  let output = "";

  for (let index = 0; index < length; index += 1) {
    output += ALPHABET[bytes[index] % ALPHABET.length];
  }

  return output;
}

export function bookingReference() {
  return `PF-${randomCode(6)}`;
}

export function ticketNumber() {
  return `PF-${new Date().getUTCFullYear()}-${randomCode(8)}`;
}

export function trackingId() {
  return `TRK-${randomCode(6)}`;
}

export function sandboxPaymentId() {
  return `PAY-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

export function verificationToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function secureCompare(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) return false;

  return crypto.timingSafeEqual(aBuffer, bBuffer);
}
