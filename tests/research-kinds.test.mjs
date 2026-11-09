// Uji pembagian jenis capaian antara halaman Riset dan arsip Sertifikat (src/content/types.ts).
// Buku, hak cipta, publikasi, hibah, dan reviewer adalah keluaran atau kegiatan riset, jadi halaman
// detailnya di /riset/<slug>/. Jenis lain tetap di /sertifikat/<slug>/.
// Jalankan: npm test

import assert from "node:assert/strict";
import { test } from "node:test";
import { importTs } from "../scripts/lib/load-ts.mjs";

const { isResearchKind, RESEARCH_KINDS, kindLabels } = await importTs(new URL("../src/content/types.ts", import.meta.url));

test("buku dan hak cipta termasuk keluaran riset", () => {
  assert.equal(isResearchKind("buku"), true);
  assert.equal(isResearchKind("hki"), true);
  assert.equal(isResearchKind("publikasi"), true);
  assert.equal(isResearchKind("hibah"), true);
  assert.equal(isResearchKind("reviewer"), true);
});

test("sertifikat, pelatihan, beasiswa, keanggotaan, dan penghargaan tetap di arsip sertifikat", () => {
  for (const kind of ["sertifikat", "pelatihan", "beasiswa", "keanggotaan", "penghargaan"]) {
    assert.equal(isResearchKind(kind), false, kind);
  }
});

test("setiap jenis riset adalah jenis capaian yang dikenal", () => {
  for (const kind of RESEARCH_KINDS) assert.ok(kind in kindLabels, kind);
});
