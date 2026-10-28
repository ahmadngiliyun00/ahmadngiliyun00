// Uji aturan hitungan pembaca: asal kunjungan, deteksi robot, perangkat, dan hari WIB.
// Jalankan: npm test

import assert from "node:assert/strict";
import { test } from "node:test";
import { importTs } from "../scripts/lib/load-ts.mjs";

const { viewSource, isBot, deviceOf, wibDay } = await importTs(new URL("../src/lib/views.ts", import.meta.url));

const OWN = "ngiliyun.my.id";
const CHROME = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
const PHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";

test("parameter src dari tombol bagikan didahulukan", () => {
  assert.equal(viewSource("whatsapp", "https://www.google.com/", OWN), "whatsapp");
  assert.equal(viewSource("WhatsApp", "", OWN), "whatsapp");
  assert.equal(viewSource("jahat<script>", "", OWN), "direct");
});

test("referer dikenali, situs sendiri dan kosong dianggap langsung", () => {
  assert.equal(viewSource("", "https://www.google.co.id/", OWN), "google");
  assert.equal(viewSource("", "https://t.co/abc", OWN), "x");
  assert.equal(viewSource("", "https://lnkd.in/xyz", OWN), "linkedin");
  assert.equal(viewSource("", "https://ngiliyun.my.id/kabar/", OWN), "direct");
  assert.equal(viewSource("", "", OWN), "direct");
  assert.equal(viewSource("", "bukan url", OWN), "direct");
  assert.equal(viewSource("", "https://blog.contoh.id/a", OWN), "blog.contoh.id");
});

test("robot dan pratinjau tautan tidak dihitung", () => {
  assert.equal(isBot(CHROME), false);
  assert.equal(isBot(PHONE), false);
  assert.equal(isBot("Googlebot/2.1 (+http://www.google.com/bot.html)"), true);
  assert.equal(isBot("WhatsApp/2.23.20.0"), true);
  assert.equal(isBot("facebookexternalhit/1.1"), true);
  assert.equal(isBot("curl/8.4.0"), true);
  assert.equal(isBot(""), true);
});

test("perangkat dan hari WIB", () => {
  assert.equal(deviceOf(PHONE), "mobile");
  assert.equal(deviceOf(CHROME), "desktop");
  // 18.30 UTC sudah lewat tengah malam di WIB.
  assert.equal(wibDay(new Date("2026-10-28T18:30:00Z")), "2026-10-29");
  assert.equal(wibDay(new Date("2026-10-28T16:00:00Z")), "2026-10-28");
});
