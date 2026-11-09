// Uji aturan isian bersyarat formulir CMS (showWhen, src/lib/conditions.ts).
// Jalankan: npm test

import assert from "node:assert/strict";
import { test } from "node:test";
import { importTs } from "../scripts/lib/load-ts.mjs";

const { fieldVisible } = await importTs(new URL("../src/lib/conditions.ts", import.meta.url));

const fields = [
  { name: "kind", type: "select" },
  { name: "authorship", type: "select", showWhen: { field: "kind", values: ["publikasi"] } },
  { name: "driveUrl", type: "url", showWhen: { field: "kind", not: ["publikasi"] } },
  { name: "linkedin", type: "boolean", showWhen: { field: "kind", values: ["sertifikat", "pelatihan"] } },
  { name: "linkedinNote", type: "text", showWhen: { field: "linkedin", values: ["true"] } },
  { name: "offNote", type: "text", showWhen: { field: "linkedin", values: ["false"] } },
  { name: "tags", type: "multiselect" },
  { name: "tagNote", type: "text", showWhen: { field: "tags", values: ["ai"] } },
  { name: "title", type: "text" },
];
const field = (name) => fields.find((f) => f.name === name);
const visible = (name, data) => fieldVisible(field(name), fields, (n) => data[n]);

test("isian tanpa syarat selalu tampil", () => {
  assert.equal(visible("title", {}), true);
});

test("values: tampil hanya untuk pilihan yang disebut", () => {
  assert.equal(visible("authorship", { kind: "publikasi" }), true);
  assert.equal(visible("authorship", { kind: "buku" }), false);
  assert.equal(visible("authorship", { kind: "" }), false);
  assert.equal(visible("authorship", {}), false);
});

test("not: tampil untuk semua pilihan kecuali yang disebut, termasuk saat belum memilih", () => {
  assert.equal(visible("driveUrl", { kind: "sertifikat" }), true);
  assert.equal(visible("driveUrl", { kind: "" }), true);
  assert.equal(visible("driveUrl", { kind: "publikasi" }), false);
});

test("boolean dibandingkan sebagai true atau false, kosong berarti false", () => {
  assert.equal(visible("linkedinNote", { kind: "sertifikat", linkedin: true }), true);
  assert.equal(visible("linkedinNote", { kind: "sertifikat", linkedin: false }), false);
  assert.equal(visible("offNote", { kind: "sertifikat" }), true);
});

test("pengendali yang tersembunyi ikut menyembunyikan isian yang bergantung padanya", () => {
  // linkedin tercentang tetapi kategori buku: linkedin tidak berlaku, jadi catatannya juga tidak.
  assert.equal(visible("linkedinNote", { kind: "buku", linkedin: true }), false);
  assert.equal(visible("offNote", { kind: "buku" }), false);
});

test("multiselect cocok bila salah satu pilihannya disebut", () => {
  assert.equal(visible("tagNote", { tags: ["web", "ai"] }), true);
  assert.equal(visible("tagNote", { tags: ["web"] }), false);
  assert.equal(visible("tagNote", { tags: [] }), false);
});

test("syarat yang saling bergantung tidak membuat putaran tanpa akhir", () => {
  const loop = [
    { name: "a", type: "boolean", showWhen: { field: "b", values: ["true"] } },
    { name: "b", type: "boolean", showWhen: { field: "a", values: ["true"] } },
  ];
  assert.equal(typeof fieldVisible(loop[0], loop, () => true), "boolean");
});

const { isFilled } = await importTs(new URL("../src/lib/conditions.ts", import.meta.url));

test("isFilled: teks, isi editor kosong, gambar, dua bahasa", () => {
  assert.equal(isFilled(""), false);
  assert.equal(isFilled("   "), false);
  assert.equal(isFilled("https://contoh.id"), true);
  assert.equal(isFilled("<p></p>"), false);
  assert.equal(isFilled(`<p>${String.fromCharCode(38)}nbsp;</p>`), false);
  assert.equal(isFilled('<p><img src="/files/abc/"></p>'), true);
  assert.equal(isFilled({ id: "", en: "" }), false);
  assert.equal(isFilled({ id: "", en: "<p>Hi</p>" }), true);
  assert.equal(isFilled(undefined), false);
  assert.equal(isFilled([]), false);
});

test("filled: isian tampil setelah isian lain diisi", () => {
  const list = [
    { name: "smtp.host", type: "text" },
    { name: "smtp.port", type: "number", showWhen: { field: "smtp.host", filled: true, keep: true } },
    { name: "body", type: "richtext" },
    { name: "comments", type: "boolean", showWhen: { field: "body", filled: true } },
    { name: "empty", type: "text", showWhen: { field: "smtp.host", filled: false } },
  ];
  const at = (name, data) => fieldVisible(list.find((f) => f.name === name), list, (n) => data[n]);
  assert.equal(at("smtp.port", { "smtp.host": "smtp.gmail.com" }), true);
  assert.equal(at("smtp.port", { "smtp.host": "" }), false);
  assert.equal(at("comments", { body: { id: "<p>Isi</p>", en: "" } }), true);
  assert.equal(at("comments", { body: { id: "<p></p>", en: "" } }), false);
  assert.equal(at("comments", {}), false);
  assert.equal(at("empty", {}), true);
  assert.equal(at("empty", { "smtp.host": "x" }), false);
});
