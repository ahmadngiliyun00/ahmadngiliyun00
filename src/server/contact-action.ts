"use server";

import {
  hasErrors,
  normalizeContact,
  sentTooFast,
  validateContact,
  type ContactState,
} from "@/lib/contact";
import { clientIp, consumeAttempt } from "@/server/auth/rate-limit";
import { sendContactNotification } from "@/server/mail";
import { createMessage, markNotified } from "@/server/messages";
import { verifyTurnstile } from "@/server/turnstile";

// Server Action form kontak situs (ID dan EN). Urutan pemeriksaan:
// honeypot dan jebakan waktu (diam-diam dianggap terkirim), validasi isian,
// batas per IP, Turnstile (bila diaktifkan), simpan ke database, lalu notifikasi email.

// Maksimal 5 pesan per IP per jam.
const LIMIT = { limit: 5, windowMs: 60 * 60 * 1000 };

export async function sendContactMessage(_prev: ContactState, form: FormData): Promise<ContactState> {
  const lang = form.get("lang") === "en" ? "en" : "id";
  const input = normalizeContact({
    name: form.get("name"),
    email: form.get("email"),
    topic: form.get("topic"),
    body: form.get("body"),
  });

  // Robot biasanya mengisi semua kolom, termasuk kolom tersembunyi "website",
  // atau mengirim seketika. Balas seolah berhasil supaya robot tidak belajar.
  const honeypot = String(form.get("website") ?? "");
  if (honeypot !== "") return { status: "sent", name: input.name, email: input.email };
  if (sentTooFast(form.get("startedAt"), Date.now())) return { status: "sent", name: input.name, email: input.email };

  const errors = validateContact(input);
  if (hasErrors(errors)) return { status: "error", errors };

  const ip = await clientIp();
  const keys = [`contact:${ip}`];
  if (await consumeAttempt(keys, LIMIT)) return { status: "error", formError: "tooMany" };

  const token = String(form.get("cf-turnstile-response") ?? "");
  if (!(await verifyTurnstile(token, ip))) return { status: "error", formError: "captcha" };

  try {
    const id = await createMessage(input, lang, ip);
    if (await sendContactNotification({ id, lang, ...input })) await markNotified(id);
  } catch (err) {
    console.error("[contact] Gagal menyimpan pesan", err instanceof Error ? err.message : err);
    return { status: "error", formError: "failed" };
  }
  return { status: "sent", name: input.name, email: input.email };
}
