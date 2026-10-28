import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, lt } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "@/db";
import { admins, sessions } from "@/db/schema";

// Sesi admin disimpan di database. Cookie hanya berisi token acak; database menyimpan hash-nya,
// jadi kebocoran isi tabel sessions tidak bisa dipakai untuk masuk.

export const SESSION_COOKIE = "ngp_session";
const SESSION_DAYS = 30;

export type AdminSession = { adminId: number; name: string; email: string; method: "password" | "github" };

export function sha256(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

export function secureCookies(): boolean {
  return (process.env.SITE_URL ?? "").startsWith("https://");
}

export async function createSession(adminId: number, method: "password" | "github") {
  const token = randomBytes(32).toString("base64url");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(sessions).values({ id: sha256(token), adminId, method, expiresAt, createdAt: now });
  // Bersihkan sesi kedaluwarsa sekalian.
  await db.delete(sessions).where(lt(sessions.expiresAt, now));
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: secureCookies(),
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

// Dipanggil sekali per permintaan (react cache), dipakai halaman dan aksi admin.
export const getSession = cache(async (): Promise<AdminSession | null> => {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const rows = await db
    .select({ adminId: admins.id, name: admins.name, email: admins.email, active: admins.active, method: sessions.method })
    .from(sessions)
    .innerJoin(admins, eq(admins.id, sessions.adminId))
    .where(and(eq(sessions.id, sha256(token)), gt(sessions.expiresAt, new Date())))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  if (!row.active) return null;
  return { adminId: row.adminId, name: row.name, email: row.email, method: row.method };
});

// Wajib dipanggil di awal setiap halaman admin dan setiap Server Action admin.
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getSession();
  if (session === null) redirect("/admin/login/");
  return session;
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await db.delete(sessions).where(eq(sessions.id, sha256(token)));
  jar.delete(SESSION_COOKIE);
}
