// Galeri gambar (carousel) untuk berita dan postingan media sosial: aturan murni yang dipakai
// formulir CMS, server, dan situs. Tidak bergantung pada React atau database, jadi bisa diuji.
//
// Galeri disimpan di data entri sebagai daftar ID berkas unggahan sesuai urutan tampil
// (isian gallery). Gambar diunggah satu per satu ke UPLOAD_DIR, tidak pernah base64.

// Paling banyak 20 gambar per data, sama dengan batas carousel Instagram.
export const GALLERY_MAX = 20;

// Jeda perpindahan slide otomatis di situs.
export const SLIDE_MS = 3000;

const FILE_ID = /^[a-f0-9]{24}$/;

export function isFileId(value: string): boolean {
  return FILE_ID.test(value);
}

export function fileUrl(id: string): string {
  return `/files/${id}/`;
}

// Membaca isian formulir (ID dipisah koma, spasi, atau baris baru) menjadi daftar ID berurutan.
// ID ganda dibuang. error diisi bila ada ID yang tidak sah atau jumlahnya melebihi batas.
export function parseGallery(text: string): { ids: string[]; error?: string } {
  const parts = text
    .split(/[\s,]+/)
    .map((p) => p.trim().toLowerCase())
    .filter((p) => p !== "");
  const ids: string[] = [];
  for (const p of parts) {
    if (!isFileId(p)) return { ids, error: "berisi berkas yang tidak dikenal. Muat ulang halaman lalu unggah ulang gambarnya." };
    if (!ids.includes(p)) ids.push(p);
  }
  if (ids.length > GALLERY_MAX) return { ids, error: `maksimal ${GALLERY_MAX} gambar.` };
  return { ids };
}

// Nilai galeri yang tersimpan, dibaca dengan aman dari data JSON.
export function galleryIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string" ? isFileId(v) : false);
}

// Daftar gambar slide untuk satu data, sesuai urutan tampil:
// 1. gambar tunggal lama (Tautan gambar, lalu Gambar unggahan), bila ada,
// 2. lalu semua gambar galeri sesuai urutan yang disusun di CMS.
export function slideSources(data: { imageUrl?: unknown; fileId?: unknown; gallery?: unknown }): string[] {
  const out: string[] = [];
  if (typeof data.imageUrl === "string") {
    if (data.imageUrl !== "") out.push(data.imageUrl);
  }
  if (out.length === 0) {
    if (typeof data.fileId === "string") {
      if (isFileId(data.fileId)) out.push(fileUrl(data.fileId));
    }
  }
  for (const id of galleryIds(data.gallery)) {
    const src = fileUrl(id);
    if (!out.includes(src)) out.push(src);
  }
  return out;
}

// Memindahkan satu item dalam daftar (susun ulang galeri). Indeks di luar batas diabaikan.
export function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (from < 0 || from >= list.length) return list;
  if (to < 0 || to >= list.length) return list;
  if (from === to) return list;
  const next = list.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

// Indeks slide berikutnya atau sebelumnya, berputar di ujung.
export function wrapIndex(index: number, total: number): number {
  if (total <= 0) return 0;
  return ((index % total) + total) % total;
}

// Gambar slide beserta teks alternatifnya. Satu teks alternatif berlaku untuk seluruh galeri;
// bila ada lebih dari satu gambar, nomor gambar ditambahkan (template berisi {n} dan {total}),
// misalnya "Suasana kelas, gambar 2 dari 5". Teks kosong berarti gambar hiasan (alt="").
export function slideImages(srcs: string[], alt: string, numbered: string): { src: string; alt: string }[] {
  const text = alt.trim();
  const total = srcs.length;
  return srcs.map((src, i) => {
    if (text === "") return { src, alt: "" };
    if (total === 1) return { src, alt: text };
    return { src, alt: `${text}, ${numbered.replace("{n}", String(i + 1)).replace("{total}", String(total))}` };
  });
}
