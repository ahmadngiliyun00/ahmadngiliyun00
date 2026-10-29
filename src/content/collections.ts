// Konfigurasi koleksi CMS: field formulir, label admin, cara menampilkan judul, dan urutan.
// Menambah field baru di sini otomatis muncul di formulir admin dan ikut divalidasi.

import type { Field, Option } from "@/content/fields";
import { kindLabels, postKindLabels, programLabels, type AchievementKind, type CollectionKey, type PostKind, type Program } from "@/content/types";
import { copy } from "@/data/profile";
import { showsInContact } from "@/lib/home";

type Doc = Record<string, unknown>;

export type CollectionConfig = {
  key: CollectionKey;
  label: string; // nama jamak di admin
  singular: string;
  description: string;
  group: "Capaian" | "Kabar" | "Proyek" | "Mengajar" | "Profil";
  fields: Field[];
  title: (data: Doc) => string;
  subtitle?: (data: Doc) => string;
  // "date" = urut tanggal terbit terbaru (capaian); "position" = urutan manual
  order: "date" | "position";
  publicPath?: { id: string; en: string }; // halaman detail publik, bila ada
  hasPage?: (data: Doc) => boolean; // bila ada, hanya data yang lolos fungsi ini punya halaman detail
  // Nilai formulir untuk isian yang belum pernah disimpan, supaya formulir menampilkan apa yang tampil di situs.
  fill?: (slug: string, data: Doc) => Doc;
};

// Teks dua bahasa untuk judul di CMS: Indonesia, atau Inggris bila Indonesia belum diisi.
const loc = (v: unknown): string => {
  if (v === null || typeof v !== "object") return "";
  const o = v as { id?: string; en?: string };
  return o.id || o.en || "";
};
const s = (v: unknown): string => (typeof v === "string" ? v : "");

// Judul dan deskripsi SEO halaman dalam, satu pasang isian per halaman.
const PAGE_SEO: { key: "projects" | "research" | "teaching" | "journey"; label: string; paths: string }[] = [
  { key: "projects", label: "Proyek", paths: "/proyek/ dan /en/projects/" },
  { key: "research", label: "Riset dan Publikasi", paths: "/riset/ dan /en/research/" },
  { key: "teaching", label: "Mengajar", paths: "/mengajar/ dan /en/teaching/" },
  { key: "journey", label: "Perjalanan", paths: "/perjalanan/ dan /en/journey/" },
];

const pageSeoFields: Field[] = PAGE_SEO.flatMap((p) => [
  {
    name: `${p.key}.title`,
    label: `${p.label}: judul`,
    type: "localized" as const,
    placeholder: { id: copy.id.pages[p.key].metaTitle, en: copy.en.pages[p.key].metaTitle },
    help: `Halaman ${p.paths}. Kosongkan untuk memakai judul bawaan (teks samar).`,
  },
  {
    name: `${p.key}.description`,
    label: `${p.label}: deskripsi`,
    type: "localized" as const,
    multiline: true,
    placeholder: { id: copy.id.pages[p.key].metaDescription, en: copy.en.pages[p.key].metaDescription },
  },
]);

const kindOptions: Option[] = (Object.keys(kindLabels) as AchievementKind[]).map((k) => ({
  value: k,
  label: kindLabels[k].id,
}));

const programOptions: Option[] = (Object.keys(programLabels) as Program[]).map((p) => ({
  value: p,
  label: programLabels[p].id,
}));

function dateText(v: unknown): string {
  if (v === null || typeof v !== "object") return "";
  const d = v as { year?: number; month?: number };
  if (d.year === undefined) return "";
  return d.month === undefined ? String(d.year) : `${String(d.month).padStart(2, "0")}/${d.year}`;
}

