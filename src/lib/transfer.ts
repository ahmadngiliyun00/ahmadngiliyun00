// Ekspor dan impor data koleksi CMS lewat lembar kerja (Excel atau CSV).
// Satu kolom per isian formulir. Kunci kolom sama dengan nama isian di formulir CMS tanpa awalan
// "f." (misalnya title.id, issued.year), jadi baris lembar kerja bisa diubah menjadi isian formulir
// dan disimpan lewat jalur yang sama dengan tombol Simpan (validasi dan aturan ikut berlaku).
// Berkas ini hanya boleh import type (dibaca unit test).

import type { Doc, Field } from "@/content/fields";

export type TransferColumn = { key: string; label: string; note: string; options?: string[]; width: number };

// Satu data seperti di tabel entries.
export type TransferEntry = { slug: string; visibility: "public" | "private"; position: number; data: Doc };

// Isian formulir: kunci tanpa awalan "f." untuk isian meta (slug, visibility, position), dengan awalan untuk field.
export type FormPairs = Map<string, string[]>;

export const YES = "ya";
export const NO = "tidak";
const VIS_PUBLIC = "public";
const VIS_PRIVATE = "privat";

// Jenis field yang tidak ikut lembar kerja: berkas, rahasia, dan isi rich text (HTML).
const SKIPPED: Field["type"][] = ["file", "secret", "richtext"];

function getPath(doc: Doc, path: string): unknown {
  let cur: unknown = doc;
  for (const key of path.split(".")) {
    if (cur === null || typeof cur !== "object") return undefined;
    cur = (cur as Doc)[key];
  }
  return cur;
}

const LANG_LABEL = { id: "Indonesia", en: "Inggris" } as const;

// Kolom lembar kerja untuk satu koleksi. ordered: koleksi berurutan manual (kolom position ikut).
export function transferColumns(fields: Field[], ordered: boolean): TransferColumn[] {
  const cols: TransferColumn[] = [
    { key: "slug", label: "Slug", width: 28, note: "Kunci pencocokan dengan data di CMS. Jangan diubah. Kosongkan untuk menambah data baru." },
    {
      key: "visibility",
      label: "Status",
      width: 10,
      options: [VIS_PUBLIC, VIS_PRIVATE],
      note: `${VIS_PUBLIC} tampil di situs, ${VIS_PRIVATE} hanya di CMS. Data baru tanpa status menjadi ${VIS_PRIVATE}.`,
    },
  ];
  if (ordered) cols.push({ key: "position", label: "Urutan", width: 8, note: "Bilangan bulat, angka kecil tampil lebih dulu." });

  for (const f of fields) {
    if (SKIPPED.includes(f.type)) continue;
    const help = f.help ? ` ${f.help}` : "";
    switch (f.type) {
      case "localized":
      case "localizedList":
        for (const lang of ["id", "en"] as const) {
          const list = f.type === "localizedList" ? " Satu per baris di dalam sel." : "";
          cols.push({
            key: `${f.name}.${lang}`,
            label: `${f.label} (${LANG_LABEL[lang]})`,
            width: f.type === "localized" ? (f.multiline ? 48 : 36) : 30,
            note: `Bahasa ${LANG_LABEL[lang]}.${list}${help}`,
          });
        }
        break;
      case "date":
        cols.push(
          { key: `${f.name}.year`, label: `${f.label}: tahun`, width: 8, note: "Empat angka, misalnya 2025." },
          { key: `${f.name}.month`, label: `${f.label}: bulan`, width: 8, note: "Angka 1 sampai 12. Boleh kosong." },
          { key: `${f.name}.day`, label: `${f.label}: tanggal`, width: 8, note: "Angka 1 sampai 31. Isi bulan lebih dulu." },
        );
        break;
      case "boolean":
        cols.push({ key: f.name, label: f.label, width: 10, options: [YES, NO], note: `${YES} atau ${NO}.${help}` });
        break;
      case "select":
        cols.push({
          key: f.name,
          label: f.label,
          width: 16,
          options: f.options.map((o) => o.value),
          note: `Salah satu kode: ${f.options.map((o) => `${o.value} (${o.label})`).join(", ")}.${help}`,
        });
        break;
      case "multiselect":
        cols.push({
          key: f.name,
          label: f.label,
          width: 24,
          note: `Satu atau lebih kode dipisah koma: ${f.options.map((o) => `${o.value} (${o.label})`).join(", ")}.${help}`,
        });
        break;
      case "list":
        cols.push({ key: f.name, label: f.label, width: 30, note: `Satu per baris di dalam sel.${help}` });
        break;
      case "links":
        cols.push({ key: f.name, label: f.label, width: 48, note: "Satu per baris di dalam sel: Label Indonesia | Label Inggris | https://..." });
        break;
      case "url":
        cols.push({ key: f.name, label: f.label, width: 40, note: `Alamat https.${help}` });
        break;
      case "textarea":
        cols.push({ key: f.name, label: f.label, width: 48, note: help.trim() });
        break;
      default:
        cols.push({ key: f.name, label: f.label, width: f.type === "number" ? 10 : 24, note: help.trim() });
    }
  }
  return cols;
}

