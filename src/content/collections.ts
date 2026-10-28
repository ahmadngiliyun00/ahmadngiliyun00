// Konfigurasi koleksi CMS: field formulir, label admin, cara menampilkan judul, dan urutan.
// Menambah field baru di sini otomatis muncul di formulir admin dan ikut divalidasi.

import type { Field, Option } from "@/content/fields";
import { kindLabels, programLabels, type AchievementKind, type CollectionKey, type Program } from "@/content/types";

type Doc = Record<string, unknown>;

export type CollectionConfig = {
  key: CollectionKey;
  label: string; // nama jamak di admin
  singular: string;
  description: string;
  group: "Capaian" | "Proyek" | "Mengajar" | "Profil";
  fields: Field[];
  title: (data: Doc) => string;
  subtitle?: (data: Doc) => string;
  // "date" = urut tanggal terbit terbaru (capaian); "position" = urutan manual
  order: "date" | "position";
  publicPath?: { id: string; en: string }; // halaman detail publik, bila ada
};

const loc = (v: unknown): string => {
  if (v === null || typeof v !== "object") return "";
  const o = v as { id?: string };
  return o.id ?? "";
};
const s = (v: unknown): string => (typeof v === "string" ? v : "");

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
      { name: "kind", label: "Kategori", type: "select", options: kindOptions, required: true },
      { name: "title", label: "Judul", type: "localized", required: true, help: "Judul Indonesia dipakai sebagai nama resmi di LinkedIn." },
      { name: "issuer", label: "Penerbit atau terbitan", type: "text", required: true },
      { name: "summary", label: "Ringkasan", type: "localized", multiline: true, help: "Satu sampai dua kalimat. Wajib kecuali publikasi." },
      { name: "issued", label: "Tanggal terbit", type: "date", help: "Kosongkan bila belum diketahui. Jangan menebak." },
      { name: "expires", label: "Berlaku sampai", type: "date" },
      { name: "ongoing", label: "Masih berjalan (misalnya reviewer)", type: "boolean" },
      { name: "credentialId", label: "ID kredensial atau nomor pencatatan", type: "text" },
      { name: "reference", label: "Nomor sertifikat tambahan", type: "text" },
      { name: "verifyUrl", label: "URL verifikasi resmi", type: "url" },
      { name: "fileId", label: "Berkas sertifikat", type: "file", help: "PDF atau gambar, maksimal 5 MB. Tutup data pribadi (NIK, alamat, nomor anggota, kode QR) sebelum mengunggah." },
      { name: "skills", label: "Keterampilan", type: "list", help: "Satu per baris." },
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
      { name: "related", label: "Tautan terkait", type: "links", help: "Satu per baris: Label Indonesia | Label Inggris | https://..." },
      { name: "featured", label: "Sorot di beranda (maksimal 6)", type: "boolean" },
      { name: "showOnHome", label: "Tampilkan di tab Hak cipta beranda (khusus HKI, maksimal 5)", type: "boolean" },
      { name: "linkedin", label: "Tombol Tambahkan ke LinkedIn (khusus sertifikat dan pelatihan)", type: "boolean" },
    ],
  },
  {
    key: "project",
    label: "Proyek unggulan",
    singular: "proyek",
    description: "Kartu besar di bagian Proyek, dengan kode terbuka.",
    group: "Proyek",
    order: "position",
    title: (d) => s(d.name),
    subtitle: (d) => s(d.stack),
    fields: [
      { name: "name", label: "Nama", type: "text", required: true },
      { name: "repo", label: "Repositori", type: "url", required: true },
      { name: "demo", label: "Demo", type: "url" },
      { name: "stack", label: "Bahasa utama", type: "text", required: true, help: "Misalnya Python atau TypeScript." },
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
      { name: "copyright", label: "Hak cipta terdaftar", type: "boolean" },
      { name: "badge", label: "Lencana tambahan", type: "localized" },
      { name: "tags", label: "Tag", type: "localizedList", required: true },
      { name: "summary", label: "Ringkasan", type: "localized", multiline: true, required: true },
    ],
  },
  {
    key: "system",
    label: "Sistem yang dikembangkan",
    singular: "sistem",
    description: "Sistem dengan repositori privat: tampil tanpa tautan kode.",
    group: "Proyek",
    order: "position",
    title: (d) => s(d.name),
    subtitle: (d) => loc(d.period),
    fields: [
      { name: "name", label: "Nama", type: "text", required: true },
      { name: "full", label: "Kepanjangan", type: "text" },
      { name: "period", label: "Periode", type: "localized", required: true },
      { name: "role", label: "Peran", type: "localized", required: true },
      { name: "stack", label: "Teknologi", type: "list", required: true, help: "Satu per baris." },
      { name: "summary", label: "Ringkasan", type: "localized", multiline: true, required: true },
      { name: "repo", label: "Repositori publik", type: "url", help: "Isi hanya bila repositorinya publik." },
    ],
  },
  {
    key: "institution",
    label: "Kampus",
    singular: "kampus",
    description: "Kampus tempat mengajar. Mata kuliah merujuk ke kampus lewat slug.",
    group: "Mengajar",
    order: "position",
    title: (d) => s(d.name),
    subtitle: (d) => loc(d.role),
    fields: [
      { name: "name", label: "Nama kampus", type: "text", required: true },
      { name: "role", label: "Peran", type: "localized", required: true },
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
      { name: "name", label: "Nama mata kuliah", type: "localized", required: true },
      { name: "programs", label: "Program studi", type: "multiselect", options: programOptions, required: true },
      { name: "terms", label: "Kode semester", type: "list", required: true, help: "Satu per baris, misalnya 26271 (ganjil 2026/2027)." },
      { name: "repo", label: "Materi di GitHub", type: "url" },
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
      { name: "label", label: "Label", type: "localized", required: true },
      { name: "current", label: "Semester berjalan", type: "boolean" },
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
    description: "Garis waktu, urut dari yang paling awal.",
    group: "Profil",
    order: "position",
    title: (d) => `${loc(d.when)}: ${loc(d.title)}`,
    fields: [
      { name: "when", label: "Waktu", type: "localized", required: true },
      { name: "title", label: "Judul", type: "localized", required: true },
      { name: "body", label: "Isi", type: "localized", multiline: true, required: true },
      { name: "current", label: "Peristiwa saat ini (titik berdenyut)", type: "boolean" },
    ],
  },
  {
    key: "area",
    label: "Yang saya kerjakan",
    singular: "bidang kerja",
    description: "Empat panel di bagian Tentang.",
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
      { name: "title", label: "Judul", type: "localized", required: true },
      { name: "body", label: "Isi", type: "localized", multiline: true, required: true },
      { name: "tools", label: "Alat", type: "list", required: true },
    ],
  },
  {
    key: "contribution",
    label: "Di luar kode",
    singular: "kontribusi",
    description: "Kontribusi di bawah grafik GitHub.",
    group: "Profil",
    order: "position",
    title: (d) => loc(d.title),
    fields: [
      { name: "title", label: "Judul", type: "localized", required: true },
      { name: "body", label: "Isi", type: "localized", multiline: true, required: true },
      { name: "href", label: "Tautan", type: "url", help: "Awali dengan # untuk bagian di halaman, misalnya #research." },
      { name: "linkLabel", label: "Teks tautan", type: "localized" },
    ],
  },
  {
    key: "collab",
    label: "Jenis kerja sama",
    singular: "kerja sama",
    description: "Juga dipakai sebagai pilihan topik di formulir kontak.",
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
    description: "Tautan media sosial di bagian Kontak.",
    group: "Profil",
    order: "position",
    title: (d) => s(d.label),
    subtitle: (d) => s(d.handle),
    fields: [
      { name: "label", label: "Nama", type: "text", required: true },
      { name: "handle", label: "Nama akun", type: "text", required: true },
      { name: "href", label: "Tautan", type: "url", required: true },
      { name: "note", label: "Keterangan", type: "localized", required: true },
    ],
  },
];

