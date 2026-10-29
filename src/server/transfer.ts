import "server-only";
import zlib from "node:zlib";
import type { CollectionConfig } from "@/content/collections";
import { getPath, readFields, type Doc } from "@/content/fields";
import type { Achievement, CollectionKey, Entry, Post } from "@/content/types";
import { byNewest } from "@/lib/achievements";
import { byPostDate } from "@/lib/posts";
import {
  applyCells,
  entryRow,
  formFromEntry,
  headerText,
  readSheetRows,
  transferColumns,
  type FormPairs,
  type TransferColumn,
  type TransferEntry,
} from "@/lib/transfer";
import { parseCsv, readXlsx, writeXlsx, type ZipCodec } from "@/lib/xlsx";
import { listEntries, primaryLang } from "@/server/content";
import { prepareEntry, saveEntry } from "@/server/entries";

// Ekspor dan impor lembar kerja untuk koleksi CMS. Pemanggil WAJIB sudah memanggil requireAdmin().
// Impor selalu dua langkah: planImport untuk pratinjau (tanpa menulis), lalu applyImport yang
// menyimpan baris berubah satu per satu lewat saveEntry, jadi validasi dan aturan CMS ikut berlaku.

const codec: ZipCodec = {
  deflate: (data) => zlib.deflateRawSync(data),
  inflate: (data, maxLength) => zlib.inflateRawSync(data, { maxOutputLength: maxLength }),
  crc32: (data) => zlib.crc32(data),
};

export const MAX_IMPORT_BYTES = 5 * 1024 * 1024;
const MAX_IMPORT_ROWS = 1000;

export function columnsFor(cfg: CollectionConfig): TransferColumn[] {
  return transferColumns(cfg.fields, cfg.order === "position");
}

function toTransfer(entry: Entry): TransferEntry {
  return { slug: entry.slug, visibility: entry.visibility, position: entry.position, data: entry.data as Doc };
}

// Urutan sama dengan daftar CMS.
async function sortedEntries(cfg: CollectionConfig): Promise<Entry[]> {
  const list: Entry[] = await listEntries(cfg.key, { publicOnly: false });
  if (cfg.order !== "date") return list;
  return cfg.key === "post"
    ? [...list].sort((a, b) => byPostDate(a.data as Post, b.data as Post))
    : [...list].sort((a, b) => byNewest(a.data as Achievement, b.data as Achievement));
}

function guide(cfg: CollectionConfig, cols: TransferColumn[]): string[][] {
  return [
    ["Cara memakai berkas ini", ""],
    ["1", "Isi atau ubah sel di lembar Data. Sel yang dikosongkan tidak mengubah data di CMS; untuk menghapus isian, ubah lewat formulir CMS."],
    ["2", "Jangan mengubah kolom slug dan baris judul. Baris dengan slug kosong ditambahkan sebagai data baru."],
    ["3", `Simpan sebagai .xlsx (atau .csv), lalu unggah di CMS: ${cfg.label}, Impor. CMS menampilkan pratinjau perubahan sebelum menyimpan.`],
    ["4", "Berkas unggahan dan isi tulisan panjang (rich text) tidak ikut lembar kerja dan tidak berubah saat impor."],
    ["", ""],
    ["Kolom", "Keterangan"],
    ...cols.map((c) => [headerText(c), c.note]),
  ];
}

export async function exportCollection(cfg: CollectionConfig, now: Date = new Date()): Promise<{ filename: string; body: Uint8Array }> {
  const cols = columnsFor(cfg);
  const list = await sortedEntries(cfg);
  const rows = [cols.map(headerText), ...list.map((e) => entryRow(cfg.fields, cols, toTransfer(e)))];
  const body = writeXlsx(
    [
      { name: "Data", header: true, rows, columns: cols.map((c) => ({ width: c.width, options: c.options })) },
      { name: "Petunjuk", header: false, rows: guide(cfg, cols), columns: [{ width: 36 }, { width: 110 }] },
    ],
    codec,
    now,
  );
  const date = now.toISOString().slice(0, 10);
  return { filename: `${cfg.key}-${date}.xlsx`, body };
}

// Isi lembar kerja dari berkas unggahan: Excel (.xlsx) atau CSV.
export async function readUpload(file: File): Promise<string[][]> {
  if (file.size === 0) throw new Error("Pilih berkas Excel (.xlsx) atau CSV lebih dulu.");
  if (file.size > MAX_IMPORT_BYTES) throw new Error("Berkas terlalu besar, maksimal 5 MB.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const isZip = bytes[0] === 0x50 ? bytes[1] === 0x4b : false;
  if (isZip) return readXlsx(bytes, codec);
  if (/\.(csv|txt)$/i.test(file.name)) return parseCsv(new TextDecoder("utf-8").decode(bytes));
  throw new Error("Format tidak dikenal. Unggah berkas .xlsx atau .csv.");
}

export type ImportAction = "new" | "update" | "same" | "error";
export type ImportRow = { line: number; slug: string; title: string; action: ImportAction; changes: string[]; errors: string[] };
export type ImportPlan = { rows: ImportRow[]; unknown: string[]; counts: Record<ImportAction, number> };

type Pending = { id: number | null; form: FormData };

function toFormData(collection: CollectionKey, pairs: FormPairs): FormData {
  const form = new FormData();
  form.set("collection", collection);
  pairs.forEach((values, key) => values.forEach((v) => form.append(key, v)));
  return form;
}

// JSON dengan kunci terurut, supaya urutan kunci tidak dianggap perubahan.
function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value !== null) {
    if (typeof value === "object") {
      const o = value as Record<string, unknown>;
      return `{${Object.keys(o)
        .filter((k) => o[k] !== undefined)
        .sort()
        .map((k) => `${JSON.stringify(k)}:${stable(o[k])}`)
        .join(",")}}`;
    }
  }
  return JSON.stringify(value ?? null);
}

