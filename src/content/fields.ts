// Definisi field generik untuk formulir CMS dan validasinya.
// Satu definisi dipakai tiga kali: merender formulir admin, membaca FormData, dan memvalidasi data.

import type { PartialDate } from "@/content/types";

export type Option = { value: string; label: string };

interface Base {
  name: string;
  label: string;
  help?: string;
  required?: boolean;
  placeholder?: string; // bila kosong, FieldInput membuat placeholder dari jenis dan label field
}
interface PlainField extends Base {
  type: "text" | "url" | "textarea" | "boolean" | "date" | "list" | "localizedList" | "links" | "file" | "secret";
}
interface LocalizedField extends Base {
  type: "localized";
  multiline?: boolean;
}
interface NumberField extends Base {
  type: "number";
  min?: number;
  max?: number;
}
interface ChoiceField extends Base {
  type: "select" | "multiselect";
  options: Option[];
}
interface ReferenceField extends Base {
  type: "reference";
  collection: string;
}

export type Field = PlainField | LocalizedField | NumberField | ChoiceField | ReferenceField;

export type FieldErrors = Record<string, string>;

// Satu objek data JSON bebas. Nilainya divalidasi oleh field, bukan oleh tipe TypeScript.
export type Doc = Record<string, unknown>;

const EM_DASH = String.fromCharCode(0x2014);
const AMPERSAND = String.fromCharCode(0x26);

export function getPath(doc: Doc, path: string): unknown {
  let cur: unknown = doc;
  for (const key of path.split(".")) {
    if (cur === null || typeof cur !== "object") return undefined;
    cur = (cur as Doc)[key];
  }
  return cur;
}

export function setPath(doc: Doc, path: string, value: unknown) {
  const keys = path.split(".");
  let cur: Doc = doc;
  keys.slice(0, -1).forEach((key) => {
    const next = cur[key];
    if (next === null || typeof next !== "object") cur[key] = {};
    cur = cur[key] as Doc;
  });
  const last = keys[keys.length - 1];
  if (value === undefined) delete cur[last];
  else cur[last] = value;
}

function str(form: FormData, key: string): string {
  const v = form.get(key);
  return typeof v === "string" ? v.replace(/\r\n/g, "\n").trim() : "";
}

function lines(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l !== "");
}

function checkText(value: string, label: string, errors: FieldErrors, key: string) {
  if (value.includes(EM_DASH)) errors[key] = `${label}: ganti em dash dengan tanda hubung "-".`;
  else if (value.includes(AMPERSAND)) errors[key] = `${label}: tulis "dan" atau "and", bukan simbol ampersand.`;
}

function isHttps(url: string): boolean {
  try {
    return new URL(url).protocol === "https:";
  } catch {
    return false;
  }
}