// Judul kolom di lembar kerja: label yang mudah dibaca, kunci di dalam kurung siku di akhir.
export function headerText(col: TransferColumn): string {
  return `${col.label} [${col.key}]`;
}

// Kunci kolom dari judul. Judul yang hanya berisi kunci (misalnya dari CSV buatan sendiri) juga diterima.
export function headerKey(text: string): string {
  const t = text.trim();
  const m = /\[([^\]]+)\]$/.exec(t);
  return (m === null ? t : m[1]).trim();
}

// Nilai satu kolom untuk satu data, dalam bentuk teks sel.
export function cellValue(fields: Field[], col: TransferColumn, entry: TransferEntry): string {
  if (col.key === "slug") return entry.slug;
  if (col.key === "visibility") return entry.visibility === "public" ? VIS_PUBLIC : VIS_PRIVATE;
  if (col.key === "position") return String(entry.position);

  const field = fields.find((f) => col.key === f.name || col.key.startsWith(`${f.name}.`));
  if (field === undefined) return "";
  const sub = col.key.slice(field.name.length + 1);
  const v = getPath(entry.data, field.name);
  switch (field.type) {
    case "localized": {
      const o = (v ?? {}) as Record<string, unknown>;
      return typeof o[sub] === "string" ? (o[sub] as string) : "";
    }
    case "localizedList": {
      const o = (v ?? {}) as Record<string, unknown>;
      return Array.isArray(o[sub]) ? (o[sub] as string[]).join("\n") : "";
    }
    case "date": {
      const o = (v ?? {}) as Record<string, unknown>;
      return typeof o[sub] === "number" ? String(o[sub]) : "";
    }
    case "boolean":
      return v === true ? YES : NO;
    case "list":
      return Array.isArray(v) ? (v as string[]).join("\n") : "";
    case "multiselect":
      return Array.isArray(v) ? (v as string[]).join(", ") : "";
    case "links":
      return Array.isArray(v)
        ? (v as { label: { id: string; en: string }; href: string }[]).map((l) => `${l.label.id} | ${l.label.en} | ${l.href}`).join("\n")
        : "";
    case "number":
      return typeof v === "number" ? String(v) : "";
    default:
      return typeof v === "string" ? v : "";
  }
}

export function entryRow(fields: Field[], cols: TransferColumn[], entry: TransferEntry): string[] {
  return cols.map((c) => cellValue(fields, c, entry));
}

// Isian formulir dari data tersimpan, sama seperti yang dikirim formulir CMS bila tidak ada yang diubah.
// Semua field ikut (termasuk berkas dan isi rich text), supaya menyimpan ulang tidak menghapus apa pun.
export function formFromEntry(fields: Field[], entry: TransferEntry | null): FormPairs {
  const pairs: FormPairs = new Map();
  const put = (key: string, value: string) => {
    if (value !== "") pairs.set(key, [value]);
  };
  if (entry === null) {
    pairs.set("visibility", ["private"]);
    return pairs;
  }
  pairs.set("slug", [entry.slug]);
  pairs.set("visibility", [entry.visibility]);
  pairs.set("position", [String(entry.position)]);
  for (const f of fields) {
    const key = `f.${f.name}`;
    const v = getPath(entry.data, f.name);
    switch (f.type) {
      case "localized":
      case "richtext": {
        const o = (v ?? {}) as Record<string, unknown>;
        put(`${key}.id`, typeof o.id === "string" ? o.id : "");
        put(`${key}.en`, typeof o.en === "string" ? o.en : "");
        break;
      }
      case "localizedList": {
        const o = (v ?? {}) as Record<string, unknown>;
        put(`${key}.id`, Array.isArray(o.id) ? (o.id as string[]).join("\n") : "");
        put(`${key}.en`, Array.isArray(o.en) ? (o.en as string[]).join("\n") : "");
        break;
      }
      case "date": {
        const o = (v ?? {}) as Record<string, unknown>;
        for (const part of ["year", "month", "day"]) put(`${key}.${part}`, typeof o[part] === "number" ? String(o[part]) : "");
        break;
      }
      case "boolean":
        if (v === true) pairs.set(key, ["on"]);
        break;
      case "multiselect":
        if (Array.isArray(v)) {
          if (v.length > 0) pairs.set(key, (v as string[]).map(String));
        }
        break;
      case "secret":
        // Rahasia kosong berarti nilai tersimpan dipakai terus (readFields tidak menimpanya).
        break;
      default: {
        const col: TransferColumn = { key: f.name, label: "", note: "", width: 0 };
        put(key, cellValue(fields, col, entry));
      }
    }
  }
  return pairs;
}

