// Uji JSON untuk tag <script> (JSON-LD): tidak bisa menutup tag, isi tetap sama setelah diurai.
// Jalankan: npm test

import assert from "node:assert/strict";
import { test } from "node:test";
import { importTs } from "../scripts/lib/load-ts.mjs";

const { jsonForScript } = await importTs(new URL("../src/lib/json-script.ts", import.meta.url));

const AMP = String.fromCharCode(38);

test("teks berisi </script> tidak bisa menutup tag", () => {
  const evil = { headline: "</script><script>alert(1)</script>" };
  const out = jsonForScript(evil);
  assert.equal(out.includes("<"), false);
  assert.equal(out.includes(">"), false);
  assert.deepEqual(JSON.parse(out), evil);
});

test("ampersand dan pemisah baris Unicode di-escape, isi tetap sama", () => {
  const value = { name: `Riset ${AMP} Data`, note: "a b c", n: 3 };
  const out = jsonForScript(value);
  assert.equal(out.includes(AMP), false);
  assert.equal(out.includes(" "), false);
  assert.deepEqual(JSON.parse(out), value);
});
