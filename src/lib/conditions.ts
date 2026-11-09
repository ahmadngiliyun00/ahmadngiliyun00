// Aturan isian bersyarat formulir CMS (showWhen). Berkas murni tanpa impor nilai, jadi bisa diuji
// lewat npm test (tests/conditions.test.mjs). Dipakai src/content/fields.ts (validasi dan simpan) dan
// src/components/admin/EntryForm.tsx (tampil atau tidak), jadi aturan keduanya selalu sama.

// Syarat tampil sebuah isian berdasarkan isian lain (field). Semua syarat yang diisi harus terpenuhi.
// - values: isian field bernilai salah satu ini (select, boolean sebagai "true" atau "false", multiselect)
// - not: isian field tidak bernilai salah satu ini
// - filled: true = isian field sudah diisi (teks, tautan, dua bahasa, isi lengkap), false = masih kosong
// - keep: isian yang tersembunyi tetap disimpan apa adanya, hanya tidak divalidasi. Untuk pengaturan
//   yang dimatikan sementara (misalnya Server SMTP dikosongkan), supaya isian lain tidak hilang.
//   Tanpa keep, isian yang tersembunyi dikosongkan saat disimpan karena tidak berlaku.
// Isian kosong tidak cocok dengan values mana pun.
export type ShowWhen = { field: string; values?: string[]; not?: string[]; filled?: boolean; keep?: boolean };

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

// Spasi tak terputus dari editor (entitas nbsp). Karakter ampersand ditulis lewat kodenya, sesuai
// aturan penulisan proyek, seperti di src/lib/richtext.ts.
const NBSP_RE = new RegExp(`${String.fromCharCode(38)}nbsp;`, "g");

// Isian dianggap terisi bila punya teks (tag HTML kosong dari editor tidak dihitung, gambar dihitung),
// berisi daftar, atau untuk isian dua bahasa salah satu bahasanya terisi.
export function isFilled(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") {
    if (value.includes("<img")) return true;
    return value.replace(/<[^>]*>/g, "").replace(NBSP_RE, " ").trim() !== "";
  }
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return true;
  if (Array.isArray(value)) return value.some((x) => isFilled(x));
  if (typeof value === "object") return Object.values(value).some((x) => isFilled(x));
  return false;
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
  const raw = get(cond.field);
  if (cond.filled !== undefined) {
    if (isFilled(raw) !== cond.filled) return false;
  }
  const current = conditionValues(controller, raw);
  if (cond.values !== undefined) {
    if (!current.some((v) => cond.values?.includes(v))) return false;
  }
  if (cond.not !== undefined) {
    if (current.some((v) => cond.not?.includes(v))) return false;
  }
  return true;
}
