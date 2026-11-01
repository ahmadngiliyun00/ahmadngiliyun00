// Uji aturan beranda ringkas: alat utama, tahun awal perjalanan, dan kanal Kontak beranda.
// Jalankan: npm test

import assert from "node:assert/strict";
import { test } from "node:test";
import { importTs } from "../scripts/lib/load-ts.mjs";

const { mainTools, firstYear, showsInContact } = await importTs(new URL("../src/lib/home.ts", import.meta.url));

test("alat utama dari CMS didahulukan, dipangkas, dan tanpa duplikat", () => {
  assert.deepEqual(mainTools([" Python ", "", "Python", "Docker"], [["Moodle"]]), ["Python", "Docker"]);
  assert.equal(mainTools(["a", "b", "c", "d", "e", "f", "g", "h", "i"], []).length, 8);
});

test("tanpa isian CMS, alat diambil bergiliran dari tiap bidang", () => {
  const areas = [
    ["Moodle", "GitHub", "Python"],
    ["Python", "PyTorch"],
    ["Next.js", "Laravel"],
    ["Ubuntu", "Docker"],
  ];
  assert.deepEqual(mainTools(undefined, areas), ["Moodle", "Python", "Next.js", "Ubuntu", "GitHub", "PyTorch", "Laravel", "Docker"]);
  assert.deepEqual(mainTools([], areas, 3), ["Moodle", "Python", "Next.js"]);
  assert.deepEqual(mainTools(undefined, []), []);
});

test("tahun paling awal dibaca dari teks garis waktu", () => {
  assert.equal(firstYear(["Sekarang", "Februari 2022", "2017", "April 2025"]), 2017);
  assert.equal(firstYear(["Now"]), null);
});

test("kanal Kontak beranda mengikuti penanda, lalu daftar bawaan", () => {
  assert.equal(showsInContact("instagram", undefined), false);
  assert.equal(showsInContact("linkedin", undefined), true);
  assert.equal(showsInContact("instagram", true), true);
  assert.equal(showsInContact("linkedin", false), false);
});

test("Kabar terbaru: postingan media sosial bertanda didahulukan, kalau tidak ada yang terbaru", async () => {
  const { homeSocial, dateValue } = await importTs(new URL("../src/lib/home.ts", import.meta.url));
  const d = (year, month, day) => ({ year, month, day });
  const items = [
    { slug: "a", date: d(2026, 1, 5) },
    { slug: "b", date: d(2026, 9, 1) },
    { slug: "c", date: d(2025, 3, 2), onHome: true },
    { slug: "d", date: null },
    { slug: "e", date: d(2026, 10, 2) },
  ];
  assert.deepEqual(homeSocial(items).map((i) => i.slug), ["c"]);
  assert.deepEqual(homeSocial(items.map((i) => ({ ...i, onHome: false }))).map((i) => i.slug), ["e", "b"]);
  assert.deepEqual(homeSocial([]), []);
  assert.ok(dateValue(d(2026, 10, 2)) > dateValue(d(2026, 9, 30)));
  assert.equal(dateValue(null), 0);
});
