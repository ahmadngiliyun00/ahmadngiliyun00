import "server-only";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { loginAttempts } from "@/db/schema";

// Pembatas percobaan per kunci. Bawaan untuk login: maksimal 5 kegagalan per 15 menit
// untuk setiap kunci (IP dan email). Form kontak memakai kunci "contact:<ip>" dengan batas sendiri.

const LIMIT = 5;
const WINDOW_MS = 15 * 60 * 1000;

export type LimitOptions = { limit: number; windowMs: number };
const DEFAULT: LimitOptions = { limit: LIMIT, windowMs: WINDOW_MS };

export async function clientIp(): Promise<string> {
  const h = await headers();
  // Di belakang Nginx, alamat asli dikirim lewat X-Real-IP atau X-Forwarded-For (lihat docs/DEPLOY.md).
  const real = h.get("x-real-ip");
  if (real) return real.trim();
  const fwd = h.get("x-forwarded-for");
  return fwd ? fwd.split(",")[0].trim() : "unknown";
}

export async function isLimited(keys: string[], opts: LimitOptions = DEFAULT): Promise<boolean> {
  const now = Date.now();
  for (const key of keys) {
    const rows = await db.select().from(loginAttempts).where(eq(loginAttempts.key, key)).limit(1);
    const row = rows[0];
    if (!row) continue;
    if (now - row.windowStart.getTime() > opts.windowMs) continue;
    if (row.count >= opts.limit) return true;
  }
  return false;
}

export async function recordFailure(keys: string[], opts: LimitOptions = DEFAULT) {
  const now = new Date();
  for (const key of keys) {
    const rows = await db.select().from(loginAttempts).where(eq(loginAttempts.key, key)).limit(1);
    const row = rows[0];
    if (!row) {
      await db.insert(loginAttempts).values({ key, count: 1, windowStart: now });
    } else if (now.getTime() - row.windowStart.getTime() > opts.windowMs) {
      await db.update(loginAttempts).set({ count: 1, windowStart: now }).where(eq(loginAttempts.key, key));
    } else {
      await db.update(loginAttempts).set({ count: row.count + 1 }).where(eq(loginAttempts.key, key));
    }
  }
}

export async function clearFailures(keys: string[]) {
  for (const key of keys) await db.delete(loginAttempts).where(eq(loginAttempts.key, key));
}