export const collections: CollectionConfig[] = [
  {
    key: "achievement",
    label: "Sertifikat dan capaian",
    singular: "capaian",
    description: "Sertifikat, pelatihan, hak cipta, buku, publikasi, hibah, reviewer, dan keanggotaan.",
    group: "Capaian",
    order: "date",
    publicPath: { id: "/sertifikat/", en: "/en/certificates/" },
    title: (d) => loc(d.title),
    subtitle: (d) => {
      const kind = s(d.kind) as AchievementKind;
      const label = kindLabels[kind] ? kindLabels[kind].id : kind;
      return [label, s(d.issuer), dateText(d.issued)].filter((x) => x !== "").join(" . ");
    },
    fields: [
      { name: "title", label: "Judul", type: "localized", required: true, help: "Judul Indonesia dipakai sebagai nama resmi di LinkedIn." },
      { name: "kind", label: "Kategori", type: "select", options: kindOptions, required: true },
      { name: "issuer", label: "Penerbit atau terbitan", type: "text", required: true },
      { name: "summary", label: "Ringkasan", type: "localized", multiline: true, help: "Satu sampai dua kalimat. Wajib kecuali publikasi." },
      { name: "issued", width: "third", label: "Tanggal terbit", type: "date", help: "Kosongkan bila belum diketahui. Jangan menebak." },
      { name: "expires", width: "third", label: "Berlaku sampai", type: "date" },
      { name: "ongoing", label: "Masih berjalan (misalnya reviewer)", type: "boolean" },
      { name: "credentialId", label: "ID kredensial atau nomor pencatatan", type: "text" },
      { name: "reference", label: "Nomor sertifikat tambahan", type: "text" },
      { name: "verifyUrl", label: "URL verifikasi resmi", type: "url" },
      {
        name: "authorship",
        label: "Posisi penulis (khusus publikasi)",
        type: "select",
        options: [
          { value: "sole", label: "Penulis tunggal" },
          { value: "first", label: "Penulis pertama" },
          { value: "second", label: "Penulis kedua" },
          { value: "co", label: "Penulis pendamping" },
        ],
      },
      { name: "fileId", label: "Berkas sertifikat", type: "file", help: "PDF atau gambar, maksimal 5 MB. Tutup data pribadi (NIK, alamat, nomor anggota, kode QR) sebelum mengunggah." },
      {
        name: "driveUrl",
        label: "Tautan Google Drive",
        type: "url",
        drive: true,
        width: "full",
        placeholder: "https://drive.google.com/file/d/.../view",
        help: "Tempel tautan berbagi atau kode sematan berkas (bukan folder). Di Google Drive, atur akses ke Siapa saja yang memiliki link dan matikan opsi download untuk pelihat. Bila berkas sertifikat juga diunggah, berkas unggahan yang tampil di situs.",
      },
      { name: "skills", label: "Keterampilan", type: "list", help: "Satu per baris." },
      { name: "related", label: "Tautan terkait", type: "links", help: "Satu per baris: Label Indonesia | Label Inggris | https://..." },
      { name: "featured", label: "Sorot di beranda (maksimal 6, tiga terbaru yang tampil)", type: "boolean" },
      { name: "showOnHome", label: "Tampilkan di tab Hak cipta beranda (khusus HKI, maksimal 5, tiga terbaru yang tampil)", type: "boolean" },
      { name: "linkedin", label: "Tombol Tambahkan ke LinkedIn (khusus sertifikat dan pelatihan)", type: "boolean" },
    ],
  },
  {
    key: "post",
    label: "Berita dan tulisan",
    singular: "berita",
    description: "Liputan media tentang Anda, tulisan sendiri, dan kabar terbaru. Isi lengkap yang diisi membuat halaman sendiri di situs.",
    group: "Kabar",
    order: "date",
    publicPath: { id: "/kabar/", en: "/en/news/" },
    hasPage: (d) => loc(d.body) !== "",
    title: (d) => loc(d.title),
    subtitle: (d) => {
      const kind = s(d.kind) as PostKind;
      const label = postKindLabels[kind] ? postKindLabels[kind].id : kind;
      return [label, s(d.outlet), dateText(d.date)].filter((x) => x !== "").join(" | ");
    },
    fields: [
      {
        name: "kind",
        width: "third",
        label: "Jenis",
        type: "select",
        required: true,
        options: (Object.keys(postKindLabels) as PostKind[]).map((k) => ({ value: k, label: postKindLabels[k].id })),
      },
      { name: "date", width: "third", label: "Tanggal terbit", type: "date", help: "Wajib untuk data public." },
      {
        name: "sourceLang",
        width: "third",
        label: "Bahasa sumber",
        type: "select",
        options: [
          { value: "id", label: "Bahasa Indonesia" },
          { value: "en", label: "Bahasa Inggris" },
        ],
        help: "Untuk tautan ke luar. Situs versi lain menandai bahasa artikel sumber.",
      },
      { name: "title", label: "Judul", type: "localized", required: true, help: "Untuk liputan, tulis judul asli di versi bahasa sumber dan terjemahannya di versi lain." },
      { name: "outlet", label: "Media atau penerbit", type: "text", placeholder: "Dicoding Blog", help: "Wajib untuk liputan media." },
      { name: "url", label: "Tautan sumber", type: "url", placeholder: "https://www.dicoding.com/blog/...", help: "Wajib untuk liputan. Untuk tulisan, isi bila diterbitkan di tempat lain." },
      { name: "summary", label: "Ringkasan", type: "localized", multiline: true, help: "Satu sampai tiga kalimat, tampil di kartu beranda dan arsip." },
      {
        name: "body",
        label: "Isi lengkap",
        type: "richtext",
        help: "Opsional. Bila diisi, tulisan punya halaman sendiri di /kabar/. Gambar bisa diunggah lewat tombol gambar, ditempel, atau diseret; ukurannya diperkecil otomatis. Isi teks alternatif untuk setiap gambar.",
      },
      {
        name: "comments",
        width: "full",
        label: "Izinkan komentar",
        type: "boolean",
        help: "Menampilkan kolom komentar di halaman tulisan. Komentar yang masuk tampil setelah Anda setujui di menu Komentar. Mematikannya menyembunyikan form dan semua komentar.",
      },
    ],
  },
  {
    key: "project",
    label: "Proyek unggulan",
    singular: "proyek",
    description: "Tiga pertama tampil ringkas di beranda; semuanya tampil lengkap di halaman Proyek. Kode terbuka.",
    group: "Proyek",
    order: "position",
    title: (d) => s(d.name),
    subtitle: (d) => s(d.stack),
    fields: [
      { name: "name", label: "Nama", type: "text", required: true },
      { name: "stack", label: "Bahasa utama", type: "text", required: true, help: "Misalnya Python atau TypeScript." },
      { name: "repo", label: "Repositori", type: "url", required: true },
      { name: "demo", label: "Demo", type: "url" },
      {
        name: "visual",
        label: "Ilustrasi",
        type: "select",
        required: true,
        options: [
          { value: "cluster", label: "Kluster (K-Means)" },
          { value: "sentiment", label: "Sentimen" },
          { value: "vision", label: "Computer vision" },
        ],
      },
      { name: "copyright", width: "half", label: "Hak cipta terdaftar", type: "boolean" },
      { name: "badge", label: "Lencana tambahan", type: "localized" },
      { name: "tags", label: "Tag", type: "localizedList", required: true },
      { name: "summary", label: "Ringkasan", type: "localized", multiline: true, required: true },
    ],
  },
  {
    key: "system",
    label: "Sistem yang dikembangkan",
    singular: "sistem",
    description: "Sistem di halaman Proyek. Repositori privat tampil tanpa tautan kode.",
    group: "Proyek",
    order: "position",
    title: (d) => s(d.name),
    subtitle: (d) => loc(d.period),
    fields: [
      { name: "name", label: "Nama", type: "text", required: true },
      { name: "full", label: "Kepanjangan", type: "text" },
      { name: "period", width: "half", label: "Periode", type: "localized", required: true },
      { name: "role", width: "half", label: "Peran", type: "localized", required: true },
      { name: "repo", width: "full", label: "Repositori publik", type: "url", help: "Isi hanya bila repositorinya publik." },
      { name: "stack", label: "Teknologi", type: "list", required: true, help: "Satu per baris." },
      { name: "summary", label: "Ringkasan", type: "localized", multiline: true, required: true },
    ],
  },
  {
    key: "institution",
    label: "Kampus",
    singular: "kampus",
    description: "Kampus di halaman Mengajar. Mata kuliah merujuk ke kampus lewat slug.",
    group: "Mengajar",
    order: "position",
    title: (d) => s(d.name),
    subtitle: (d) => loc(d.role),
    fields: [
      { name: "name", label: "Nama kampus", type: "text", required: true },
      { name: "role", width: "half", label: "Peran", type: "localized", required: true },
      { name: "note", label: "Catatan", type: "localized", multiline: true, required: true },
    ],
  },
  {
    key: "course",
    label: "Mata kuliah",
    singular: "mata kuliah",
    description: "Mata kuliah per kampus dengan kode semester.",
    group: "Mengajar",
    order: "position",
    title: (d) => loc(d.name),
    subtitle: (d) => `${s(d.institution)} . ${Array.isArray(d.terms) ? (d.terms as string[]).join(", ") : ""}`,
    fields: [
      { name: "institution", label: "Kampus", type: "reference", collection: "institution", required: true },
      { name: "repo", label: "Materi di GitHub", type: "url" },
      { name: "name", label: "Nama mata kuliah", type: "localized", required: true },
      { name: "programs", label: "Program studi", type: "multiselect", options: programOptions, required: true },
      { name: "terms", label: "Kode semester", type: "list", required: true, help: "Satu per baris, misalnya 26271 (ganjil 2026/2027)." },
    ],
  },
  {
    key: "term",
    label: "Semester",
    singular: "semester",
    description: "Kode dan label semester. Tandai satu sebagai semester berjalan.",
    group: "Mengajar",
    order: "position",
    title: (d) => `${s(d.code)} ${loc(d.label)}`,
    subtitle: (d) => (d.current === true ? "Semester berjalan" : ""),
    fields: [
      { name: "code", label: "Kode", type: "text", required: true, help: "Tahun akademik + semester, misalnya 26271." },
      { name: "current", width: "half", label: "Semester berjalan", type: "boolean" },
      { name: "label", label: "Label", type: "localized", required: true },
    ],
  },
  {
    key: "focus",
    label: "Bidang keahlian mengajar",
    singular: "bidang",
    description: "Kelompok mata kuliah yang menjadi kekuatan mengajar.",
    group: "Mengajar",
    order: "position",
    title: (d) => loc(d.title),
    fields: [
      { name: "title", label: "Bidang", type: "localized", required: true },
      { name: "courses", label: "Contoh mata kuliah", type: "localized", required: true },
    ],
  },
  {
    key: "milestone",
    label: "Perjalanan",
    singular: "peristiwa",
    description: "Garis waktu di halaman Perjalanan, urut dari yang paling awal.",
    group: "Profil",
    order: "position",
    title: (d) => `${loc(d.when)}: ${loc(d.title)}`,
    fields: [
      { name: "when", width: "half", label: "Waktu", type: "localized", required: true },
      { name: "current", width: "half", label: "Peristiwa saat ini (titik berdenyut)", type: "boolean" },
      { name: "title", label: "Judul", type: "localized", required: true },
      { name: "body", label: "Isi", type: "localized", multiline: true, required: true },
    ],
  },
  {
    key: "area",
    label: "Yang saya kerjakan",
    singular: "bidang kerja",
    description: "Empat baris di bagian Tentang beranda (judul dan isi) dan alat per bidang di halaman Proyek.",
    group: "Profil",
    order: "position",
    title: (d) => loc(d.title),
    fields: [
      {
        name: "icon",
        label: "Ikon",
        type: "select",
        required: true,
        options: [
          { value: "teach", label: "Mengajar" },
          { value: "ai", label: "AI" },
          { value: "web", label: "Web" },
          { value: "server", label: "Server" },
        ],
      },
      { name: "title", width: "half", label: "Judul", type: "localized", required: true },
      { name: "body", label: "Isi", type: "localized", multiline: true, required: true },
      { name: "tools", label: "Alat", type: "list", required: true },
    ],
  },
  {
    key: "contribution",
    label: "Di luar kode",
    singular: "kontribusi",
    description: "Kontribusi di halaman Proyek, di bawah grafik GitHub. Tautan berawalan # ke bagian beranda lama (misalnya #research) otomatis diarahkan ke halaman barunya.",
    group: "Profil",
    order: "position",
    title: (d) => loc(d.title),
    fields: [
      { name: "title", label: "Judul", type: "localized", required: true },
      { name: "body", label: "Isi", type: "localized", multiline: true, required: true },
      { name: "href", label: "Tautan", type: "url", help: "Awali dengan # untuk bagian situs, misalnya #achievements (beranda) atau #research (halaman Riset)." },
      { name: "linkLabel", width: "half", label: "Teks tautan", type: "localized" },
    ],
  },
  {
    key: "collab",
    label: "Jenis kerja sama",
    singular: "kerja sama",
    description: "Judulnya menjadi pilihan topik di formulir kontak; keterangannya tampil di bawah pilihan saat topik itu dipilih.",
    group: "Profil",
    order: "position",
    title: (d) => loc(d.title),
    fields: [
      { name: "title", label: "Judul", type: "localized", required: true },
      { name: "body", label: "Isi", type: "localized", multiline: true, required: true },
    ],
  },
  {
    key: "plan",
    label: "Rencana ke depan",
    singular: "rencana",
    description: "Tahap rencana per tahun di bagian Arah ke depan, halaman Perjalanan, urut dari yang terdekat.",
    group: "Profil",
    order: "position",
    title: (d) => `${s(d.period)} ${loc(d.title)}`.trim(),
    fields: [
      { name: "period", label: "Periode", type: "text", required: true, placeholder: "2027" },
      { name: "current", width: "half", label: "Sedang berjalan", type: "boolean", help: "Tandai satu tahap yang sedang dikerjakan." },
      { name: "title", label: "Judul", type: "localized", required: true },
      { name: "points", label: "Butir rencana", type: "localizedList", required: true },
    ],
  },
  {
    key: "principle",
    label: "Prinsip kerja dengan AI",
    singular: "prinsip",
    description: "Cara bekerja dengan AI di bagian Arah ke depan, halaman Perjalanan.",
    group: "Profil",
    order: "position",
    title: (d) => loc(d.title),
    fields: [
      { name: "title", label: "Judul", type: "localized", required: true },
      { name: "body", label: "Isi", type: "localized", multiline: true, required: true },
    ],
  },
  {
    key: "channel",
    label: "Kanal kontak",
    singular: "kanal",
    description: "Tautan media sosial. Hanya kanal bertanda Tampil di kontak beranda yang muncul di bagian Kontak; sisanya tetap tersimpan di sini.",
    group: "Profil",
    order: "position",
    title: (d) => s(d.label),
    subtitle: (d) => s(d.handle),
    fields: [
      { name: "label", label: "Nama", type: "text", required: true },
      { name: "handle", label: "Nama akun", type: "text", required: true },
      { name: "href", label: "Tautan", type: "url", required: true },
      { name: "note", width: "half", label: "Keterangan", type: "localized", required: true },
      {
        name: "onHome",
        label: "Tampil di kontak beranda",
        type: "boolean",
        help: "Sebaiknya paling banyak empat kanal utama supaya bagian Kontak tetap ringkas.",
      },
    ],
    fill: (slug, data) => (typeof data.onHome === "boolean" ? data : { ...data, onHome: showsInContact(slug, undefined) }),
  },
];

