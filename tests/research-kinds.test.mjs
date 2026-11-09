// Uji pembagian jenis capaian (Riset atau Sertifikat) dan segmen alamat per kategori (src/content/types.ts).
// Buku, hak cipta, publikasi, hibah, dan reviewer adalah keluaran atau kegiatan riset, jadi halaman
// detailnya di /riset/<slug>/. Jenis lain tetap di /sertifikat/<slug>/.
// Jalankan: npm test

import assert from "node:assert/strict";
import { test } from "node:test";
import { importTs } from "../scripts/lib/load-ts.mjs";

const { isResearchKind, RESEARCH_KINDS, kindLabels } = await importTs(new URL("../src/content/types.ts", import.meta.url));

test("buku dan hak cipta termasuk keluaran riset", () => {
  assert.equal(isResearchKind("buku"), true);
  assert.equal(isResearchKind("hki"), true);
  assert.equal(isResearchKind("publikasi"), true);
  assert.equal(isResearchKind("hibah"), true);
  assert.equal(isResearchKind("reviewer"), true);
});

test("sertifikat, pelatihan, beasiswa, keanggotaan, dan penghargaan tetap di arsip sertifikat", () => {
  for (const kind of ["sertifikat", "pelatihan", "beasiswa", "keanggotaan", "penghargaan"]) {
    assert.equal(isResearchKind(kind), false, kind);
  }
});

test("setiap jenis riset adalah jenis capaian yang dikenal", () => {
  for (const kind of RESEARCH_KINDS) assert.ok(kind in kindLabels, kind);
});

const { KIND_SLUGS, kindFromSlug } = await importTs(new URL("../src/content/types.ts", import.meta.url));

// Segmen halaman lain situs (src/app/(id)/, src/app/(en)/en/, dan rute di luar grup bahasa).
const TAKEN = {
  id: ["proyek", "riset", "mengajar", "perjalanan", "media-sosial", "kabar", "s", "en", "admin", "files", "cron", "api", "errors"],
  en: ["projects", "research", "teaching", "journey", "social", "news", "s"],
};

test("setiap kategori punya segmen alamat ID dan EN", () => {
  for (const kind of Object.keys(kindLabels)) {
    assert.ok(KIND_SLUGS[kind], kind);
    for (const lang of ["id", "en"]) assert.match(KIND_SLUGS[kind][lang], /^[a-z0-9-]+$/, `${kind} ${lang}`);
  }
});

test("segmen kategori unik dan tidak bertabrakan dengan halaman lain", () => {
  for (const lang of ["id", "en"]) {
    const slugs = Object.values(KIND_SLUGS).map((s) => s[lang]);
    assert.equal(new Set(slugs).size, slugs.length, `segmen ${lang} ganda`);
    for (const slug of slugs) assert.ok(!TAKEN[lang].includes(slug), `${slug} sudah dipakai halaman lain`);
  }
});

test("segmen alamat kembali ke kategorinya", () => {
  assert.equal(kindFromSlug("id", "buku"), "buku");
  assert.equal(kindFromSlug("id", "hak-cipta"), "hki");
  assert.equal(kindFromSlug("en", "books"), "buku");
  assert.equal(kindFromSlug("en", "copyrights"), "hki");
  assert.equal(kindFromSlug("id", "books"), undefined);
  assert.equal(kindFromSlug("id", "proyek"), undefined);
});
