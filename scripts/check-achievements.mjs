// Memeriksa src/data/achievements.ts dan src/data/metrics.ts sebelum build.
// Jalankan: npm run check:achievements
// Opsional: npm run check:achievements -- --online  (cek setiap verifyUrl benar-benar terbuka)
//
// Yang diperiksa: id unik dan slug valid, kolom wajib untuk item public, tanggal valid,
// verifyUrl berskema https, teks ID dan EN lengkap, berkas ada dan ukurannya wajar,
// batas sorotan beranda, serta tidak ada em dash atau ampersand di teks.
//
// Validator ini TIDAK bisa mendeteksi data pribadi di dalam berkas PDF atau gambar.
// Data pribadi wajib ditutup secara manual sebelum berkas masuk repo (lihat docs/DEVELOPMENT.md).

import { stat } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { importTs } from "./lib/load-ts.mjs";

const ROOT = new URL("../", import.meta.url);
const PUBLIC = new URL("public/", ROOT);

// Sama dengan HOME_FEATURED_LIMIT dan HOME_HKI_LIMIT di src/lib/achievements.ts.
const HOME_FEATURED_LIMIT = 6;
const HOME_HKI_LIMIT = 5;
const FILE_LIMIT = 2 * 1024 * 1024;

const KINDS = new Set([
  "sertifikat", "pelatihan", "beasiswa", "hki", "buku",
  "hibah", "publikasi", "reviewer", "keanggotaan", "penghargaan",
]);
const LINKEDIN_KINDS = new Set(["sertifikat", "pelatihan"]);
const NO_DATE_OK = new Set(["reviewer", "keanggotaan"]);
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const EM_DASH = String.fromCharCode(0x2014);
const AMPERSAND = String.fromCharCode(0x26);

function forbidden(value, path, report) {
  if (typeof value === "string") {
    if (value.includes(EM_DASH)) report(`${path} memuat em dash. Ganti dengan tanda hubung "-".`);
    if (value.includes(AMPERSAND)) report(`${path} memuat simbol ampersand. Tulis "dan" atau "and".`);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((v, i) => forbidden(v, `${path}[${i}]`, report));
    return;
  }
  if (value !== null) {
    if (typeof value === "object") {
      for (const [k, v] of Object.entries(value)) forbidden(v, `${path}.${k}`, report);
    }
  }
}

function filled(text) {
  return typeof text === "string" ? text.trim() !== "" : false;
}

function checkDate(d, path, report) {
  if (d === null || d === undefined) return;
  if (!Number.isInteger(d.year)) {
    report(`${path}.year harus bilangan bulat.`);
    return;
  }
  if (d.year < 1990 || d.year > 2100) report(`${path}.year (${d.year}) di luar rentang wajar.`);
  if (d.month !== undefined) {
    if (!Number.isInteger(d.month) || d.month < 1 || d.month > 12) {
      report(`${path}.month (${d.month}) harus 1 sampai 12.`);
    }
  }
  if (d.day !== undefined) {
    if (d.month === undefined) report(`${path}.day diisi tetapi month kosong.`);
    if (!Number.isInteger(d.day) || d.day < 1 || d.day > 31) report(`${path}.day (${d.day}) harus 1 sampai 31.`);
  }
}

function dateKey(d) {
  return d.year * 10000 + (d.month ?? 0) * 100 + (d.day ?? 0);
}

function isHttps(url) {
  try {
    return new URL(url).protocol === "https:";
  } catch {
    return false;
  }
}