export function getCollection(key: string): CollectionConfig | undefined {
  return collections.find((c) => c.key === key);
}

// ---------- Pengaturan tunggal ----------

export type SettingsConfig = { key: "profile" | "metrics" | "seo" | "mail" | "language"; label: string; description: string; fields: Field[] };

export const settingsConfigs: SettingsConfig[] = [
  {
    key: "profile",
    label: "Profil",
    description: "Teks hero, Tentang, email, alat dan topik, serta tema riset.",
    fields: [
      { name: "status", label: "Status di hero", type: "localized", required: true, help: "Perbarui tiap semester." },
      { name: "heroStatement", label: "Kalimat utama hero", type: "localized", required: true },
      { name: "heroLead", label: "Paragraf hero", type: "localized", multiline: true, required: true },
      { name: "aboutStatement", label: "Pernyataan Tentang", type: "localized", multiline: true, required: true },
      { name: "email.user", label: "Email: nama", type: "text", placeholder: "ahmad", help: "Kosongkan untuk menyembunyikan email dan formulir pesan." },
      { name: "email.domain", label: "Email: domain", type: "text", placeholder: "ngiliyun.my.id" },
      { name: "skills", label: "Daftar teknologi", type: "list", required: true, help: "Tampil lengkap di halaman Proyek, bagian Teknologi dan topik." },
      {
        name: "homeTools",
        label: "Alat utama di beranda",
        type: "list",
        help: "Baris alat di bagian Tentang beranda, maksimal 8. Kosongkan untuk mengambil satu alat bergiliran dari tiap bidang kerja.",
      },
      { name: "topics", label: "Topik yang didalami", type: "localizedList", required: true, help: "Tampil di halaman Proyek, bagian Teknologi dan topik." },
      { name: "researchThemes", label: "Tema riset", type: "localizedList", required: true },
      { name: "learning", label: "Sedang saya dalami", type: "localizedList", help: "Daftar di bagian Arah ke depan, halaman Perjalanan. Kosongkan untuk menyembunyikan." },
    ],
  },
  {
    key: "metrics",
    label: "Metrik riset",
    description: "Angka selalu tampil bersama tanggalnya. Perbarui angka dan tanggal sekaligus.",
    fields: [
      { name: "scholar.citations", label: "Google Scholar: sitasi", type: "number", min: 0, required: true },
      { name: "scholar.hIndex", label: "Google Scholar: h-index", type: "number", min: 0, required: true },
      { name: "scholar.i10Index", label: "Google Scholar: i10-index", type: "number", min: 0, required: true },
      { name: "scholar.source.asOf", width: "quarter", label: "Google Scholar: tanggal data (YYYY-MM-DD)", type: "text", placeholder: "2026-10-28", required: true },
      { name: "sinta.scoreOverall", label: "SINTA: skor keseluruhan", type: "number", min: 0, required: true },
      { name: "sinta.score3Years", label: "SINTA: skor tiga tahun", type: "number", min: 0, required: true },
      { name: "sinta.scholarArticles", label: "SINTA: artikel Google Scholar", type: "number", min: 0, required: true },
      { name: "sinta.source.asOf", width: "quarter", label: "SINTA: tanggal data (YYYY-MM-DD)", type: "text", placeholder: "2026-10-28", required: true },
      { name: "garuda.documents", width: "half", label: "Garuda: dokumen", type: "number", min: 0, required: true },
      { name: "garuda.source.asOf", width: "half", label: "Garuda: tanggal data (YYYY-MM-DD)", type: "text", placeholder: "2026-10-28", required: true },
      { name: "msLearn.badges", label: "Microsoft Learn: lencana", type: "number", min: 0, required: true },
      { name: "msLearn.trophies", label: "Microsoft Learn: piala", type: "number", min: 0, required: true },
      { name: "msLearn.level", label: "Microsoft Learn: tingkat", type: "number", min: 0, required: true },
      { name: "msLearn.modules", label: "Microsoft Learn: modul selesai", type: "number", min: 0, required: true },
      { name: "msLearn.paths", width: "third", label: "Microsoft Learn: jalur pembelajaran", type: "number", min: 0, required: true },
      { name: "msLearn.learningMinutes", width: "third", label: "Microsoft Learn: total menit belajar", type: "number", min: 0, required: true },
      { name: "msLearn.source.asOf", width: "third", label: "Microsoft Learn: tanggal data (YYYY-MM-DD)", type: "text", placeholder: "2026-10-28", required: true },
    ],
  },
  {
    key: "seo",
    label: "SEO dan Search Console",
    description:
      "Judul, deskripsi, dan kata kunci di hasil pencarian, bukti kepemilikan ngiliyun.my.id untuk Google Search Console dan Bing, serta Google Analytics. Semua isian opsional dan langsung berlaku setelah disimpan.",
    fields: [
      {
        name: "home.title",
        label: "Beranda: judul",
        type: "localized",
        placeholder: { id: copy.id.meta.title, en: copy.en.meta.title },
        help: "Judul biru di hasil Google dan judul tab browser. Kosongkan untuk memakai judul bawaan (teks samar). Ideal 50 sampai 60 karakter.",
      },
      {
        name: "home.description",
        label: "Beranda: deskripsi",
        type: "localized",
        multiline: true,
        placeholder: { id: copy.id.meta.description, en: copy.en.meta.description },
        help: "Teks di bawah judul hasil Google. Ideal 120 sampai 160 karakter. Google kadang memakai potongan isi halaman bila dianggap lebih cocok dengan pencarian.",
      },
      {
        name: "archive.title",
        label: "Arsip sertifikat: judul",
        type: "localized",
        placeholder: { id: copy.id.archive.metaTitle, en: copy.en.archive.metaTitle },
        help: "Halaman /sertifikat/ dan /en/certificates/. Halaman detail tiap capaian memakai judul capaiannya sendiri.",
      },
      {
        name: "archive.description",
        label: "Arsip sertifikat: deskripsi",
        type: "localized",
        multiline: true,
        placeholder: { id: copy.id.archive.metaDescription, en: copy.en.archive.metaDescription },
      },
      ...pageSeoFields,
      {
        name: "keywords",
        label: "Kata kunci",
        type: "localizedList",
        placeholder: {
          id: "AI engineer\nDosen informatika Cirebon\nMachine learning",
          en: "AI engineer\nInformatics lecturer\nMachine learning",
        },
        help: "Satu kata kunci per baris, maksimal 15. Dipasang sebagai meta keywords di beranda, arsip, dan halaman dalam. Google tidak memakai meta keywords untuk peringkat; yang berpengaruh adalah judul, deskripsi, dan isi halaman.",
      },
      {
        name: "googleVerification",
        placeholder: "<meta name=\"google-site-verification\" content=\"...\" />",
        label: "Google Search Console: tag HTML",
        type: "text",
        help: "Metode Tag HTML. Tempel seluruh tag <meta name=\"google-site-verification\" ...> atau isi content-nya saja.",
      },
      {
        name: "googleHtmlFile",
        placeholder: "google1a2b3c4d5e6f7a8b.html",
        label: "Google Search Console: nama berkas HTML",
        type: "text",
        help: "Metode File HTML. Isi nama berkas yang diberikan Google, misalnya google1a2b3c4d5e6f7a8b.html. Tidak perlu mengunggah berkasnya.",
      },
      {
        name: "bingVerification",
        placeholder: "<meta name=\"msvalidate.01\" content=\"...\" />",
        label: "Bing Webmaster: tag HTML",
        type: "text",
        help: "Tempel seluruh tag <meta name=\"msvalidate.01\" ...> atau isi content-nya saja. Bing juga bisa mengimpor situs dari Search Console.",
      },
      {
        name: "gaMeasurementId",
        placeholder: "G-XXXXXXXXXX",
        label: "Google Analytics 4: ID pengukuran",
        type: "text",
        help: "Format G-XXXXXXXXXX. Kunjungan saat Anda masuk CMS tidak dihitung, dan tautan berbagi rahasia tidak dilacak.",
      },
    ],
  },
  {
    key: "language",
    label: "Bahasa",
    description:
      "Bahasa utama untuk isian dua bahasa di semua formulir CMS. Isian menampilkan bahasa utama lebih dulu; bahasa lain boleh menyusul lewat tombol globe atau tab bahasa di atas formulir.",
    fields: [
      {
        name: "primary",
        width: "half",
        label: "Bahasa utama",
        type: "select",
        required: true,
        options: [
          { value: "id", label: "Indonesia" },
          { value: "en", label: "Inggris" },
        ],
        help: "Isian wajib cukup diisi dalam bahasa ini. Selama terjemahan belum diisi, situs versi bahasa lain memakai teks bahasa utama. Isi lengkap tulisan tidak ikut: tulisan tanpa terjemahan tidak punya halaman di bahasa itu.",
      },
    ],
  },
  {
    key: "mail",
    label: "Email dan SMTP",
    description:
      "Pesan dari form kontak selalu tersimpan di Pesan masuk. Isi SMTP supaya pesan baru juga diteruskan ke email. Kosongkan Server SMTP untuk mematikan penerusan.",
    fields: [
      { name: "smtp.host", label: "Server SMTP", type: "text", placeholder: "smtp.gmail.com" },
      { name: "smtp.port", width: "quarter", label: "Port", type: "number", min: 1, max: 65535, placeholder: "465", help: "465 untuk SSL/TLS, 587 untuk STARTTLS." },
      {
        name: "smtp.security", width: "quarter",
        label: "Keamanan koneksi",
        type: "select",
        options: [
          { value: "ssl", label: "SSL/TLS langsung (port 465)" },
          { value: "starttls", label: "STARTTLS (port 587)" },
        ],
      },
      { name: "smtp.user", label: "Nama pengguna SMTP", type: "text", placeholder: "nama@gmail.com", help: "Untuk Gmail: alamat Gmail lengkap." },
      {
        name: "smtp.pass",
        label: "Kata sandi SMTP",
        type: "secret",
        help: "Untuk Gmail: sandi aplikasi 16 huruf dari myaccount.google.com/apppasswords, bukan kata sandi akun. Tidak pernah ditampilkan ulang; kosongkan untuk tetap memakai sandi tersimpan.",
      },
      { name: "smtp.from", label: "Alamat pengirim", type: "text", placeholder: "nama@gmail.com", help: "Kosongkan untuk memakai nama pengguna SMTP. Gmail hanya mengizinkan alamat akunnya sendiri atau alias yang sudah diverifikasi." },
      { name: "contactTo", label: "Penerima notifikasi pesan", type: "text", placeholder: "ahmad@ngiliyun.my.id", help: "Alamat utama yang menerima pesan baru." },
      {
        name: "contactCopy",
        width: "half",
        label: "Teruskan juga ke",
        type: "list",
        placeholder: "nama@gmail.com",
        help: "Satu alamat per baris, maksimal 3. Dikirim sebagai salinan tersembunyi (BCC), jadi tidak terlihat di email lain. Hanya tersimpan di CMS dan tidak pernah tampil di situs.",
      },
    ],
  },
];

export function getSettingsConfig(key: string): SettingsConfig | undefined {
  return settingsConfigs.find((c) => c.key === key);
}
