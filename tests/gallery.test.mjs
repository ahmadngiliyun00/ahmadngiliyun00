// Uji aturan galeri gambar (carousel) berita dan postingan media sosial.
// Jalankan: npm test

import assert from "node:assert/strict";
import { test } from "node:test";
import { importTs } from "../scripts/lib/load-ts.mjs";

const { parseGallery, galleryIds, slideSources, slideImages, moveItem, wrapIndex, GALLERY_MAX, fileUrl } = await importTs(
  new URL("../src/lib/gallery.ts", import.meta.url),
);
const { formFromEntry } = await importTs(new URL("../src/lib/transfer.ts", import.meta.url));

const A = "a".repeat(24);
const B = "b".repeat(24);
const C = "0123456789abcdef01234567";

test("isian galeri dibaca berurutan, ID ganda dibuang", () => {
  assert.deepEqual(parseGallery(`${B},${A}, ${C}`).ids, [B, A, C]);
  assert.deepEqual(parseGallery(`${A}\n${A}\n${B}`).ids, [A, B]);
  assert.deepEqual(parseGallery("").ids, []);
  assert.deepEqual(parseGallery("  ,  ").ids, []);
  assert.equal(parseGallery(`${A},${B}`).error, undefined);
});

test("ID yang tidak sah dan galeri yang terlalu banyak ditolak", () => {
  assert.ok(parseGallery("../etc/passwd").error);
  assert.ok(parseGallery(`${A},https://contoh.id/gambar.png`).error);
  const many = Array.from({ length: GALLERY_MAX + 1 }, (_, i) => i.toString(16).padStart(24, "0"));
  assert.ok(parseGallery(many.join(",")).error);
  assert.equal(parseGallery(many.slice(0, GALLERY_MAX).join(",")).error, undefined);
});

test("galeri tersimpan dibaca dengan aman", () => {
  assert.deepEqual(galleryIds([A, 5, "x", B]), [A, B]);
  assert.deepEqual(galleryIds(undefined), []);
  assert.deepEqual(galleryIds("abc"), []);
});

test("urutan slide: tautan gambar atau unggahan lebih dulu, lalu galeri", () => {
  assert.deepEqual(slideSources({}), []);
  assert.deepEqual(slideSources({ fileId: A }), [fileUrl(A)]);
  assert.deepEqual(slideSources({ imageUrl: "https://contoh.id/a.jpg", fileId: A }), ["https://contoh.id/a.jpg"]);
  assert.deepEqual(slideSources({ fileId: A, gallery: [B, C] }), [fileUrl(A), fileUrl(B), fileUrl(C)]);
  assert.deepEqual(slideSources({ gallery: [B, C] }), [fileUrl(B), fileUrl(C)]);
  // Gambar yang sama tidak tampil dua kali.
  assert.deepEqual(slideSources({ fileId: A, gallery: [A, B] }), [fileUrl(A), fileUrl(B)]);
});

test("teks alternatif diberi nomor gambar bila lebih dari satu", () => {
  const imgs = slideImages(["/1", "/2"], "Suasana kelas", "gambar {n} dari {total}");
  assert.deepEqual(imgs.map((i) => i.alt), ["Suasana kelas, gambar 1 dari 2", "Suasana kelas, gambar 2 dari 2"]);
  assert.equal(slideImages(["/1"], "Suasana kelas", "gambar {n} dari {total}")[0].alt, "Suasana kelas");
  // Tanpa teks alternatif: gambar hiasan.
  assert.equal(slideImages(["/1", "/2"], "  ", "gambar {n} dari {total}")[1].alt, "");
});

test("menyusun ulang urutan dan berputar di ujung", () => {
  assert.deepEqual(moveItem(["a", "b", "c"], 0, 2), ["b", "c", "a"]);
  assert.deepEqual(moveItem(["a", "b", "c"], 2, 0), ["c", "a", "b"]);
  assert.deepEqual(moveItem(["a", "b", "c"], 1, 5), ["a", "b", "c"]);
  assert.equal(wrapIndex(3, 3), 0);
  assert.equal(wrapIndex(-1, 3), 2);
  assert.equal(wrapIndex(0, 0), 0);
});

test("impor lembar kerja tidak menghapus galeri", () => {
  const fields = [
    { name: "title", label: "Judul", type: "text" },
    { name: "gallery", label: "Galeri", type: "gallery" },
  ];
  const pairs = formFromEntry(fields, { slug: "x", visibility: "private", position: 0, data: { title: "X", gallery: [A, B] } });
  assert.deepEqual(pairs.get("f.gallery"), [`${A},${B}`]);
});
