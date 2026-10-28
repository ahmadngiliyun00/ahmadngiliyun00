// Isian dua bahasa (Indonesia dan Inggris) dengan satu bahasa utama, seperti OJS.
// Bahasa utama diatur di CMS (Pengaturan, Bahasa). Hanya impor tipe supaya bisa diuji
// dari tests/i18n.test.mjs.

import type { Field } from "@/content/fields";
import type { Lang } from "@/content/types";

export const LANGS: readonly Lang[] = ["id", "en"];

export function otherLang(lang: Lang): Lang {
  return lang === "id" ? "en" : "id";
}

// Urutan tampil di formulir: bahasa utama dulu.
export function langOrder(primary: Lang): Lang[] {
  return [primary, otherLang(primary)];
}

type Pair = { id?: unknown; en?: unknown };

function isPair(v: unknown): v is Pair {
  if (v === null || typeof v !== "object" || Array.isArray(v)) return false;
  const keys = Object.keys(v);
  if (keys.length !== 2) return false;
  if (!keys.includes("id")) return false;
  if (!keys.includes("en")) return false;
  const a = (v as Pair).id;
  const b = (v as Pair).en;
  const text = typeof a === "string" ? typeof b === "string" : false;
  const list = Array.isArray(a) ? Array.isArray(b) : false;
  return text ? true : list;
}

export function isBlank(v: unknown): boolean {
  if (v === undefined || v === null) return true;
  if (typeof v === "string") return v.trim() === "";
  if (Array.isArray(v)) return v.length === 0;
  return false;
}

// Untuk situs publik: sisi bahasa yang kosong diisi dari sisi lain (bahasa utama lebih dulu),
// supaya halaman versi bahasa lain tidak kosong selama terjemahan belum ada.
// skip = nama kunci yang dibiarkan apa adanya (misalnya isi lengkap tulisan, yang menentukan
// apakah tulisan punya halaman di bahasa itu).
export function fillLocalized<T>(value: T, primary: Lang, skip: readonly string[] = []): T {
  if (Array.isArray(value)) return value.map((v) => fillLocalized(v, primary, skip)) as T;
  if (value === null || typeof value !== "object") return value;
  if (isPair(value)) {
    const other = otherLang(primary);
    const p = value[primary];
    const o = value[other];
    if (isBlank(o)) return { ...value, [other]: p } as T;
    if (isBlank(p)) return { ...value, [primary]: o } as T;
    return value;
  }
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value)) out[k] = skip.includes(k) ? v : fillLocalized(v, primary, skip);
  return out as T;
}

function getPath(doc: Record<string, unknown>, path: string): unknown {
  let cur: unknown = doc;
  for (const key of path.split(".")) {
    if (cur === null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[key];
  }
  return cur;
}

const LOCALIZED_TYPES = ["localized", "localizedList", "richtext"];

export type TranslationStatus = "complete" | "missing" | "empty";

export function pairStatus(primaryValue: unknown, otherValue: unknown): TranslationStatus {
  const p = isBlank(primaryValue);
  const o = isBlank(otherValue);
  if (p) return o ? "empty" : "missing";
  return o ? "missing" : "complete";
}

// Label isian dua bahasa yang sudah berisi tetapi belum lengkap di salah satu bahasa.
export function translationGaps(fields: readonly Field[], doc: Record<string, unknown>): string[] {
  const out: string[] = [];
  for (const f of fields) {
    if (!LOCALIZED_TYPES.includes(f.type)) continue;
    const v = (getPath(doc, f.name) ?? {}) as Pair;
    if (pairStatus(v.id, v.en) === "missing") out.push(f.label);
  }
  return out;
}
