import "server-only";
import { randomBytes } from "node:crypto";
import { and, asc, eq, ne } from "drizzle-orm";
import { getCollection, getSettingsConfig } from "@/content/collections";
import { getPath, readFields, setPath, slugify, SLUG_PATTERN, type Doc, type FieldErrors } from "@/content/fields";
import type { CollectionKey, Visibility } from "@/content/types";
import { db } from "@/db";
import { comments, entries, postViews, settings } from "@/db/schema";
import { fileIdsIn, htmlToText } from "@/lib/richtext";
import { sha256 } from "@/server/auth/session";
import { invalidateSite, primaryLang, rowToEntry } from "@/server/content";
import { deleteEntryFiles, deleteFile, saveUpload, syncInlineFiles } from "@/server/files";
import { sanitizeRichText } from "@/server/richtext";

// Lapisan tulis konten untuk CMS. Pemanggil (Server Action) WAJIB sudah memanggil requireAdmin().

export type SaveResult = { ok: true; id: number } | { ok: false; errors: FieldErrors; message?: string };

const HOME_FEATURED_LIMIT = 6;
const HOME_HKI_LIMIT = 5;

async function publicSiblings(collection: CollectionKey, exceptId: number | null) {
  const where = exceptId === null
    ? and(eq(entries.collection, collection), eq(entries.visibility, "public"))
    : and(eq(entries.collection, collection), eq(entries.visibility, "public"), ne(entries.id, exceptId));
  const rows = await db.select().from(entries).where(where);
  return rows.map((r) => r.data as Doc);
}

// Aturan khusus per koleksi yang tidak bisa diungkapkan lewat field biasa.
async function checkRules(
  collection: CollectionKey,
  data: Doc,
  visibility: Visibility,
  id: number | null,
  errors: FieldErrors,
) {
  if (collection === "post") {
    const hasBody = data.body !== undefined;
    if (data.kind === "liputan") {
      if (data.outlet === undefined) errors.outlet = "Liputan media wajib menyebut nama media atau penerbit.";
      if (data.url === undefined) errors.url = "Liputan media wajib punya tautan sumber.";
    } else if (!hasBody) {
      if (data.url === undefined) errors.body = "Isi lengkap atau tautan sumber wajib diisi salah satu.";
    }
    if (visibility === "public") {
      if (data.date === null) errors.date = "Data public wajib punya tanggal terbit.";
    }
    return;
  }
  if (collection === "achievement") {
    const kind = data.kind;
    if (kind !== "publikasi") {
      if (data.summary === undefined) errors.summary = "Ringkasan wajib diisi kecuali untuk publikasi.";
    }
    if (kind === "publikasi") {
      if (data.authorship === undefined) errors.authorship = "Publikasi wajib punya posisi penulis.";
    } else if (data.authorship !== undefined) {
      errors.authorship = "Posisi penulis hanya untuk publikasi.";
    }
    if (data.linkedin === true) {
      if (kind !== "sertifikat") {
        if (kind !== "pelatihan") errors.linkedin = "Tombol LinkedIn hanya untuk sertifikat dan pelatihan.";
      }
    }
    if (data.showOnHome === true) {
      if (kind !== "hki") errors.showOnHome = "Tab Hak cipta beranda hanya untuk kategori hak cipta.";
    }
    if (data.issued === null) {
      const noDateOk = data.ongoing === true ? true : kind === "keanggotaan";
      if (!noDateOk) {
        if (visibility === "public") errors.issued = "Item public wajib punya tanggal terbit (kecuali reviewer yang masih berjalan dan keanggotaan).";
      }
    }
    if (visibility === "public") {
      const others = await publicSiblings("achievement", id);
      if (data.featured === true) {
        const n = others.filter((d) => d.featured === true).length;
        if (n >= HOME_FEATURED_LIMIT) errors.featured = `Sudah ada ${n} sorotan beranda, maksimal ${HOME_FEATURED_LIMIT}. Lepas salah satu dulu.`;
      }
      if (data.showOnHome === true) {
        const n = others.filter((d) => d.showOnHome === true).length;
        if (n >= HOME_HKI_LIMIT) errors.showOnHome = `Sudah ada ${n} HKI di beranda, maksimal ${HOME_HKI_LIMIT}.`;
      }
    }
  }
  if (collection === "course") {
    const inst = await db
      .select({ id: entries.id })
      .from(entries)
      .where(and(eq(entries.collection, "institution"), eq(entries.slug, String(data.institution ?? ""))))
      .limit(1);
    if (inst.length === 0) errors.institution = "Kampus tidak ditemukan.";
    const terms = Array.isArray(data.terms) ? (data.terms as string[]) : [];
    if (terms.some((t) => !/^\d{5}$/.test(t))) errors.terms = "Kode semester terdiri dari 5 angka, misalnya 26271.";
  }
}