export function getCollection(key: string): CollectionConfig | undefined {
  return collections.find((c) => c.key === key);
}

// ---------- Pengaturan tunggal ----------

export type SettingsConfig = { key: "profile" | "metrics" | "seo"; label: string; description: string; fields: Field[] };

export const settingsConfigs: SettingsConfig[] = [
  {
    key: "profile",
    label: "Profil",
    description: "Teks hero, Tentang, email, running text, dan profil riset.",
    fields: [
      { name: "status", label: "Status di hero", type: "localized", required: true, help: "Perbarui tiap semester." },
      { name: "heroStatement", label: "Kalimat utama hero", type: "localized", required: true },
      { name: "heroLead", label: "Paragraf hero", type: "localized", multiline: true, required: true },
      { name: "aboutStatement", label: "Pernyataan Tentang", type: "localized", multiline: true, required: true },
      { name: "email.user", label: "Email: nama", type: "text", placeholder: "ahmad", help: "Kosongkan untuk menyembunyikan email dan formulir pesan." },
      { name: "email.domain", label: "Email: domain", type: "text", placeholder: "ngiliyun.my.id" },
      { name: "skills", label: "Running text teknologi", type: "list", required: true },
      { name: "topics", label: "Running text topik", type: "localizedList", required: true },
      { name: "researchThemes", label: "Tema riset", type: "localizedList", required: true },
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
      { name: "scholar.source.asOf", label: "Google Scholar: tanggal data (YYYY-MM-DD)", type: "text", placeholder: "2026-10-28", required: true },
      { name: "sinta.scoreOverall", label: "SINTA: skor keseluruhan", type: "number", min: 0, required: true },
      { name: "sinta.score3Years", label: "SINTA: skor tiga tahun", type: "number", min: 0, required: true },
      { name: "sinta.scholarArticles", label: "SINTA: artikel Google Scholar", type: "number", min: 0, required: true },
      { name: "sinta.source.asOf", label: "SINTA: tanggal data (YYYY-MM-DD)", type: "text", placeholder: "2026-10-28", required: true },
      { name: "garuda.documents", label: "Garuda: dokumen", type: "number", min: 0, required: true },
      { name: "garuda.source.asOf", label: "Garuda: tanggal data (YYYY-MM-DD)", type: "text", placeholder: "2026-10-28", required: true },
      { name: "msLearn.badges", label: "Microsoft Learn: lencana", type: "number", min: 0, required: true },
      { name: "msLearn.trophies", label: "Microsoft Learn: piala", type: "number", min: 0, required: true },
      { name: "msLearn.level", label: "Microsoft Learn: tingkat", type: "number", min: 0, required: true },
      { name: "msLearn.modules", label: "Microsoft Learn: modul selesai", type: "number", min: 0, required: true },
      { name: "msLearn.paths", label: "Microsoft Learn: jalur pembelajaran", type: "number", min: 0, required: true },
      { name: "msLearn.learningMinutes", label: "Microsoft Learn: total menit belajar", type: "number", min: 0, required: true },
      { name: "msLearn.source.asOf", label: "Microsoft Learn: tanggal data (YYYY-MM-DD)", type: "text", placeholder: "2026-10-28", required: true },
    ],
  },
  {
    key: "seo",
    label: "Search Console dan Analytics",
    description:
      "Bukti kepemilikan ngiliyun.my.id untuk Google Search Console dan Bing, serta Google Analytics. Semua isian opsional dan langsung berlaku setelah disimpan.",
    fields: [
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
];

export function getSettingsConfig(key: string): SettingsConfig | undefined {
  return settingsConfigs.find((c) => c.key === key);
}