function parseBoolean(text: string): boolean | null {
  const t = text.trim().toLowerCase();
  if (["ya", "y", "yes", "true", "1", "benar"].includes(t)) return true;
  if (["tidak", "t", "no", "n", "false", "0", "salah"].includes(t)) return false;
  return null;
}

// Angka dari Excel bisa tertulis "2025.0" atau "5,0"; ambil bilangan bulatnya bila memang bulat.
function wholeNumber(text: string): string {
  const n = Number(text.replace(",", "."));
  return Number.isInteger(n) ? String(n) : text;
}

// Menimpa isian formulir dengan sel lembar kerja. Sel kosong berarti tidak diubah.
// Mengembalikan isian baru dan daftar masalah per sel (sel yang ditolak tidak dipakai).
export function applyCells(
  fields: Field[],
  cols: TransferColumn[],
  base: FormPairs,
  cells: Map<string, string>,
): { pairs: FormPairs; problems: string[] } {
  const pairs: FormPairs = new Map(base);
  const problems: string[] = [];
  for (const col of cols) {
    const raw = cells.get(col.key);
    if (raw === undefined) continue;
    const text = raw.replace(/\r\n?/g, "\n").trim();
    if (text === "") continue;

    if (col.key === "slug") {
      pairs.set("slug", [text]);
      continue;
    }
    if (col.key === "visibility") {
      const t = text.toLowerCase();
      if (["public", "publik"].includes(t)) pairs.set("visibility", ["public"]);
      else if (["privat", "private"].includes(t)) pairs.set("visibility", ["private"]);
      else problems.push(`${col.label}: isi ${VIS_PUBLIC} atau ${VIS_PRIVATE}.`);
      continue;
    }
    if (col.key === "position") {
      pairs.set("position", [wholeNumber(text)]);
      continue;
    }

    const field = fields.find((f) => col.key === f.name || col.key.startsWith(`${f.name}.`));
    if (field === undefined) continue;
    const key = `f.${col.key}`;
    if (field.type === "boolean") {
      const b = parseBoolean(text);
      if (b === null) problems.push(`${col.label}: isi ${YES} atau ${NO}.`);
      else if (b) pairs.set(key, ["on"]);
      else pairs.delete(key);
      continue;
    }
    if (field.type === "multiselect") {
      const values = text.split(/[,\n]/).map((v) => v.trim()).filter((v) => v !== "");
      const unknown = values.filter((v) => !field.options.some((o) => o.value === v));
      if (unknown.length > 0) problems.push(`${col.label}: kode tidak dikenal ${unknown.join(", ")}.`);
      else pairs.set(key, values);
      continue;
    }
    if (field.type === "date") {
      pairs.set(key, [wholeNumber(text)]);
      continue;
    }
    if (field.type === "number") {
      pairs.set(key, [text.replace(",", ".")]);
      continue;
    }
    pairs.set(key, [text]);
  }
  return { pairs, problems };
}

export type SheetRow = { line: number; cells: Map<string, string> };

// Baris lembar kerja menjadi peta kunci kolom ke isi sel. Baris judul dicari di 5 baris pertama
// (baris yang memuat kolom slug). Baris kosong dilewati. Kolom yang tidak dikenal dilaporkan.
export function readSheetRows(
  rows: string[][],
  cols: TransferColumn[],
): { rows: SheetRow[]; unknown: string[]; error?: string } {
  const known = new Set(cols.map((c) => c.key));
  const headerAt = rows.slice(0, 5).findIndex((r) => r.some((c) => headerKey(c) === "slug"));
  if (headerAt < 0) return { rows: [], unknown: [], error: "Baris judul dengan kolom slug tidak ditemukan. Pakai berkas hasil ekspor." };

  const header = rows[headerAt].map(headerKey);
  const unknown = header.filter((k) => k !== "").filter((k) => !known.has(k));
  const out: SheetRow[] = [];
  rows.slice(headerAt + 1).forEach((r, i) => {
    const cells = new Map<string, string>();
    header.forEach((key, c) => {
      if (!known.has(key)) return;
      cells.set(key, r[c] ?? "");
    });
    const empty = [...cells.values()].every((v) => v.trim() === "");
    if (!empty) out.push({ line: headerAt + i + 2, cells });
  });
  return { rows: out, unknown };
}
