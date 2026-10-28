// Aturan form komentar yang dipakai bersama oleh Server Action dan tests/comment.test.mjs.
// Hanya "import type" supaya bisa dimuat skrip Node.

import type { ContactFieldError } from "@/lib/contact";

export const COMMENT_LIMITS = {
  name: 80,
  email: 190,
  bodyMin: 3,
  body: 2000,
  // Komentar wajar jarang membawa lebih dari dua tautan.
  links: 2,
  // Form yang dikirim lebih cepat dari ini hampir pasti diisi robot.
  minFillMs: 3000,
} as const;

export type CommentInput = { name: string; email: string; body: string };
export type CommentField = keyof CommentInput;
export type CommentErrors = Partial<Record<CommentField, ContactFieldError>>;
export type CommentFormError = "tooMany" | "closed" | "failed";

export type CommentState =
  | { status: "idle" }
  | { status: "sent" }
  | { status: "error"; errors?: CommentErrors; formError?: CommentFormError };

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeComment(raw: Record<string, unknown>): CommentInput {
  return {
    name: clean(raw.name).replace(/\s+/g, " "),
    email: clean(raw.email).toLowerCase(),
    body: clean(raw.body).replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n"),
  };
}

function links(text: string): number {
  return (text.match(/https?:\/\/|www\./gi) ?? []).length;
}

export function validateComment(input: CommentInput): CommentErrors {
  const errors: CommentErrors = {};
  if (input.name === "") errors.name = "required";
  else if (input.name.length > COMMENT_LIMITS.name) errors.name = "tooLong";

  if (input.email === "") errors.email = "required";
  else if (input.email.length > COMMENT_LIMITS.email) errors.email = "tooLong";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.email)) errors.email = "invalidEmail";

  if (input.body === "") errors.body = "required";
  else if (input.body.length < COMMENT_LIMITS.bodyMin) errors.body = "tooShort";
  else if (input.body.length > COMMENT_LIMITS.body) errors.body = "tooLong";
  else if (links(input.body) > COMMENT_LIMITS.links) errors.body = "tooManyLinks";

  return errors;
}

export function commentTooFast(startedAt: unknown, now: number): boolean {
  const t = Number(startedAt);
  if (!Number.isFinite(t)) return false;
  if (t <= 0) return false;
  return now - t < COMMENT_LIMITS.minFillMs;
}
