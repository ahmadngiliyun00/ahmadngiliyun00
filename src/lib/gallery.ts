// Galeri gambar (carousel) untuk berita dan postingan media sosial: aturan murni yang dipakai
// formulir CMS, server, dan situs. Tidak bergantung pada React atau database, jadi bisa diuji.
//
// Galeri disimpan di data entri (isian gallery) sebagai daftar item berurutan:
// { file: ID berkas unggahan, alt?: teks alternatif per gambar dalam dua bahasa }.
// Data lama berupa daftar ID saja tetap terbaca. Gambar diunggah satu per satu ke UPLOAD_DIR,
// tidak pernah base64.

// Paling banyak 20 gambar per data, sama dengan batas carousel Instagram.
export const GALLERY_MAX = 20;

// Jeda perpindahan slide otomatis di situs.
export const SLIDE_MS = 3000;

// Panjang maksimal teks alternatif per gambar.
export const ALT_MAX = 250;

export type AltText = { id: string; en: string };
export type GalleryItem = { file: string; alt?: AltText };

// Sumber gambar postingan media sosial, dipilih lewat tab di CMS (isian imageMode).
export type ImageMode = "link" | "upload" | "gallery";
export const IMAGE_MODES: ImageMode[] = ["link", "upload", "gallery"];

const FILE_ID = /^[a-f0-9]{24}$/;

export function isFileId(value: string): boolean {
  return FILE_ID.test(value);
}

export function fileUrl(id: string): string {
  return `/files/${id}/`;
}

function cleanAlt(value: unknown): AltText | undefined {
  if (value === null || typeof value !== "object") return undefined;
  const o = value as Record<string, unknown>;
  const id = typeof o.id === "string" ? o.id.trim() : "";
  const en = typeof o.en === "string" ? o.en.trim() : "";
  if (id === "") {
    if (en === "") return undefined;
  }
  return { id, en };
}

// Item galeri yang tersimpan, dibaca dengan aman dari data JSON. Menerima bentuk lama (ID saja).
export function galleryItems(value: unknown): GalleryItem[] {
  if (!Array.isArray(value)) return [];
  const out: GalleryItem[] = [];
  for (const v of value) {
    const file = typeof v === "string" ? v : v !== null ? (typeof v === "object" ? (v as Record<string, unknown>).file : null) : null;
    if (typeof file !== "string") continue;
    if (!isFileId(file)) continue;
    if (out.some((x) => x.file === file)) continue;
    const alt = typeof v === "object" ? cleanAlt((v as Record<string, unknown>).alt) : undefined;
    out.push(alt === undefined ? { file } : { file, alt });
  }
  return out;
}

export function galleryIds(value: unknown): string[] {
  return galleryItems(value).map((x) => x.file);
}

// Membaca isian formulir galeri: JSON daftar item (formulir CMS), atau ID dipisah koma, spasi,
// atau baris baru (bentuk lama). ID ganda dibuang. error diisi bila ada yang tidak sah.
export function parseGallery(text: string): { items: GalleryItem[]; error?: string } {
  const raw = text.trim();
  if (raw === "") return { items: [] };
  let list: unknown[];
  if (raw.startsWith("[")) {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return { items: [], error: "isian galeri rusak. Muat ulang halaman lalu coba lagi." };
      list = parsed;
    } catch {
      return { items: [], error: "isian galeri rusak. Muat ulang halaman lalu coba lagi." };
    }
  } else {
    list = raw.split(/[\s,]+/).filter((p) => p !== "");
  }
  for (const v of list) {
    const file = typeof v === "string" ? v : v !== null ? (typeof v === "object" ? (v as Record<string, unknown>).file : null) : null;
    if (typeof file !== "string" || !isFileId(file.toLowerCase())) {
      return { items: [], error: "berisi berkas yang tidak dikenal. Muat ulang halaman lalu unggah ulang gambarnya." };
    }
  }
  const normalized = list.map((v) => (typeof v === "string" ? v.toLowerCase() : v));
  const items = galleryItems(normalized);
  if (items.length > GALLERY_MAX) return { items, error: `maksimal ${GALLERY_MAX} gambar.` };
  const long = items.some((x) => (x.alt ? x.alt.id.length > ALT_MAX || x.alt.en.length > ALT_MAX : false));
  if (long) return { items, error: `teks alternatif per gambar maksimal ${ALT_MAX} karakter.` };
  return { items };
}

// Sumber gambar yang dipakai postingan media sosial. imageMode tersimpan didahulukan; data lama
// tanpa imageMode ditebak dari isian yang terisi (tautan, lalu unggahan, lalu galeri).
export function imageModeOf(data: { imageMode?: unknown; imageUrl?: unknown; fileId?: unknown; gallery?: unknown }): ImageMode {
  if (typeof data.imageMode === "string") {
    if ((IMAGE_MODES as string[]).includes(data.imageMode)) return data.imageMode as ImageMode;
  }
  if (typeof data.imageUrl === "string") {
    if (data.imageUrl !== "") return "link";
  }
  if (typeof data.fileId === "string") {
    if (isFileId(data.fileId)) return "upload";
  }
  return galleryItems(data.gallery).length > 0 ? "gallery" : "upload";
}

export type Slide = { src: string; alt?: AltText };

// Slide postingan media sosial: hanya sumber dari tab yang dipilih. Isi tab lain tetap tersimpan
// di CMS tetapi tidak tampil di situs.
export function socialSlides(data: { imageMode?: unknown; imageUrl?: unknown; fileId?: unknown; gallery?: unknown }): Slide[] {
  const mode = imageModeOf(data);
  if (mode === "link") return typeof data.imageUrl === "string" ? (data.imageUrl === "" ? [] : [{ src: data.imageUrl }]) : [];
  if (mode === "upload") return typeof data.fileId === "string" ? (isFileId(data.fileId) ? [{ src: fileUrl(data.fileId) }] : []) : [];
  return gallerySlides(data.gallery);
}

export function gallerySlides(value: unknown): Slide[] {
  return galleryItems(value).map((x) => (x.alt ? { src: fileUrl(x.file), alt: x.alt } : { src: fileUrl(x.file) }));
}

// Gambar slide beserta teks alternatifnya untuk satu bahasa:
// 1. teks alternatif gambar itu sendiri (bila diisi),
// 2. kalau tidak, teks alternatif umum, ditambah nomor gambar bila lebih dari satu
//    (template berisi {n} dan {total}), misalnya "Suasana kelas, gambar 2 dari 5",
// 3. kalau keduanya kosong, alt="" (gambar hiasan).
// Bahasa yang kosong memakai bahasa lain, sama seperti isian dua bahasa lain di situs.
export function slideImages(slides: Slide[], lang: "id" | "en", overall: string, numbered: string): { src: string; alt: string }[] {
  const text = overall.trim();
  const total = slides.length;
  const other = lang === "id" ? "en" : "id";
  return slides.map((s, i) => {
    const own = s.alt ? (s.alt[lang] !== "" ? s.alt[lang] : s.alt[other]) : "";
    if (own !== "") return { src: s.src, alt: own };
    if (text === "") return { src: s.src, alt: "" };
    if (total === 1) return { src: s.src, alt: text };
    return { src: s.src, alt: `${text}, ${numbered.replace("{n}", String(i + 1)).replace("{total}", String(total))}` };
  });
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