function slugSource(collection: CollectionKey, data: Doc): string {
  const cfg = getCollection(collection);
  return cfg ? cfg.title(data) : "";
}

type Prepared = { data: Doc; existing: Doc; slug: string; visibility: Visibility; position: number };
type Failed = { ok: false; errors: FieldErrors; message?: string };

// Membaca dan memvalidasi isian formulir tanpa menulis apa pun. Dipakai saveEntry dan pratinjau
// impor lembar kerja (src/server/transfer.ts), supaya keduanya memakai aturan yang sama.
export async function prepareEntry(
  collection: CollectionKey,
  id: number | null,
  form: FormData,
): Promise<{ ok: true; value: Prepared } | Failed> {
  const cfg = getCollection(collection);
  if (cfg === undefined) return { ok: false, errors: {}, message: "Koleksi tidak dikenal." };

  let existing: Doc = {};
  if (id !== null) {
    const rows = await db.select().from(entries).where(and(eq(entries.id, id), eq(entries.collection, collection))).limit(1);
    if (rows.length === 0) return { ok: false, errors: {}, message: "Data tidak ditemukan." };
    existing = rows[0].data as Doc;
  }

  const { data, errors } = readFields(cfg.fields, form, existing, await primaryLang());
  // Isi rich text dibersihkan di server; bahasa yang kosong setelah dibersihkan dibuang.
  const richFields = cfg.fields.filter((f) => f.type === "richtext");
  for (const f of richFields) {
    const v = getPath(data, f.name) as { id?: string; en?: string } | undefined;
    if (v === undefined) continue;
    const clean = (html: string) => {
      const out = sanitizeRichText(html);
      return htmlToText(out) === "" ? (out.includes("<img") ? out : "") : out;
    };
    const id = clean(v.id ?? "");
    const en = clean(v.en ?? "");
    setPath(data, f.name, id === "" ? (en === "" ? undefined : { id, en }) : { id, en });
  }
  const visibility: Visibility = form.get("visibility") === "public" ? "public" : "private";
  const positionText = String(form.get("position") ?? "").trim();
  const position = positionText === "" ? 0 : Number(positionText);
  if (!Number.isInteger(position)) errors.position = "Urutan harus bilangan bulat.";

  let slug = String(form.get("slug") ?? "").trim();
  if (slug === "") slug = slugify(slugSource(collection, data));
  if (!SLUG_PATTERN.test(slug)) errors.slug = "Slug hanya huruf kecil, angka, dan tanda hubung.";
  const dup = await db
    .select({ id: entries.id })
    .from(entries)
    .where(and(eq(entries.collection, collection), eq(entries.slug, slug)))
    .limit(1);
  if (dup.length > 0) {
    if (dup[0].id !== id) errors.slug = "Slug sudah dipakai di koleksi ini.";
  }

  await checkRules(collection, data, visibility, id, errors);
  if (Object.keys(errors).length > 0) {
    return { ok: false, errors, message: "Periksa kembali isian yang ditandai." };
  }
  return { ok: true, value: { data, existing, slug, visibility, position } };
}

