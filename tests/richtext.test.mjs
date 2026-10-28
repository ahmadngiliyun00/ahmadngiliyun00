// Uji isi rich text: konversi teks, pembersihan HTML dari editor, dan gambar unggahan.
// Jalankan: npm test

import assert from "node:assert/strict";
import { test } from "node:test";
import sanitizeHtml from "sanitize-html";
import { importTs } from "../scripts/lib/load-ts.mjs";

const { htmlToText, textToHtml, asHtml, fileIdsIn, readingMinutes, STORE_POLICY, RENDER_POLICY } = await importTs(
  new URL("../src/lib/richtext.ts", import.meta.url),
);

const AMP = String.fromCharCode(38);
const FILE = "/files/0123456789abcdef01234567/";
const store = (html) => sanitizeHtml(html, STORE_POLICY);
const render = (html) => sanitizeHtml(html, RENDER_POLICY);

test("htmlToText membuang tag dan mengurai entitas", () => {
  assert.equal(htmlToText(`<h2>Judul</h2><p>Satu ${AMP}amp; dua<br>tiga</p>`), `Judul Satu ${AMP} dua tiga`);
  assert.equal(htmlToText("<p></p>"), "");
});

test("teks lama menjadi paragraf dan subjudul, dengan escape", () => {
  assert.equal(textToHtml("Baris <b>\n\n## Sub\n\nA\nB"), `<p>Baris ${AMP}lt;b${AMP}gt;</p><h2>Sub</h2><p>A<br>B</p>`);
  assert.equal(asHtml("<p>sudah</p>"), "<p>sudah</p>");
});

test("script, atribut event, dan javascript: dibuang", () => {
  const out = store(`<p onclick="x()">a</p><script>alert(1)</script><a href="javascript:alert(1)">b</a><iframe src="https://x"></iframe>`);
  assert.ok(!out.includes("script"));
  assert.ok(!out.includes("onclick"));
  assert.ok(!out.includes("javascript"));
  assert.ok(!out.includes("iframe"));
});

test("gambar hanya dari unggahan sendiri", () => {
  assert.ok(store(`<img src="${FILE}" alt="foto">`).includes(FILE));
  assert.equal(store(`<img src="https://pelacak.example/x.png">`), "");
  assert.equal(store(`<img src="data:image/png;base64,AAAA">`), "");
  assert.equal(store(`<img src="${FILE}" onerror="x()">`), `<img src="${FILE}" />`);
});

test("tautan keluar dibuka di tab baru saat dirender, gambar dimuat malas", () => {
  const out = render(`<a href="https://contoh.id">a</a><a href="/kabar/">b</a><img src="${FILE}" alt="">`);
  assert.ok(out.includes(`<a href="https://contoh.id" target="_blank" rel="noopener noreferrer">`));
  assert.ok(out.includes(`<a href="/kabar/">`));
  assert.ok(out.includes(`loading="lazy"`));
});

test("fileIdsIn dan perkiraan waktu baca", () => {
  assert.deepEqual(fileIdsIn(`<img src="${FILE}"><img src="${FILE}">`), ["0123456789abcdef01234567"]);
  assert.equal(readingMinutes("kata ".repeat(450)), 2);
  assert.equal(readingMinutes(""), 1);
});
