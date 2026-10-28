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