export async function saveEntry(
  collection: CollectionKey,
  id: number | null,
  form: FormData,
): Promise<SaveResult> {
  const prepared = await prepareEntry(collection, id, form);
  if (!prepared.ok) return prepared;
  const { data, existing, slug, visibility, position } = prepared.value;
  const richFields = (getCollection(collection)?.fields ?? []).filter((f) => f.type === "richtext");

  // Berkas: unggahan baru menggantikan yang lama; centang "hapus berkas" melepasnya.
  const upload = form.get("upload");
  const hasUpload = upload instanceof File ? upload.size > 0 : false;

  const oldFileId = typeof existing.fileId === "string" ? existing.fileId : undefined;
  if (hasUpload) {
    try {
      const meta = await saveUpload(Buffer.from(await (upload as File).arrayBuffer()), (upload as File).name, id);
      data.fileId = meta.id;
    } catch (err) {
      return { ok: false, errors: { fileId: (err as Error).message }, message: "Berkas ditolak." };
    }
  } else if (form.get("removeFile") === "on") {
    delete data.fileId;
  }

  const now = new Date();
  let savedId = id;
  if (id === null) {
    const res = await db.insert(entries).values({
      collection,
      slug,
      visibility,
      position,
      data,
      createdAt: now,
      updatedAt: now,
    });
    savedId = Number(res[0].insertId);
  } else {
    await db.update(entries).set({ slug, visibility, position, data, updatedAt: now }).where(eq(entries.id, id));
  }

  if (oldFileId !== undefined) {
    if (oldFileId !== data.fileId) await deleteFile(oldFileId);
  }

  // Gambar di dalam isi: kaitkan ke data ini, hapus yang tidak dipakai lagi.
  if (richFields.length > 0) {
    const html = richFields
      .map((f) => getPath(data, f.name) as { id?: string; en?: string } | undefined)
      .map((v) => `${v?.id ?? ""} ${v?.en ?? ""}`)
      .join(" ");
    const keep = typeof data.fileId === "string" ? [data.fileId] : [];
    await syncInlineFiles(savedId as number, fileIdsIn(html), keep);
  }

  // Hanya satu semester berjalan.
  if (collection === "term") {
    if (data.current === true) {
      const others = await db.select().from(entries).where(and(eq(entries.collection, "term"), ne(entries.id, savedId as number)));
      for (const o of others) {
        const d = o.data as Doc;
        if (d.current === true) await db.update(entries).set({ data: { ...d, current: false } }).where(eq(entries.id, o.id));
      }
    }
  }

  invalidateSite();
  return { ok: true, id: savedId as number };
}

export async function deleteEntry(id: number) {
  const rows = await db.select().from(entries).where(eq(entries.id, id)).limit(1);
  const row = rows[0];
  if (!row) return;
  const d = row.data as Doc;
  await db.delete(entries).where(eq(entries.id, id));
  if (typeof d.fileId === "string") await deleteFile(d.fileId);
  // Gambar di dalam isi, komentar, dan statistik baca ikut dihapus.
  await deleteEntryFiles(id);
  if (row.collection === "post") {
    await db.delete(comments).where(eq(comments.entryId, id));
    await db.delete(postViews).where(eq(postViews.entryId, id));
  }
  invalidateSite();
}

export async function setVisibility(id: number, visibility: Visibility): Promise<string | null> {
  const rows = await db.select().from(entries).where(eq(entries.id, id)).limit(1);
  const row = rows[0];
  if (!row) return "Data tidak ditemukan.";
  if (visibility === "public") {
    const errors: FieldErrors = {};
    await checkRules(row.collection as CollectionKey, row.data as Doc, "public", id, errors);
    const first = Object.values(errors)[0];
    if (first) return first;
  }
  await db.update(entries).set({ visibility, updatedAt: new Date() }).where(eq(entries.id, id));
  invalidateSite();
  return null;
}