const META_LABELS: Record<string, string> = { slug: "Slug", visibility: "Status", position: "Urutan" };

async function plan(cfg: CollectionConfig, sheet: string[][]): Promise<{ plan: ImportPlan; pending: Map<number, Pending> }> {
  const cols = columnsFor(cfg);
  const read = readSheetRows(sheet, cols);
  if (read.error) throw new Error(read.error);
  if (read.rows.length === 0) throw new Error("Lembar Data tidak berisi baris data.");
  if (read.rows.length > MAX_IMPORT_ROWS) throw new Error(`Maksimal ${MAX_IMPORT_ROWS} baris sekali impor.`);

  const list = await listEntries(cfg.key, { publicOnly: false });
  const bySlug = new Map(list.map((e) => [e.slug, e]));
  const primary = await primaryLang();
  const seen = new Set<string>();
  const rows: ImportRow[] = [];
  const pending = new Map<number, Pending>();

  for (const row of read.rows) {
    const slug = (row.cells.get("slug") ?? "").trim();
    const existing = slug === "" ? undefined : bySlug.get(slug);
    const base = formFromEntry(cfg.fields, existing ? toTransfer(existing) : null);
    const { pairs, problems } = applyCells(cfg.fields, cols, base, row.cells);
    const id = existing ? existing.id : null;
    const item: ImportRow = { line: row.line, slug, title: "", action: existing ? "update" : "new", changes: [], errors: [...problems] };

    if (slug !== "") {
      if (seen.has(slug)) item.errors.push("Slug ini muncul lebih dari sekali di berkas.");
      seen.add(slug);
    }

    const form = toFormData(cfg.key, pairs);
    if (existing) {
      // Bandingkan dengan hasil menyimpan ulang data lama tanpa perubahan, bukan dengan data mentah,
      // supaya perbedaan bentuk (misalnya terjemahan kosong) tidak terhitung sebagai perubahan.
      const before = readFields(cfg.fields, toFormData(cfg.key, base), existing.data as Doc, primary).data;
      const after = readFields(cfg.fields, form, existing.data as Doc, primary).data;
      for (const f of cfg.fields) {
        if (stable(getPath(before, f.name)) !== stable(getPath(after, f.name))) item.changes.push(f.label);
      }
      for (const key of ["slug", "visibility", "position"]) {
        if (stable(base.get(key)) !== stable(pairs.get(key))) item.changes.push(META_LABELS[key]);
      }
      item.title = cfg.title(after) || existing.slug;
    } else {
      item.title = cfg.title(readFields(cfg.fields, form, {}, primary).data) || slug;
    }

    if (item.errors.length === 0) {
      if (existing) {
        if (item.changes.length === 0) item.action = "same";
      }
    }
    if (item.action !== "same") {
      if (item.errors.length === 0) {
        const check = await prepareEntry(cfg.key, id, form);
        if (!check.ok) {
          // Baris baru tanpa slug yang judulnya sudah ada: kemungkinan besar baris yang sama diimpor dua kali.
          if (!existing) {
            if (check.errors.slug !== undefined) {
              if (slug === "") check.errors.slug = "Data dengan judul ini sudah ada. Isi kolom slug dengan slug data itu untuk memperbaruinya, atau ubah judulnya.";
            }
          }
          const messages = Object.values(check.errors);
          item.errors.push(...(messages.length > 0 ? messages : [check.message ?? "Data ditolak."]));
        }
      }
    }
    if (item.errors.length > 0) item.action = "error";
    else if (item.action !== "same") pending.set(row.line, { id, form });
    rows.push(item);
  }

  const counts: Record<ImportAction, number> = { new: 0, update: 0, same: 0, error: 0 };
  for (const r of rows) counts[r.action] += 1;
  return { plan: { rows, unknown: read.unknown, counts }, pending };
}

export async function planImport(cfg: CollectionConfig, sheet: string[][]): Promise<ImportPlan> {
  return (await plan(cfg, sheet)).plan;
}

export type ImportResult = { saved: number; failed: { line: number; title: string; message: string }[]; skipped: number };

// Rencana dihitung ulang dari data terbaru, lalu baris baru dan berubah disimpan satu per satu.
// Baris yang gagal (misalnya batas sorotan terlampaui oleh baris sebelumnya) dilaporkan, sisanya tetap tersimpan.
export async function applyImport(cfg: CollectionConfig, sheet: string[][]): Promise<ImportResult> {
  const { plan: p, pending } = await plan(cfg, sheet);
  const result: ImportResult = { saved: 0, failed: [], skipped: p.counts.error };
  for (const row of p.rows) {
    const job = pending.get(row.line);
    if (job === undefined) continue;
    const res = await saveEntry(cfg.key, job.id, job.form);
    if (res.ok) result.saved += 1;
    else result.failed.push({ line: row.line, title: row.title, message: Object.values(res.errors)[0] ?? res.message ?? "Data ditolak." });
  }
  return result;
}
