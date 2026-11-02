// Uji format tanggal dan bobot sitemap.xml.
// Jalankan: npm test

import assert from "node:assert/strict";
import { test } from "node:test";
import { importTs } from "../scripts/lib/load-ts.mjs";

const { w3cDate, SITEMAP_RULES } = await importTs(new URL("../src/lib/sitemap.ts", import.meta.url));

test("lastmod memakai W3C Datetime WIB tanpa milidetik", () => {
  assert.equal(w3cDate(new Date("2026-11-02T16:21:28.123Z")), "2026-11-02T23:21:28+07:00");
  // Lewat tengah malam WIB: tanggal ikut berganti.
  assert.equal(w3cDate("2026-10-31T18:30:00Z"), "2026-11-01T01:30:00+07:00");
  assert.match(w3cDate(Date.UTC(2026, 0, 5, 1, 2, 3)), /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+07:00$/);
});

test("tanggal kosong atau tidak sah tidak menghasilkan lastmod", () => {
  assert.equal(w3cDate(undefined), undefined);
  assert.equal(w3cDate("bukan tanggal"), undefined);
  assert.equal(w3cDate(new Date(Number.NaN)), undefined);
});

test("bobot halaman masuk rentang yang sah", () => {
  const freq = ["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"];
  for (const rule of Object.values(SITEMAP_RULES)) {
    assert.ok(rule.priority >= 0);
    assert.ok(rule.priority <= 1);
    assert.ok(freq.includes(rule.changeFrequency));
  }
  assert.equal(SITEMAP_RULES.home.priority, 1);
});