// Geser urutan manual dengan menukar posisi dengan tetangganya.
export async function moveEntry(id: number, direction: "up" | "down") {
  const rows = await db.select().from(entries).where(eq(entries.id, id)).limit(1);
  const row = rows[0];
  if (!row) return;
  const list = await db
    .select()
    .from(entries)
    .where(eq(entries.collection, row.collection))
    .orderBy(asc(entries.position), asc(entries.id));
  const i = list.findIndex((r) => r.id === id);
  const j = direction === "up" ? i - 1 : i + 1;
  if (j < 0 || j >= list.length) return;
  // Normalisasi posisi supaya selalu berjarak 10, lalu tukar.
  const ordered = list.map((r) => r.id);
  [ordered[i], ordered[j]] = [ordered[j], ordered[i]];
  for (const [k, rid] of ordered.entries()) {
    await db.update(entries).set({ position: k * 10 }).where(eq(entries.id, rid));
  }
  invalidateSite();
}

// ---------- Tautan berbagi ----------
// Token hanya dikembalikan sekali saat dibuat. Database menyimpan hash-nya.

export async function createShare(id: number): Promise<string> {
  const token = randomBytes(18).toString("base64url");
  await db.update(entries).set({ shareHash: sha256(token), shareCreatedAt: new Date() }).where(eq(entries.id, id));
  return token;
}

export async function revokeShare(id: number) {
  await db.update(entries).set({ shareHash: null, shareCreatedAt: null }).where(eq(entries.id, id));
}

export async function findByShareToken(token: string) {
  if (!/^[A-Za-z0-9_-]{20,40}$/.test(token)) return undefined;
  const rows = await db.select().from(entries).where(eq(entries.shareHash, sha256(token))).limit(1);
  return rows[0] ? rowToEntry(rows[0]) : undefined;
}

// ---------- Pengaturan ----------

export async function saveSettings(key: string, form: FormData): Promise<SaveResult> {
  const cfg = getSettingsConfig(key);
  if (cfg === undefined) return { ok: false, errors: {}, message: "Pengaturan tidak dikenal." };
  const rows = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
  const base = (rows[0]?.value ?? {}) as Doc;
  const { data, errors } = readFields(cfg.fields, form, base, await primaryLang());
  if (key === "metrics") {
    for (const f of cfg.fields) {
      if (f.name.endsWith(".asOf")) {
        const v = String(form.get(`f.${f.name}`) ?? "");
        if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) errors[f.name] = `${f.label}: format YYYY-MM-DD.`;
      }
    }
  }
  if (key === "seo") checkSeo(data, errors);
  if (key === "mail") checkMail(data, errors);
  if (Object.keys(errors).length > 0) return { ok: false, errors, message: "Periksa kembali isian yang ditandai." };
  const now = new Date();
  if (rows.length === 0) await db.insert(settings).values({ key, value: data, updatedAt: now });
  else await db.update(settings).set({ value: data, updatedAt: now }).where(eq(settings.key, key));
  invalidateSite();
  return { ok: true, id: 0 };
}

// Isian SEO boleh ditempel utuh dari Search Console atau Bing; simpan nilai intinya saja.
// Pola dibatasi ketat karena nilainya dicetak ke <head> dan ke script Analytics.
function metaContent(value: string): string {
  const m = value.match(/content\s*=\s*["']([^"']*)["']/i);
  return (m ? m[1] : value).trim();
}

// Batas keras supaya isian tidak berlebihan. Panjang ideal hanya diperingatkan di pratinjau.
const SEO_LIMITS = { title: 90, description: 320, keyword: 60, keywords: 15 };

