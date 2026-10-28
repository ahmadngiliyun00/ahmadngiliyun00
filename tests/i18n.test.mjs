// Uji isian dua bahasa: isi cadangan untuk situs, status terjemahan, dan daftar yang belum lengkap.
// Jalankan: npm test

import assert from "node:assert/strict";
import { test } from "node:test";
import { importTs } from "../scripts/lib/load-ts.mjs";

const { fillLocalized, pairStatus, translationGaps, langOrder } = await importTs(new URL("../src/lib/i18n.ts", import.meta.url));

test("terjemahan kosong diisi dari bahasa utama", () => {
  const doc = { title: { id: "Judul", en: "" }, tags: { id: ["a"], en: [] }, issuer: "Dicoding", n: 3 };
  assert.deepEqual(fillLocalized(doc, "id"), { title: { id: "Judul", en: "Judul" }, tags: { id: ["a"], en: ["a"] }, issuer: "Dicoding", n: 3 });
});

test("bahasa utama Inggris dan sisi utama yang kosong", () => {
  assert.deepEqual(fillLocalized({ t: { id: "", en: "Title" } }, "en"), { t: { id: "Title", en: "Title" } });
  assert.deepEqual(fillLocalized({ t: { id: "Judul", en: "" } }, "en"), { t: { id: "Judul", en: "Judul" } });
});

test("kunci yang dilewati dan objek lain tidak diubah", () => {
  const doc = { body: { id: "<p>Isi</p>", en: "" }, email: { user: "a", domain: "b" }, list: [{ label: { id: "L", en: "" } }] };
  const out = fillLocalized(doc, "id", ["body"]);
  assert.deepEqual(out.body, { id: "<p>Isi</p>", en: "" });
  assert.deepEqual(out.email, { user: "a", domain: "b" });
  assert.deepEqual(out.list, [{ label: { id: "L", en: "L" } }]);
});

test("status terjemahan", () => {
  assert.equal(pairStatus("a", "b"), "complete");
  assert.equal(pairStatus("a", ""), "missing");
  assert.equal(pairStatus("", "b"), "missing");
  assert.equal(pairStatus("", ""), "empty");
  assert.equal(pairStatus(["a"], []), "missing");
});

test("daftar isian yang terjemahannya belum lengkap", () => {
  const fields = [
    { name: "title", label: "Judul", type: "localized" },
    { name: "summary", label: "Ringkasan", type: "localized" },
    { name: "body", label: "Isi lengkap", type: "richtext" },
    { name: "issuer", label: "Penerbit", type: "text" },
  ];
  const doc = { title: { id: "J", en: "T" }, summary: { id: "R", en: "" }, issuer: "X" };
  assert.deepEqual(translationGaps(fields, doc), ["Ringkasan"]);
  assert.deepEqual(langOrder("en"), ["en", "id"]);
});