export async function checkAchievements() {
  const errors = [];
  const warnings = [];
  const { achievements } = await importTs(new URL("src/data/achievements.ts", ROOT));
  const metrics = await importTs(new URL("src/data/metrics.ts", ROOT));

  if (!Array.isArray(achievements)) {
    errors.push("achievements.ts tidak mengekspor array achievements.");
    return { errors, warnings, achievements: [] };
  }

  const seen = new Set();
  for (const [i, a] of achievements.entries()) {
    const where = `achievements[${i}] (${a.id ?? "tanpa id"})`;
    const err = (msg) => errors.push(`${where}: ${msg}`);
    const warn = (msg) => warnings.push(`${where}: ${msg}`);

    if (!filled(a.id)) err("id kosong.");
    else if (!SLUG.test(a.id)) err(`id "${a.id}" bukan slug valid (huruf kecil, angka, tanda hubung).`);
    if (seen.has(a.id)) err(`id "${a.id}" dipakai lebih dari sekali.`);
    seen.add(a.id);

    if (!KINDS.has(a.kind)) err(`kind "${a.kind}" tidak dikenal.`);
    if (a.visibility !== "public") {
      if (a.visibility !== "draft") err(`visibility harus "public" atau "draft", bukan "${a.visibility}".`);
    }

    forbidden(a, "teks", err);
    checkDate(a.issued, "issued", err);
    checkDate(a.expires, "expires", err);
    if (a.issued) {
      if (a.expires) {
        if (dateKey(a.expires) < dateKey(a.issued)) err("expires lebih awal daripada issued.");
      }
    }

    if (a.verifyUrl !== undefined) {
      if (!isHttps(a.verifyUrl)) err(`verifyUrl harus https: ${a.verifyUrl}`);
    }
    for (const r of a.related ?? []) {
      if (!isHttps(r.href)) err(`related.href harus https: ${r.href}`);
    }

    if (a.linkedin === true) {
      if (!LINKEDIN_KINDS.has(a.kind)) err(`linkedin hanya untuk kind sertifikat atau pelatihan, bukan ${a.kind}.`);
    }
    if (a.showOnHome === true) {
      if (a.kind !== "hki") err("showOnHome hanya untuk kind hki.");
    }
    if (a.authorship !== undefined) {
      if (a.kind !== "publikasi") err("authorship hanya untuk kind publikasi.");
    }

    if (a.file !== undefined) {
      if (a.file.startsWith("/")) err(`file ditulis relatif dari public/, tanpa garis miring di depan: ${a.file}`);
      try {
        const info = await stat(new URL(a.file.replace(/^\/+/, ""), PUBLIC));
        if (info.size > FILE_LIMIT) {
          warn(`berkas ${a.file} berukuran ${(info.size / 1048576).toFixed(1)} MB, melebihi batas 2 MB. Kompres dulu.`);
        }
      } catch {
        err(`berkas public/${a.file} tidak ditemukan.`);
      }
    }

    if (a.visibility !== "public") continue;

    // Kolom wajib untuk item yang tampil.
    if (!filled(a.title?.id)) err("title.id wajib diisi.");
    if (!filled(a.title?.en)) err("title.en wajib diisi.");
    if (!filled(a.issuer)) err("issuer wajib diisi.");
    if (a.kind !== "publikasi") {
      if (!filled(a.summary?.id)) err("summary.id wajib diisi.");
      if (!filled(a.summary?.en)) err("summary.en wajib diisi.");
    } else if (a.summary !== undefined) {
      if (!filled(a.summary.id)) err("summary.id kosong padahal summary diisi.");
      if (!filled(a.summary.en)) err("summary.en kosong padahal summary diisi.");
    }
    if (a.issued === null) {
      if (!NO_DATE_OK.has(a.kind)) err("issued wajib diisi untuk item public (kecuali reviewer dan keanggotaan).");
    }
    if (a.kind === "publikasi") {
      if (a.authorship === undefined) err("authorship wajib diisi untuk publikasi.");
    }
    if (a.featured === true) {
      if (a.kind === "publikasi") warn("publikasi featured tidak ditampilkan di sorotan beranda.");
    }
  }

  // Item draft tidak boleh disorot.
  for (const a of achievements) {
    if (a.visibility === "public") continue;
    if (a.featured === true) errors.push(`${a.id}: item draft tidak boleh featured.`);
    if (a.showOnHome === true) errors.push(`${a.id}: item draft tidak boleh showOnHome.`);
  }

  const publicItems = achievements.filter((a) => a.visibility === "public");
  const featured = publicItems.filter((a) => a.featured === true);
  if (featured.length > HOME_FEATURED_LIMIT) {
    errors.push(`Ada ${featured.length} item featured, maksimal ${HOME_FEATURED_LIMIT}.`);
  }
  const hkiHome = publicItems.filter((a) => a.showOnHome === true);
  if (hkiHome.length > HOME_HKI_LIMIT) {
    errors.push(`Ada ${hkiHome.length} HKI dengan showOnHome, maksimal ${HOME_HKI_LIMIT}.`);
  }

  // Metrik wajib bertanggal dan bersumber.
  for (const [name, group] of Object.entries(metrics)) {
    if (group === null || typeof group !== "object") continue;
    const src = group.source;
    if (src === undefined) {
      errors.push(`metrics.${name}: tidak punya source.`);
      continue;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(src.asOf ?? "")) errors.push(`metrics.${name}: source.asOf harus YYYY-MM-DD.`);
    if (!isHttps(src.url)) errors.push(`metrics.${name}: source.url harus https.`);
    forbidden(group, `metrics.${name}`, (msg) => errors.push(msg));
    for (const [k, v] of Object.entries(group)) {
      if (k === "source") continue;
      if (typeof v !== "number" || !Number.isFinite(v) || v < 0) {
        errors.push(`metrics.${name}.${k} harus angka nol atau lebih.`);
      }
    }
  }

  return { errors, warnings, achievements };
}