function checkSeo(data: Doc, errors: FieldErrors) {
  for (const page of ["home", "archive"] as const) {
    const doc = data[page] as { title?: Record<string, string>; description?: Record<string, string> } | undefined;
    const label = page === "home" ? "Beranda" : "Arsip sertifikat";
    for (const lang of ["id", "en"]) {
      const title = doc?.title?.[lang] ?? "";
      const description = doc?.description?.[lang] ?? "";
      if (title.length > SEO_LIMITS.title) {
        errors[`${page}.title`] = `${label}: judul maksimal ${SEO_LIMITS.title} karakter.`;
      }
      if (description.length > SEO_LIMITS.description) {
        errors[`${page}.description`] = `${label}: deskripsi maksimal ${SEO_LIMITS.description} karakter.`;
      }
    }
  }
  const keywords = data.keywords as Record<string, string[]> | undefined;
  for (const list of [keywords?.id ?? [], keywords?.en ?? []]) {
    if (list.length > SEO_LIMITS.keywords) errors.keywords = `Kata kunci: maksimal ${SEO_LIMITS.keywords} per bahasa.`;
    if (list.some((k) => k.length > SEO_LIMITS.keyword)) {
      errors.keywords = `Kata kunci: tiap baris maksimal ${SEO_LIMITS.keyword} karakter.`;
    }
  }

  const meta = (name: "googleVerification" | "bingVerification", label: string) => {
    const v = data[name];
    if (typeof v !== "string") return;
    const clean = metaContent(v);
    data[name] = clean;
    if (!/^[A-Za-z0-9_-]{8,100}$/.test(clean)) errors[name] = `${label}: kode verifikasi tidak dikenali.`;
  };
  meta("googleVerification", "Google Search Console: tag HTML");
  meta("bingVerification", "Bing Webmaster: tag HTML");

  const file = data.googleHtmlFile;
  if (typeof file === "string") {
    const clean = file.trim().split("/").pop() ?? "";
    data.googleHtmlFile = clean;
    if (!/^google[a-z0-9]{6,64}\.html$/.test(clean)) {
      errors.googleHtmlFile = "Google Search Console: nama berkas harus seperti google1a2b3c4d5e6f7a8b.html.";
    }
  }

  const ga = data.gaMeasurementId;
  if (typeof ga === "string") {
    const clean = ga.trim().toUpperCase();
    data.gaMeasurementId = clean;
    if (!/^G-[A-Z0-9]{4,20}$/.test(clean)) errors.gaMeasurementId = "Google Analytics 4: ID harus berformat G-XXXXXXXXXX.";
  }
}

const EMAIL = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

// SMTP hanya aktif bila server, pengguna, sandi, dan penerima lengkap.
function checkMail(data: Doc, errors: FieldErrors) {
  const smtp = (data.smtp ?? {}) as Record<string, unknown>;
  const text = (v: unknown) => (typeof v === "string" ? v : "");
  const host = text(smtp.host);
  if (host !== "") {
    if (!/^[A-Za-z0-9.-]+$/.test(host)) errors["smtp.host"] = "Server SMTP: hanya nama host, misalnya smtp.gmail.com.";
    if (text(smtp.user) === "") errors["smtp.user"] = "Nama pengguna SMTP wajib diisi bila Server SMTP diisi.";
    if (text(smtp.pass) === "") errors["smtp.pass"] = "Kata sandi SMTP wajib diisi bila Server SMTP diisi.";
    if (text(data.contactTo) === "") errors.contactTo = "Penerima notifikasi wajib diisi bila Server SMTP diisi.";
  }
  const from = text(smtp.from);
  if (from !== "") {
    const inner = from.match(/<([^>]+)>\s*$/);
    if (!EMAIL.test(inner ? inner[1] : from)) errors["smtp.from"] = "Alamat pengirim: tulis alamat email, misalnya nama@gmail.com.";
  }
  const to = text(data.contactTo);
  if (to !== "") {
    if (!EMAIL.test(to)) errors.contactTo = "Penerima notifikasi: tulis satu alamat email.";
  }
  const copy = Array.isArray(data.contactCopy) ? (data.contactCopy as string[]) : [];
  if (copy.length > 3) errors.contactCopy = "Teruskan juga ke: maksimal 3 alamat.";
  const bad = copy.find((a) => !EMAIL.test(a));
  if (bad !== undefined) errors.contactCopy = `Teruskan juga ke: "${bad}" bukan alamat email.`;
  if (to !== "") {
    if (copy.some((a) => a.toLowerCase() === to.toLowerCase())) {
      errors.contactCopy = "Teruskan juga ke: alamat ini sudah menjadi penerima utama.";
    }
  }
}
