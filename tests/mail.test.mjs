// Uji template email: isian pengunjung di-escape dan baris baru dipertahankan.
// Jalankan: npm test

import assert from "node:assert/strict";
import { test } from "node:test";
import { importTs } from "../scripts/lib/load-ts.mjs";

const { escapeHtml, renderMail } = await importTs(new URL("../src/lib/mail-template.ts", import.meta.url));

const AMP = String.fromCharCode(38);

const base = {
  preheader: "Cuplikan",
  badge: "Form kontak",
  title: "Pesan baru",
  intro: "Pengantar",
  rows: [],
  actions: [],
  footer: "Kaki",
};

test("escapeHtml mengganti karakter khusus HTML", () => {
  assert.equal(escapeHtml(`<b a="1">'x'</b>`), `${AMP}lt;b a=${AMP}quot;1${AMP}quot;${AMP}gt;${AMP}#39;x${AMP}#39;${AMP}lt;/b${AMP}gt;`);
  assert.equal(escapeHtml(`a ${AMP} b`), `a ${AMP}amp; b`);
});

test("isi pesan pengunjung tidak bisa menyisipkan HTML", () => {
  const html = renderMail({
    ...base,
    title: "<img src=x onerror=alert(1)>",
    rows: [{ label: "Nama", value: "<script>alert(1)</script>" }],
    message: { label: "Isi", body: `<a href="https://jahat.example">klik</a>` },
  });
  assert.ok(!html.includes("<script>"));
  assert.ok(!html.includes("<img src=x"));
  assert.ok(!html.includes(`<a href="https://jahat.example">`));
});

test("tautan dari isian ikut di-escape", () => {
  const html = renderMail({ ...base, rows: [{ label: "Email", value: "a@b.id", href: `mailto:a@b.id" onclick="x` }] });
  assert.ok(!html.includes(`" onclick="x`));
});

test("baris baru di isi pesan menjadi <br>", () => {
  const html = renderMail({ ...base, message: { label: "Isi", body: "baris satu\r\nbaris dua\nbaris tiga" } });
  assert.ok(html.includes("baris satu<br>baris dua<br>baris tiga"));
});
