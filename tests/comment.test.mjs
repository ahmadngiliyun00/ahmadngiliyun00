// Uji aturan form komentar: perapian, validasi, batas tautan, dan jebakan waktu.
// Jalankan: npm test

import assert from "node:assert/strict";
import { test } from "node:test";
import { importTs } from "../scripts/lib/load-ts.mjs";

const { normalizeComment, validateComment, commentTooFast, COMMENT_LIMITS } = await importTs(
  new URL("../src/lib/comment.ts", import.meta.url),
);

const valid = { name: "Restiani", email: "restiani@contoh.ac.id", body: "Tulisan yang bermanfaat, terima kasih." };

test("isian dirapikan", () => {
  assert.deepEqual(normalizeComment({ name: "  Resti   ani ", email: " A@B.ID ", body: "a\r\n\r\n\r\n\r\nb" }), {
    name: "Resti ani",
    email: "a@b.id",
    body: "a\n\nb",
  });
});

test("komentar wajar lolos", () => {
  assert.deepEqual(validateComment(valid), {});
});

test("isian wajib, email, dan panjang", () => {
  assert.deepEqual(validateComment({ name: "", email: "", body: "" }), { name: "required", email: "required", body: "required" });
  assert.equal(validateComment({ ...valid, email: "bukan-email" }).email, "invalidEmail");
  assert.equal(validateComment({ ...valid, body: "ok" }).body, "tooShort");
  assert.equal(validateComment({ ...valid, body: "a".repeat(COMMENT_LIMITS.body + 1) }).body, "tooLong");
});

test("lebih dari dua tautan dianggap spam", () => {
  assert.equal(validateComment({ ...valid, body: "https://a.id https://b.id www.c.id" }).body, "tooManyLinks");
  assert.equal(validateComment({ ...valid, body: "Lihat https://a.id dan https://b.id" }).body, undefined);
});

test("jebakan waktu", () => {
  const now = 1_000_000;
  assert.equal(commentTooFast(String(now - 500), now), true);
  assert.equal(commentTooFast(String(now - 5000), now), false);
  assert.equal(commentTooFast("", now), false);
});
