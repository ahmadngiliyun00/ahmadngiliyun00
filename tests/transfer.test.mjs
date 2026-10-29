// Uji ekspor dan impor lembar kerja CMS: kolom, isi sel, sel menjadi isian formulir, Excel, dan CSV.
// Jalankan: npm test

import assert from "node:assert/strict";
import { test } from "node:test";
import zlib from "node:zlib";
import { importTs } from "../scripts/lib/load-ts.mjs";

const transfer = await importTs(new URL("../src/lib/transfer.ts", import.meta.url));
const xlsx = await importTs(new URL("../src/lib/xlsx.ts", import.meta.url));
const { transferColumns, headerText, headerKey, entryRow, formFromEntry, applyCells, readSheetRows } = transfer;

const codec = {
  deflate: (b) => zlib.deflateRawSync(b),
  inflate: (b, max) => zlib.inflateRawSync(b, { maxOutputLength: max }),
  crc32: (b) => zlib.crc32(b),
};
const AMP = String.fromCharCode(38);

// Sebagian field koleksi capaian (src/content/collections.ts).
const fields = [
  { name: "title", label: "Judul", type: "localized", required: true },
  { name: "kind", label: "Kategori", type: "select", options: [{ value: "sertifikat", label: "Sertifikat" }, { value: "hki", label: "Hak cipta" }] },
  { name: "issued", label: "Tanggal terbit", type: "date" },
  { name: "credentialId", label: "ID kredensial", type: "text" },
  { name: "fileId", label: "Berkas", type: "file" },
  { name: "driveUrl", label: "Tautan Google Drive", type: "url", drive: true },
  { name: "skills", label: "Keterampilan", type: "list" },
  { name: "featured", label: "Sorot", type: "boolean" },
  { name: "body", label: "Isi", type: "richtext" },
];

const entry = {
  slug: "sertifikat-ai",
  visibility: "public",
  position: 0,
  data: {
    title: { id: "Sertifikat AI", en: "AI Certificate" },
    kind: "sertifikat",
    issued: { year: 2025, month: 3 },
    credentialId: "123456789012345678",
    fileId: "abc123",
    skills: ["Python", "PyTorch"],
    featured: true,
    body: { id: "<p>Isi</p>", en: "" },
  },
};

const cols = transferColumns(fields, false);
const keys = cols.map((c) => c.key);

test("kolom mengikuti field, tanpa berkas dan rich text", () => {
  assert.deepEqual(keys, [
    "slug", "visibility", "title.id", "title.en", "kind", "issued.year", "issued.month", "issued.day",
    "credentialId", "driveUrl", "skills", "featured",
  ]);
  assert.equal(transferColumns(fields, true)[2].key, "position");
  assert.deepEqual(cols.find((c) => c.key === "featured").options, ["ya", "tidak"]);
});

test("judul kolom memuat kunci yang bisa dibaca balik", () => {
  const col = cols.find((c) => c.key === "title.en");
  assert.equal(headerText(col), "Judul (Inggris) [title.en]");
  assert.equal(headerKey(headerText(col)), "title.en");
  assert.equal(headerKey(" slug "), "slug");
});

test("baris ekspor berisi teks sel", () => {
  assert.deepEqual(entryRow(fields, cols, entry), [
    "sertifikat-ai", "public", "Sertifikat AI", "AI Certificate", "sertifikat", "2025", "3", "",
    "123456789012345678", "", "Python\nPyTorch", "ya",
  ]);
});

test("isian formulir dari data menyimpan berkas dan isi rich text", () => {
  const pairs = formFromEntry(fields, entry);
  assert.deepEqual(pairs.get("f.fileId"), ["abc123"]);
  assert.deepEqual(pairs.get("f.body.id"), ["<p>Isi</p>"]);
  assert.deepEqual(pairs.get("f.featured"), ["on"]);
  assert.deepEqual(pairs.get("f.issued.month"), ["3"]);
  assert.equal(pairs.has("f.issued.day"), false);
  assert.deepEqual(pairs.get("visibility"), ["public"]);
  assert.deepEqual(formFromEntry(fields, null).get("visibility"), ["private"]);
});

test("sel kosong tidak mengubah, sel terisi menimpa", () => {
  const base = formFromEntry(fields, entry);
  const cells = new Map([
    ["slug", "sertifikat-ai"],
    ["title.id", ""],
    ["driveUrl", "https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUv/view"],
    ["featured", "TIDAK"],
    ["issued.year", "2024.0"],
    ["visibility", "privat"],
  ]);
  const { pairs, problems } = applyCells(fields, cols, base, cells);
  assert.deepEqual(problems, []);
  assert.deepEqual(pairs.get("f.title.id"), ["Sertifikat AI"]);
  assert.deepEqual(pairs.get("f.driveUrl"), ["https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUv/view"]);
  assert.equal(pairs.has("f.featured"), false);
  assert.deepEqual(pairs.get("f.issued.year"), ["2024"]);
  assert.deepEqual(pairs.get("visibility"), ["private"]);
  assert.deepEqual(base.get("f.featured"), ["on"], "isian dasar tidak ikut berubah");
});

test("isi sel yang tidak sah dilaporkan", () => {
  const base = formFromEntry(fields, entry);
  const { problems } = applyCells(fields, cols, base, new Map([["featured", "mungkin"], ["visibility", "rahasia"]]));
  assert.equal(problems.length, 2);
});

test("baris judul dicari, baris kosong dilewati, kolom asing dilaporkan", () => {
  const rows = [
    [headerText(cols[0]), "Catatan saya", headerText(cols[2])],
    ["a", "x", "Judul A"],
    ["", "", ""],
    ["", "", "Judul baru"],
  ];
  const read = readSheetRows(rows, cols);
  assert.deepEqual(read.unknown, ["Catatan saya"]);
  assert.equal(read.rows.length, 2);
  assert.equal(read.rows[0].line, 2);
  assert.equal(read.rows[1].line, 4);
  assert.equal(read.rows[1].cells.get("title.id"), "Judul baru");
  assert.equal(read.rows[0].cells.has("Catatan saya"), false);
  assert.ok(readSheetRows([["judul"], ["a"]], cols).error);
});

test("Excel ditulis lalu dibaca balik tanpa mengubah teks", () => {
  const tricky = `Baris 1\nBaris 2 <b> ${AMP} "kutip" ${AMP}amp; _x000D_`;
  const rows = [cols.map(headerText), entryRow(fields, cols, entry), ["", "", tricky]];
  const buf = xlsx.writeXlsx([{ name: "Data", header: true, rows, columns: cols.map((c) => ({ width: c.width, options: c.options })) }], codec);
  const back = xlsx.readXlsx(buf, codec);
  assert.deepEqual(back[0], rows[0]);
  assert.deepEqual(back[1].slice(0, 12), rows[1].map((v) => v));
  assert.equal(back[2][2], tricky);
});

test("berkas yang bukan Excel ditolak dengan pesan jelas", () => {
  assert.throws(() => xlsx.readXlsx(new TextEncoder().encode("bukan zip"), codec), /bukan Excel/);
});

test("CSV dengan koma, titik koma, kutip, dan baris baru", () => {
  assert.deepEqual(xlsx.parseCsv('﻿slug,title.id\r\na,"Judul, ""satu""\nbaris dua"\r\n'), [
    ["slug", "title.id"],
    ["a", 'Judul, "satu"\nbaris dua'],
  ]);
  assert.deepEqual(xlsx.parseCsv("slug;title.id\nb;Judul"), [["slug", "title.id"], ["b", "Judul"]]);
});
