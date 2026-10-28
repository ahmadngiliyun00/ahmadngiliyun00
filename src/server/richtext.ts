import "server-only";
import sanitizeHtml from "sanitize-html";
import { RENDER_POLICY, STORE_POLICY } from "@/lib/richtext";

// Pembersih HTML dari editor CMS, dengan aturan di src/lib/richtext.ts. Dipakai saat menyimpan
// dan sekali lagi saat merender, supaya isi yang tampil hanya memuat tag yang diizinkan.

export function sanitizeRichText(html: string): string {
  return sanitizeHtml(html, STORE_POLICY).replace(/<p>\s*<\/p>/g, "").trim();
}

export function renderRichText(html: string): string {
  return sanitizeHtml(html, RENDER_POLICY);
}