async function probe(url) {
  const opts = (method) => ({
    method,
    redirect: "follow",
    headers: { "User-Agent": "Mozilla/5.0 (ngiliyun-portfolio link check)" },
    signal: AbortSignal.timeout(20000),
  });
  try {
    let res = await fetch(url, opts("HEAD"));
    if (res.status >= 400) res = await fetch(url, opts("GET"));
    return { ok: res.ok, status: String(res.status) };
  } catch (err) {
    return { ok: false, status: err.name === "TimeoutError" ? "batas waktu" : err.message };
  }
}

export async function checkOnline(achievements) {
  const targets = achievements.filter((a) => typeof a.verifyUrl === "string");
  const failed = [];
  for (const a of targets) {
    const r = await probe(a.verifyUrl);
    const tag = a.visibility === "public" ? "public" : "draft";
    console.log(`${r.ok ? "OK   " : "GAGAL"} ${r.status.padEnd(5)} [${tag}] ${a.id}  ${a.verifyUrl}`);
    if (!r.ok) failed.push(a.id);
  }
  return failed;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { errors, warnings, achievements } = await checkAchievements();
  for (const w of warnings) console.warn(`[capaian] peringatan: ${w}`);
  if (errors.length > 0) {
    for (const e of errors) console.error(`[capaian] galat: ${e}`);
    console.error(`[capaian] ${errors.length} galat. Perbaiki src/data/achievements.ts atau metrics.ts.`);
    process.exit(1);
  }
  const pub = achievements.filter((a) => a.visibility === "public").length;
  console.log(`[capaian] lulus: ${achievements.length} item (${pub} public, ${achievements.length - pub} draft).`);

  if (process.argv.includes("--online")) {
    console.log("[capaian] memeriksa URL verifikasi...");
    const failed = await checkOnline(achievements);
    if (failed.length > 0) {
      console.error(`[capaian] ${failed.length} URL tidak terbuka: ${failed.join(", ")}`);
      console.error("[capaian] Sebagian situs (misalnya Coursera) memblokir pemeriksaan otomatis. Buka manual untuk memastikan.");
      process.exit(1);
    }
    console.log("[capaian] semua URL verifikasi terbuka.");
  }
}