// Membaca nilai satu field dari FormData. Nilai kosong menjadi undefined (kolom dihapus dari data).
export function readField(field: Field, form: FormData, errors: FieldErrors): unknown {
  const key = `f.${field.name}`;
  const label = field.label;

  switch (field.type) {
    case "text":
    case "textarea": {
      const v = str(form, key);
      if (v === "") return undefined;
      checkText(v, label, errors, field.name);
      return v;
    }
    case "url": {
      const v = str(form, key);
      if (v === "") return undefined;
      if (v.startsWith("#")) return v;
      if (!isHttps(v)) errors[field.name] = `${label}: harus URL https, misalnya https://contoh.id`;
      return v;
    }
    case "localized": {
      const id = str(form, `${key}.id`);
      const en = str(form, `${key}.en`);
      if (id === "") {
        if (en === "") return undefined;
      }
      if (id === "" || en === "") {
        errors[field.name] = `${label}: isi versi Indonesia dan Inggris.`;
      }
      checkText(`${id} ${en}`, label, errors, field.name);
      return { id, en };
    }
    case "number": {
      const v = str(form, key);
      if (v === "") return undefined;
      const n = Number(v.replace(",", "."));
      if (!Number.isFinite(n)) {
        errors[field.name] = `${label}: harus angka.`;
        return undefined;
      }
      if (field.min !== undefined) {
        if (n < field.min) errors[field.name] = `${label}: minimal ${field.min}.`;
      }
      if (field.max !== undefined) {
        if (n > field.max) errors[field.name] = `${label}: maksimal ${field.max}.`;
      }
      return n;
    }
    case "boolean":
      return form.get(key) === "on";
    case "select":
    case "reference": {
      const v = str(form, key);
      if (v === "") return undefined;
      if (field.type === "select") {
        if (!field.options.some((o) => o.value === v)) errors[field.name] = `${label}: pilihan tidak dikenal.`;
      }
      return v;
    }
    case "multiselect": {
      const values = form.getAll(key).filter((v): v is string => typeof v === "string");
      const valid = values.filter((v) => field.options.some((o) => o.value === v));
      return valid.length === 0 ? undefined : valid;
    }
    case "date": {
      const y = str(form, `${key}.year`);
      const m = str(form, `${key}.month`);
      const d = str(form, `${key}.day`);
      if (y === "") {
        if (m !== "" || d !== "") errors[field.name] = `${label}: tahun wajib diisi bila bulan atau tanggal diisi.`;
        return null;
      }
      const date: PartialDate = { year: Number(y) };
      if (!Number.isInteger(date.year) || date.year < 1990 || date.year > 2100) {
        errors[field.name] = `${label}: tahun tidak wajar.`;
      }
      if (m !== "") {
        date.month = Number(m);
        if (!Number.isInteger(date.month) || date.month < 1 || date.month > 12) errors[field.name] = `${label}: bulan 1 sampai 12.`;
      }
      if (d !== "") {
        if (m === "") errors[field.name] = `${label}: isi bulan bila tanggal diisi.`;
        date.day = Number(d);
        if (!Number.isInteger(date.day) || date.day < 1 || date.day > 31) errors[field.name] = `${label}: tanggal 1 sampai 31.`;
      }
      return date;
    }
    case "list": {
      const items = lines(str(form, key));
      items.forEach((item) => checkText(item, label, errors, field.name));
      return items.length === 0 ? undefined : items;
    }
    case "localizedList": {
      const id = lines(str(form, `${key}.id`));
      const en = lines(str(form, `${key}.en`));
      if (id.length === 0) {
        if (en.length === 0) return undefined;
      }
      [...id, ...en].forEach((item) => checkText(item, label, errors, field.name));
      return { id, en };
    }
    case "links": {
      // Satu tautan per baris: Label Indonesia | Label Inggris | https://...
      const rows = lines(str(form, key));
      const out = rows.map((row) => {
        const parts = row.split("|").map((p) => p.trim());
        if (parts.length !== 3) {
          errors[field.name] = `${label}: format per baris "Label ID | Label EN | https://..."`;
          return null;
        }
        const [id, en, href] = parts;
        if (!isHttps(href)) errors[field.name] = `${label}: tautan harus https.`;
        checkText(`${id} ${en}`, label, errors, field.name);
        return { label: { id, en }, href };
      });
      const valid = out.filter((x) => x !== null);
      return valid.length === 0 ? undefined : valid;
    }
    case "file": {
      const v = str(form, key);
      return v === "" ? undefined : v;
    }
    case "secret": {
      // Rahasia (misalnya sandi SMTP) tidak pernah dikirim balik ke formulir. Kosong berarti
      // tetap memakai nilai tersimpan; readFields tidak menimpanya.
      const v = str(form, key);
      return v === "" ? undefined : v;
    }
  }
}

export function readFields(fields: Field[], form: FormData, base: Doc = {}): { data: Doc; errors: FieldErrors } {
  const errors: FieldErrors = {};
  const data: Doc = structuredClone(base);
  for (const field of fields) {
    const value = readField(field, form, errors);
    if (field.type === "secret") {
      if (value === undefined) continue;
    }
    setPath(data, field.name, value);
    if (field.required) {
      const empty = value === undefined || value === null || value === "";
      if (empty) errors[field.name] = errors[field.name] ?? `${field.label} wajib diisi.`;
    }
  }
  return { data, errors };
}

// Nilai field dalam bentuk teks untuk mengisi formulir.
export function formValue(field: Field, doc: Doc): string | { id: string; en: string } | PartialDate | string[] | boolean | null {
  const v = getPath(doc, field.name);
  switch (field.type) {
    case "localized": {
      const o = (v ?? {}) as { id?: string; en?: string };
      return { id: o.id ?? "", en: o.en ?? "" };
    }
    case "localizedList": {
      const o = (v ?? {}) as { id?: string[]; en?: string[] };
      return { id: (o.id ?? []).join("\n"), en: (o.en ?? []).join("\n") };
    }
    case "list":
      return Array.isArray(v) ? (v as string[]).join("\n") : "";
    case "links":
      return Array.isArray(v)
        ? (v as { label: { id: string; en: string }; href: string }[])
            .map((l) => `${l.label.id} | ${l.label.en} | ${l.href}`)
            .join("\n")
        : "";
    case "boolean":
      return v === true;
    case "multiselect":
      return Array.isArray(v) ? (v as string[]) : [];
    case "date":
      return (v ?? null) as PartialDate | null;
    case "number":
      return typeof v === "number" ? String(v) : "";
    case "secret":
      // Hanya penanda sudah tersimpan atau belum; nilainya tidak pernah dikirim ke browser.
      return typeof v === "string" ? v !== "" : false;
    default:
      return typeof v === "string" ? v : "";
  }
}

export function slugify(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
