// Uji aturan form kontak: perapian isian, validasi, deteksi tautan, dan jebakan waktu.
// Jalankan: npm test

import assert from "node:assert/strict";
import { test } from "node:test";
import { importTs } from "../scripts/lib/load-ts.mjs";

const { normalizeContact, validateContact, isValidEmail, countLinks, sentTooFast, CONTACT_LIMITS } = await importTs(
  new URL("../src/lib/contact.ts", import.meta.url),
);

const valid = {
  name: "Restiani",
  email: "restiani@contoh.ac.id",
  topic: "Kolaborasi riset",
  body: "Saya ingin mengajak meneliti klasifikasi citra bersama.",
};

test("isian valid tidak menghasilkan galat", () => {
  assert.deepEqual(validateContact(normalizeContact(valid)), {});
});

test("perapian: spasi tepi, spasi ganda pada nama, email huruf kecil, baris kosong beruntun", () => {
  const out = normalizeContact({
    name: "  Restiani   Putri ",
    email: " Restiani@Contoh.AC.ID ",
    topic: " Lainnya ",
    body: "Halo\r\n\r\n\r\n\r\nApa kabar?",
  });
  assert.equal(out.name, "Restiani Putri");
  assert.equal(out.email, "restiani@contoh.ac.id");
  assert.equal(out.topic, "Lainnya");
  assert.equal(out.body, "Halo\n\nApa kabar?");
});

test("nilai bukan string dianggap kosong", () => {
  const out = normalizeContact({ name: null, email: undefined, topic: 3, body: {} });
  assert.deepEqual(validateContact(out), {
    name: "required",
    email: "required",
    topic: "required",
    body: "required",
  });
});

test("email tidak valid ditolak", () => {
  for (const email of ["restiani", "restiani@", "restiani@contoh", "resti ani@contoh.id", "a@b.c"]) {
    assert.equal(isValidEmail(email), false, email);
  }
  for (const email of ["a@b.co", "ahmad@ngiliyun.my.id", "nama.belakang+tag@kampus.ac.id"]) {
    assert.equal(isValidEmail(email), true, email);
  }
});

test("pesan terlalu pendek dan terlalu panjang", () => {
  assert.equal(validateContact({ ...valid, body: "Halo" }).body, "tooShort");
  assert.equal(validateContact({ ...valid, body: "x".repeat(CONTACT_LIMITS.body + 1) }).body, "tooLong");
  assert.equal(validateContact({ ...valid, name: "n".repeat(CONTACT_LIMITS.name + 1) }).name, "tooLong");
});

test("lebih dari tiga tautan dianggap spam", () => {
  assert.equal(countLinks("lihat https://a.id dan www.b.id"), 2);
  const spam = "promo https://a.id https://b.id http://c.id www.d.id murah sekali";
  assert.equal(validateContact({ ...valid, body: spam }).body, "tooManyLinks");
  const ok = "repo https://github.com/x dan makalah https://doi.org/y";
  assert.equal(validateContact({ ...valid, body: ok }).body, undefined);
});

test("jebakan waktu: kurang dari 3 detik dianggap robot, nilai aneh tidak dihukum", () => {
  const now = 1_800_000_000_000;
  assert.equal(sentTooFast(now - 1000, now), true);
  assert.equal(sentTooFast(now - 5000, now), false);
  assert.equal(sentTooFast("", now), false);
  assert.equal(sentTooFast("bukan angka", now), false);
  assert.equal(sentTooFast(now + 60_000, now), false);
});
