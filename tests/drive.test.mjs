// Uji pembaca tautan Google Drive untuk pratinjau bukti sertifikat.
// Jalankan: npm test

import assert from "node:assert/strict";
import { test } from "node:test";
import { importTs } from "../scripts/lib/load-ts.mjs";

const { parseDriveUrl, normalizeDriveUrl, drivePreviewUrl, isDriveFolder } = await importTs(
  new URL("../src/lib/drive.ts", import.meta.url),
);

const ID = "1AbCdEfGhIjKlMnOpQrStUvWxYz_0123";
const VIEW = `https://drive.google.com/file/d/${ID}/view`;
const AMP = String.fromCharCode(38);

test("tautan berbagi, pratinjau, dan sunting menjadi bentuk baku", () => {
  assert.equal(normalizeDriveUrl(`https://drive.google.com/file/d/${ID}/view?usp=sharing`), VIEW);
  assert.equal(normalizeDriveUrl(`https://drive.google.com/file/d/${ID}/preview`), VIEW);
  assert.equal(normalizeDriveUrl(`  https://drive.google.com/file/d/${ID}/edit?usp=drive_link  `), VIEW);
  assert.equal(normalizeDriveUrl(`https://drive.google.com/u/0/file/d/${ID}/view`), VIEW);
});

test("bentuk lama open?id dan uc?id diterima", () => {
  assert.equal(normalizeDriveUrl(`https://drive.google.com/open?id=${ID}`), VIEW);
  assert.equal(normalizeDriveUrl(`https://drive.google.com/uc?id=${ID}${AMP}export=download`), VIEW);
});

test("kode iframe dari menu Sematkan item diterima", () => {
  const embed = `<iframe src="https://drive.google.com/file/d/${ID}/preview" width="640" height="480" allow="autoplay"></iframe>`;
  assert.equal(normalizeDriveUrl(embed), VIEW);
});

test("resourcekey berkas lama ikut disimpan dan disematkan", () => {
  const url = `https://drive.google.com/file/d/${ID}/view?usp=sharing${AMP}resourcekey=0-abcDEF_12`;
  assert.equal(normalizeDriveUrl(url), `${VIEW}?resourcekey=0-abcDEF_12`);
  const embed = `<iframe src="https://drive.google.com/file/d/${ID}/preview?usp=sharing${AMP}amp;resourcekey=0-abc"></iframe>`;
  assert.equal(drivePreviewUrl(parseDriveUrl(embed)), `https://drive.google.com/file/d/${ID}/preview?resourcekey=0-abc`);
});

test("bukan berkas Drive ditolak", () => {
  assert.equal(normalizeDriveUrl(`http://drive.google.com/file/d/${ID}/view`), null);
  assert.equal(normalizeDriveUrl(`https://drive.google.com.evil.id/file/d/${ID}/view`), null);
  assert.equal(normalizeDriveUrl(`https://example.com/file/d/${ID}/view`), null);
  assert.equal(normalizeDriveUrl("https://drive.google.com/file/d/pendek/view"), null);
  assert.equal(normalizeDriveUrl(`https://drive.google.com/file/d/${ID}"onload="x/view`), null);
  assert.equal(normalizeDriveUrl("bukan tautan"), null);
  assert.equal(normalizeDriveUrl(`https://drive.google.com/drive/folders/${ID}`), null);
  assert.equal(isDriveFolder(`https://drive.google.com/drive/folders/${ID}?usp=sharing`), true);
  assert.equal(isDriveFolder(VIEW), false);
});
