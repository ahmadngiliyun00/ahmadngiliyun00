// Tombol "Tambahkan ke LinkedIn" dan teks siap tempel untuk capaian.
//
// Format mengikuti panduan resmi LinkedIn Add to Profile (addtoprofile.linkedin.com):
// https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME dengan parameter
// name, organizationId atau organizationName (pilih salah satu), issueYear, issueMonth,
// expirationYear, expirationMonth, certUrl, dan certId.
// URL dirakit dengan URLSearchParams, bukan rangkaian string, sesuai aturan gaya proyek.
//
// Berkas ini hanya boleh memuat "import type" karena juga diuji dengan node --test.

import type { PartialDate } from "@/data/achievements";

export const LINKEDIN_ADD_URL = "https://www.linkedin.com/profile/add";

export type LinkedInCertification = {
  name: string;
  organizationName: string;
  organizationId?: string;
  issued?: PartialDate | null;
  expires?: PartialDate;
  certUrl?: string;
  certId?: string;
};

export function buildLinkedInAddUrl(cert: LinkedInCertification): string {
  const url = new URL(LINKEDIN_ADD_URL);
  const p = url.searchParams;
  p.set("startTask", "CERTIFICATION_NAME");
  p.set("name", cert.name);

  // LinkedIn meminta salah satu saja: organizationId bila penerbit punya halaman LinkedIn.
  if (cert.organizationId) {
    p.set("organizationId", cert.organizationId);
  } else {
    p.set("organizationName", cert.organizationName);
  }

  if (cert.issued) {
    p.set("issueYear", String(cert.issued.year));
    if (cert.issued.month !== undefined) p.set("issueMonth", String(cert.issued.month));
  }
  if (cert.expires) {
    p.set("expirationYear", String(cert.expires.year));
    if (cert.expires.month !== undefined) p.set("expirationMonth", String(cert.expires.month));
  }
  if (cert.certUrl) p.set("certUrl", cert.certUrl);
  if (cert.certId) p.set("certId", cert.certId);

  return url.toString();
}

export type PasteTextInput = {
  title: string;
  kindLabel: string;
  issuer: string;
  date?: string; // tanggal yang sudah diformat sesuai bahasa
  credentialId?: string;
  summary?: string;
  url?: string;
  labels: { issuer: string; date: string; credentialId: string; link: string };
};

// Teks untuk kategori yang tidak punya formulir resmi di LinkedIn (HKI, buku, publikasi, dan lainnya).
// Hanya memuat kolom yang memang ada di data, tanpa klaim tambahan.
export function formatPasteText(input: PasteTextInput): string {
  const lines = [`${input.title} (${input.kindLabel})`, `${input.labels.issuer}: ${input.issuer}`];
  if (input.date) lines.push(`${input.labels.date}: ${input.date}`);
  if (input.credentialId) lines.push(`${input.labels.credentialId}: ${input.credentialId}`);
  if (input.summary) lines.push("", input.summary);
  if (input.url) lines.push("", `${input.labels.link}: ${input.url}`);
  return lines.join("\n");
}
