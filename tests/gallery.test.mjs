// Uji aturan galeri gambar (carousel) berita dan postingan media sosial.
// Jalankan: npm test

import assert from "node:assert/strict";
import { test } from "node:test";
import { importTs } from "../scripts/lib/load-ts.mjs";

const { parseGallery, galleryItems, galleryIds, imageModeOf, socialSlides, gallerySlides, slideImages, moveItem, wrapIndex, GALLERY_MAX, fileUrl } =
  await importTs(new URL("../src/lib/gallery.ts", import.meta.url));
const { formFromEntry } = await importTs(new URL("../src/lib/transfer.ts", import.meta.url));

const A = "a".repeat(24);
const B = "b".repeat(24);
const C = "0123456789abcdef01234567";
const NUM = "gambar {n} dari {total}";

test("isian galeri JSON dibaca berurutan beserta teks alternatif", () => {
  const json = JSON.stringify([{ file: B, alt: { id: "Kelas", en: "" } }, { file: A }, { file: B }]);
  assert.deepEqual(parseGallery(json).items, [{ file: B, alt: { id: "Kelas", en: "" } }, { file: A }]);
  assert.deepEqual(parseGallery("").items, []);
  assert.deepEqual(parseGallery("[]").items, []);
});

test("bentuk lama: ID dipisah koma tetap terbaca", () => {
  assert.deepEqual(galleryIds(parseGallery(`${B},${A}, ${C}`).items), [B, A, C]);
  assert.deepEqual(galleryIds([A, B]), [A, B]);
});

test("isian tidak sah, terlalu banyak, atau teks terlalu panjang ditolak", () => {
  assert.ok(parseGallery("../etc/passwd").error);
  assert.ok(parseGallery("[{").error);
  assert.ok(parseGallery(JSON.stringify([{ file: "https://contoh.id/a.png" }])).error);
  const many = Array.from({ length: GALLERY_MAX + 1 }, (_, i) => ({ file: i.toString(16).padStart(24, "0") }));
  assert.ok(parseGallery(JSON.stringify(many)).error);
  assert.equal(parseGallery(JSON.stringify(many.slice(0, GALLERY_MAX))).error, undefined);
  assert.ok(parseGallery(JSON.stringify([{ file: A, alt: { id: "x".repeat(251), en: "" } }])).error);
});

test("item tersimpan dibaca dengan aman, teks alternatif kosong dibuang", () => {
  assert.deepEqual(galleryItems([A, 5, "x", { file: B, alt: { id: " ", en: "" } }, null]), [{ file: A }, { file: B }]);
  assert.deepEqual(galleryItems(undefined), []);
});

test("tab gambar media sosial: tersimpan didahulukan, data lama ditebak", () => {
  assert.equal(imageModeOf({ imageMode: "gallery", fileId: A }), "gallery");
  assert.equal(imageModeOf({ imageUrl: "https://contoh.id/a.jpg", fileId: A }), "link");
  assert.equal(imageModeOf({ fileId: A }), "upload");
  assert.equal(imageModeOf({ gallery: [A] }), "gallery");
  assert.equal(imageModeOf({ imageMode: "lain" }), "upload");
});

test("hanya tab yang dipilih yang tampil di situs", () => {
  const data = { imageUrl: "https://contoh.id/a.jpg", fileId: A, gallery: [{ file: B }, { file: C }] };
  assert.deepEqual(socialSlides({ ...data, imageMode: "link" }).map((x) => x.src), ["https://contoh.id/a.jpg"]);
  assert.deepEqual(socialSlides({ ...data, imageMode: "upload" }).map((x) => x.src), [fileUrl(A)]);
  assert.deepEqual(socialSlides({ ...data, imageMode: "gallery" }).map((x) => x.src), [fileUrl(B), fileUrl(C)]);
  assert.deepEqual(socialSlides({ imageMode: "link" }), []);
});

test("teks alternatif: per gambar dulu, lalu teks umum bernomor, lalu hiasan", () => {
  const slides = gallerySlides([{ file: A, alt: { id: "Pembukaan", en: "Opening" } }, { file: B }]);
  assert.deepEqual(slideImages(slides, "id", "Suasana kelas", NUM).map((i) => i.alt), ["Pembukaan", "Suasana kelas, gambar 2 dari 2"]);
  assert.deepEqual(slideImages(slides, "en", "", NUM).map((i) => i.alt), ["Opening", ""]);
  // Bahasa yang kosong memakai bahasa lain.
  const onlyId = gallerySlides([{ file: A, alt: { id: "Pembukaan", en: "" } }]);
  assert.equal(slideImages(onlyId, "en", "", NUM)[0].alt, "Pembukaan");
  assert.equal(slideImages(gallerySlides([{ file: A }]), "id", "Suasana kelas", NUM)[0].alt, "Suasana kelas");
});

test("menyusun ulang urutan dan berputar di ujung", () => {
  assert.deepEqual(moveItem(["a", "b", "c"], 0, 2), ["b", "c", "a"]);
  assert.deepEqual(moveItem(["a", "b", "c"], 2, 0), ["c", "a", "b"]);
  assert.deepEqual(moveItem(["a", "b", "c"], 1, 5), ["a", "b", "c"]);
  assert.equal(wrapIndex(3, 3), 0);
  assert.equal(wrapIndex(-1, 3), 2);
  assert.equal(wrapIndex(0, 0), 0);
});

test("impor lembar kerja tidak menghapus galeri dan teks alternatifnya", () => {
  const fields = [
    { name: "title", label: "Judul", type: "text" },
    { name: "gallery", label: "Galeri", type: "gallery" },
  ];
  const gallery = [{ file: A, alt: { id: "Satu", en: "" } }, { file: B }];
  const pairs = formFromEntry(fields, { slug: "x", visibility: "private", position: 0, data: { title: "X", gallery } });
  assert.deepEqual(parseGallery(pairs.get("f.gallery")[0]).items, gallery);
});
