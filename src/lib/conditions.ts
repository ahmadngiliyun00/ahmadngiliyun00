// Aturan isian bersyarat formulir CMS (showWhen). Berkas murni tanpa impor nilai, jadi bisa diuji
// lewat npm test (tests/conditions.test.mjs). Dipakai src/content/fields.ts (validasi dan simpan) dan
// src/components/admin/EntryForm.tsx (tampil atau tidak), jadi aturan keduanya selalu sama.

// Tampil bila isian field bernilai salah satu values, dan tidak bernilai salah satu not.
// Boolean dibandingkan sebagai "true" atau "false"; isian kosong tidak cocok dengan values mana pun.
export type ShowWhen = { field: string; values?: string[]; not?: string[] };

// Bentuk minimum field yang dibutuhkan di sini (Field di fields.ts memenuhinya).
type CondField = { name: string; type: string; showWhen?: ShowWhen };

// Nilai isian pengendali sebagai daftar teks untuk dibandingkan dengan showWhen.
function conditionValues(controller: CondField | undefined, value: unknown): string[] {
  if (controller?.type === "boolean") return [value === true ? "true" : "false"];
  if (typeof value === "boolean") return [String(value)];
  if (typeof value === "string") return value === "" ? [] : [value];
  if (Array.isArray(value)) return value.filter((x): x is string => typeof x === "string");
  return [];
}

// Apakah isian tampil (dan berlaku) untuk nilai isian lain saat ini. get membaca nilai isian menurut
// namanya. Isian yang pengendalinya sendiri tersembunyi ikut tersembunyi. Dipakai formulir CMS
// (tampil atau tidak) dan readFields (validasi dan simpan), jadi aturan keduanya selalu sama.
export function fieldVisible(field: CondField, fields: CondField[], get: (name: string) => unknown, depth = 0): boolean {
  const cond = field.showWhen;
  if (cond === undefined) return true;
  const controller = fields.find((f) => f.name === cond.field);
  if (controller !== undefined) {
    // Batas kedalaman mencegah putaran tanpa akhir bila konfigurasi saling bergantung.
    if (depth < 5) {
      if (!fieldVisible(controller, fields, get, depth + 1)) return false;
    }
  }
  const current = conditionValues(controller, get(cond.field));
  if (cond.values !== undefined) {
    if (!current.some((v) => cond.values?.includes(v))) return false;
  }
  if (cond.not !== undefined) {
    if (current.some((v) => cond.not?.includes(v))) return false;
  }
  return true;
}
