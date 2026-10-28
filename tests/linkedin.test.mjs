// Uji pembangun URL "Tambahkan ke LinkedIn" dan pemformat teks siap tempel.
// Jalankan: npm test

import assert from "node:assert/strict";
import { test } from "node:test";
import { importTs } from "../scripts/lib/load-ts.mjs";

const { buildLinkedInAddUrl, formatPasteText, LINKEDIN_ADD_URL } = await importTs(
  new URL("../src/lib/linkedin.ts", import.meta.url),
);

const dicoding = {
  name: "Belajar Machine Learning untuk Pemula",
  organizationName: "Dicoding Indonesia",
  issued: { year: 2026, month: 2, day: 18 },
  expires: { year: 2029, month: 2, day: 18 },
  certUrl: "https://www.dicoding.com/certificates/MRZMWG9JKPYQ",
  certId: "MRZMWG9JKPYQ",
};

test("URL menuju formulir Add to Profile LinkedIn", () => {
  const url = new URL(buildLinkedInAddUrl(dicoding));
  assert.equal(`${url.origin}${url.pathname}`, LINKEDIN_ADD_URL);
  assert.equal(url.searchParams.get("startTask"), "CERTIFICATION_NAME");
});

test("semua parameter sertifikat terisi dengan benar", () => {
  const p = new URL(buildLinkedInAddUrl(dicoding)).searchParams;
  assert.equal(p.get("name"), "Belajar Machine Learning untuk Pemula");
  assert.equal(p.get("organizationName"), "Dicoding Indonesia");
  assert.equal(p.get("issueYear"), "2026");
  assert.equal(p.get("issueMonth"), "2");
  assert.equal(p.get("expirationYear"), "2029");
  assert.equal(p.get("expirationMonth"), "2");
  assert.equal(p.get("certUrl"), "https://www.dicoding.com/certificates/MRZMWG9JKPYQ");
  assert.equal(p.get("certId"), "MRZMWG9JKPYQ");
  assert.equal(p.has("organizationId"), false);
});

test("organizationId menggantikan organizationName (LinkedIn meminta salah satu)", () => {
  const p = new URL(buildLinkedInAddUrl({ ...dicoding, organizationId: "12345" })).searchParams;
  assert.equal(p.get("organizationId"), "12345");
  assert.equal(p.has("organizationName"), false);
});

test("kolom yang tidak ada tidak dikirim", () => {
  const p = new URL(
    buildLinkedInAddUrl({ name: "Contoh", organizationName: "Penerbit", issued: { year: 2026 } }),
  ).searchParams;
  assert.equal(p.get("issueYear"), "2026");
  assert.equal(p.has("issueMonth"), false);
  assert.equal(p.has("expirationYear"), false);
  assert.equal(p.has("certUrl"), false);
  assert.equal(p.has("certId"), false);
});

test("tanggal null tidak menghasilkan parameter tahun", () => {
  const p = new URL(buildLinkedInAddUrl({ name: "Contoh", organizationName: "Penerbit", issued: null })).searchParams;
  assert.equal(p.has("issueYear"), false);
});

test("karakter khusus dan URL ber-query di-encode lalu terbaca utuh", () => {
  const certUrl = "https://learn.microsoft.com/api/achievements/share/id-id/ahmadngiliyun00/VDFWPR2M?sharingId=2655CA85F0EF937B";
  const name = "AWS AI Academy 2026, Level Dasar dan Pemula (AWS2026/L1-AI-0105)";
  const raw = buildLinkedInAddUrl({ name, organizationName: "Dicoding Indonesia dan AWS", certUrl });
  const p = new URL(raw).searchParams;
  assert.equal(p.get("name"), name);
  assert.equal(p.get("certUrl"), certUrl);
  // Nilai certUrl tidak boleh memecah query: tanda tanya di dalamnya harus ter-encode.
  assert.equal(raw.split("?").length, 2);
});

const labels = { issuer: "Penerbit", date: "Tanggal", credentialId: "ID kredensial", link: "Tautan" };

test("teks siap tempel memuat kolom yang ada saja", () => {
  const text = formatPasteText({
    title: "Hak cipta program komputer: DataCraft",
    kindLabel: "Hak cipta",
    issuer: "DJKI",
    date: "Februari 2025",
    summary: "Analisis sentimen.",
    url: "https://ngiliyun.my.id/sertifikat/hki-datacraft/",
    labels,
  });
  assert.equal(
    text,
    [
      "Hak cipta program komputer: DataCraft (Hak cipta)",
      "Penerbit: DJKI",
      "Tanggal: Februari 2025",
      "",
      "Analisis sentimen.",
      "",
      "Tautan: https://ngiliyun.my.id/sertifikat/hki-datacraft/",
    ].join("\n"),
  );
  assert.equal(text.includes("ID kredensial"), false);
});

test("teks siap tempel tanpa tanggal dan tanpa ringkasan", () => {
  const text = formatPasteText({ title: "Reviewer", kindLabel: "Reviewer", issuer: "Awatara Publisher", labels });
  assert.equal(text, "Reviewer (Reviewer)\nPenerbit: Awatara Publisher");
});
