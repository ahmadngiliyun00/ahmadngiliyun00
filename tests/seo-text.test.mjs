// Uji judul dan deskripsi bawaan untuk mesin pencari di src/data/profile.ts.
// Aturan: judul paling banyak 60 karakter, deskripsi 120 sampai 160 karakter, kalimat naratif
// tanpa titik dua, tanpa strip pemisah, tanpa nama kota, tanpa em dash dan ampersand.
// Jalankan: npm test

import assert from "node:assert/strict";
import { test } from "node:test";
import { importTs } from "../scripts/lib/load-ts.mjs";

const { copy } = await importTs(new URL("../src/data/profile.ts", import.meta.url));

const EM_DASH = String.fromCharCode(0x2014);
const AMPERSAND = String.fromCharCode(0x26);

function pages(lang) {
  const t = copy[lang];
  return {
    home: { title: t.meta.title, description: t.meta.description },
    archive: { title: t.archive.metaTitle, description: t.archive.metaDescription },
    news: { title: t.news.metaTitle, description: t.news.metaDescription },
    projects: { title: t.pages.projects.metaTitle, description: t.pages.projects.metaDescription },
    research: { title: t.pages.research.metaTitle, description: t.pages.research.metaDescription },
    teaching: { title: t.pages.teaching.metaTitle, description: t.pages.teaching.metaDescription },
    journey: { title: t.pages.journey.metaTitle, description: t.pages.journey.metaDescription },
  };
}

function checkStyle(text, where) {
  assert.ok(!text.includes(":"), `${where} memakai titik dua`);
  assert.ok(!/\s[-|]\s/.test(text), `${where} memakai strip atau garis tegak sebagai pemisah`);
  assert.ok(!text.includes("Cirebon"), `${where} menyebut kota`);
  assert.ok(!text.includes(EM_DASH), `${where} memakai em dash`);
  assert.ok(!text.includes(AMPERSAND), `${where} memakai ampersand`);
}

for (const lang of ["id", "en"]) {
  for (const [page, { title, description }] of Object.entries(pages(lang))) {
    test(`${lang} ${page}: panjang dan gaya judul serta deskripsi`, () => {
      assert.ok(title.length <= 60, `judul ${title.length} karakter: ${title}`);
      assert.ok(description.length >= 120, `deskripsi ${description.length} karakter, terlalu pendek`);
      assert.ok(description.length <= 160, `deskripsi ${description.length} karakter, terlalu panjang`);
      checkStyle(title, "judul");
      checkStyle(description, "deskripsi");
    });
  }
}
