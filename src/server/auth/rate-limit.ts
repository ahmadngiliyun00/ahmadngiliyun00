import "server-only";
import { inArray, lt, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { loginAttempts } from "@/db/schema";

// Pembatas percobaan per kunci. Bawaan untuk login: maksimal 5 percobaan per 15 menit
// untuk setiap kunci (IP dan email). Form kontak memakai kunci "contact:<ip>" dengan batas sendiri.
//
// Setiap percobaan dicatat lebih dulu secara atomik, baru hitungannya diperiksa. Kalau urutannya
// dibalik (periksa lalu catat), ratusan permintaan serentak lolos semua sebelum satu pun tercatat.

const LIMIT = 5;
const WINDOW_MS = 15 * 60 * 1000;
// Baris yang jendelanya sudah lewat sehari dibuang, paling sering sekali per jam.
const CLEANUP_AGE_MS = 24 * 60 * 60 * 1000;
const CLEANUP_EVERY_MS = 60 * 60 * 1000;

export type LimitOptions = { limit: number; windowMs: number };
const DEFAULT: LimitOptions = { limit: LIMIT, windowMs: WINDOW_MS };

const globalForLimit = globalThis as unknown as { limitCleanupAt?: number };

// Kolom key maksimal 190 karakter; email login bisa diisi sepanjang apa pun.
function keyOf(key: string): string {
  return key.slice(0, 190);
}

export async function clientIp(): Promise<string> {
  const h = await headers();
  // Di belakang Nginx, alamat asli dikirim lewat X-Real-IP (lihat docs/DEPLOY.md). Nginx
  // menimpa header itu, jadi nilainya tidak bisa dipalsukan pengunjung.
  const real = h.get("x-real-ip");
  if (real) return real.trim();
  // Cadangan: entri terakhir X-Forwarded-For, yaitu alamat yang dilihat proxy kita sendiri
  // (atau soket, yang diisi Next.js bila header kosong). Entri di depannya dikirim pengunjung
  // dan bisa diisi apa saja.
  const fwd = (h.get("x-forwarded-for") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s !== "");
  return fwd.length > 0 ? fwd[fwd.length - 1] : "unknown";
}

// Tambah satu percobaan untuk satu kunci dalam satu pernyataan SQL dan kembalikan hitungan
// barunya. LAST_INSERT_ID(expr) membuat hitungan itu ikut terbawa di hasil pernyataan (insertId),
// jadi tidak perlu SELECT terpisah yang bisa membaca tambahan dari permintaan lain. Bila jendela
// lama sudah lewat, hitungan dimulai lagi dari 1. Urutan SET penting: count dihitung dari
// window_start lama.
async function hit(rawKey: string, opts: LimitOptions): Promise<number> {
  const key = keyOf(rawKey);
  const now = new Date();
  const cutoff = new Date(now.getTime() - opts.windowMs);
  const k = sql.identifier("key");
  const [res] = await db.execute(sql`
    INSERT INTO login_attempts (${k}, count, window_start) VALUES (${key}, LAST_INSERT_ID(1), ${now})
    ON DUPLICATE KEY UPDATE
      count = LAST_INSERT_ID(IF(window_start < ${cutoff}, 1, count + 1)),
      window_start = IF(window_start < ${cutoff}, ${now}, window_start)
  `);
  return Number((res as unknown as { insertId: number }).insertId);
}

async function cleanup() {
  const now = Date.now();
  if (now - (globalForLimit.limitCleanupAt ?? 0) < CLEANUP_EVERY_MS) return;
  globalForLimit.limitCleanupAt = now;
  await db.delete(loginAttempts).where(lt(loginAttempts.windowStart, new Date(now - CLEANUP_AGE_MS)));
}

// Catat satu percobaan untuk semua kunci, lalu true bila salah satunya melewati batas.
// Dipanggil sebelum pekerjaan yang dilindungi (cek kata sandi, simpan pesan, dan sebagainya).
export async function consumeAttempt(keys: string[], opts: LimitOptions = DEFAULT): Promise<boolean> {
  await cleanup();
  let limited = false;
  for (const key of keys) {
    const n = await hit(key, opts);
    if (n > opts.limit) limited = true;
  }
  return limited;
}

// Login berhasil: hitungan kunci dikosongkan lagi.
export async function clearFailures(keys: string[]) {
  if (keys.length === 0) return;
  await db.delete(loginAttempts).where(inArray(loginAttempts.key, keys.map(keyOf)));
}
