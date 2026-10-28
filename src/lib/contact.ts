// Aturan form kontak yang dipakai bersama oleh Server Action dan unit test.
// Berkas ini hanya boleh berisi "import type" supaya bisa dimuat tests/contact.test.mjs.

export const CONTACT_LIMITS = {
  name: 120,
  email: 190,
  topic: 120,
  bodyMin: 10,
  body: 5000,
  // Lebih dari ini dianggap spam: pesan kolaborasi biasa jarang berisi banyak tautan.
  links: 3,
  // Form yang dikirim lebih cepat dari ini hampir pasti diisi robot.
  minFillMs: 3000,
} as const;

export type ContactInput = { name: string; email: string; topic: string; body: string };
export type ContactField = keyof ContactInput;
export type ContactFieldError = "required" | "tooShort" | "tooLong" | "invalidEmail" | "tooManyLinks";
export type ContactErrors = Partial<Record<ContactField, ContactFieldError>>;

// Kode galat umum yang diterjemahkan oleh komponen form (ID atau EN).
export type ContactFormError = "captcha" | "tooMany" | "failed" | "invalid";

export type ContactState =
  | { status: "idle" }
  | { status: "sent"; name: string; email: string }
  | { status: "error"; errors?: ContactErrors; formError?: ContactFormError };

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

// Rapikan isian: buang spasi tepi, satukan spasi ganda pada nama, email huruf kecil,
// dan batasi baris kosong beruntun di isi pesan.
export function normalizeContact(raw: Record<string, unknown>): ContactInput {
  return {
    name: clean(raw.name).replace(/\s+/g, " "),
    email: clean(raw.email).toLowerCase(),
    topic: clean(raw.topic).replace(/\s+/g, " "),
    body: clean(raw.body).replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n"),
  };
}

// Pemeriksaan sederhana: satu @, tanpa spasi, domain punya titik dan akhiran minimal 2 huruf.
// Bukti akhir alamat valid adalah balasan yang sampai, bukan regex.
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

export function countLinks(text: string): number {
  return (text.match(/https?:\/\/|www\./gi) ?? []).length;
}

export function validateContact(input: ContactInput): ContactErrors {
  const errors: ContactErrors = {};
  if (input.name === "") errors.name = "required";
  else if (input.name.length > CONTACT_LIMITS.name) errors.name = "tooLong";

  if (input.email === "") errors.email = "required";
  else if (input.email.length > CONTACT_LIMITS.email) errors.email = "tooLong";
  else if (!isValidEmail(input.email)) errors.email = "invalidEmail";

  if (input.topic === "") errors.topic = "required";
  else if (input.topic.length > CONTACT_LIMITS.topic) errors.topic = "tooLong";

  if (input.body === "") errors.body = "required";
  else if (input.body.length < CONTACT_LIMITS.bodyMin) errors.body = "tooShort";
  else if (input.body.length > CONTACT_LIMITS.body) errors.body = "tooLong";
  else if (countLinks(input.body) > CONTACT_LIMITS.links) errors.body = "tooManyLinks";

  return errors;
}

export function hasErrors(errors: ContactErrors): boolean {
  return Object.keys(errors).length > 0;
}

// true bila form dikirim terlalu cepat sejak ditampilkan. Nilai tidak valid tidak dihukum,
// supaya pengunjung dengan jam perangkat yang aneh tetap bisa mengirim.
export function sentTooFast(startedAt: unknown, now: number): boolean {
  const t = Number(startedAt);
  if (!Number.isFinite(t)) return false;
  if (t <= 0) return false;
  if (t > now) return false;
  return now - t < CONTACT_LIMITS.minFillMs;
}
