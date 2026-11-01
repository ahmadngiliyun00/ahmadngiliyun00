import "server-only";
import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { appConfig, type AutoPlatform } from "@/server/social/config";

// Koneksi akun media sosial disimpan di tabel settings dengan kunci "social-auth". Kunci ini
// sengaja tidak terdaftar di settingsConfigs, jadi tidak punya formulir, tidak ikut loadSite(),
// dan tidak pernah dikirim ke situs publik. Token dienkripsi AES-256-GCM dengan kunci yang
// diturunkan dari rahasia aplikasi Meta: salinan database saja tidak cukup untuk memakai token.
// Bila rahasia aplikasi diganti, token lama tidak bisa dibaca dan akun cukup dihubungkan ulang.

const KEY = "social-auth";
const IGNORED_LIMIT = 5000;

export type SyncReport = { at: string; added: number; skipped: number; images: number; more: boolean; error?: string };

export type Connection = {
  token: string; // terenkripsi
  accountId: string;
  name: string; // nama pengguna Instagram atau nama profil Facebook, hanya untuk CMS
  expiresAt: string | null; // ISO; null bila tidak kedaluwarsa
  connectedAt: string;
  refreshedAt: string;
  lastSync?: SyncReport;
};

type AuthDoc = {
  instagram?: Connection;
  facebook?: Connection;
  // "platform:id" postingan yang dihapus di CMS, supaya tidak ditarik lagi.
  ignored?: string[];
};

async function readDoc(): Promise<AuthDoc> {
  const rows = await db.select().from(settings).where(eq(settings.key, KEY)).limit(1);
  return (rows[0]?.value ?? {}) as AuthDoc;
}

async function writeDoc(doc: AuthDoc) {
  const now = new Date();
  const rows = await db.select({ key: settings.key }).from(settings).where(eq(settings.key, KEY)).limit(1);
  if (rows.length === 0) await db.insert(settings).values({ key: KEY, value: doc, updatedAt: now });
  else await db.update(settings).set({ value: doc, updatedAt: now }).where(eq(settings.key, KEY));
}

function cipherKey(platform: AutoPlatform): Buffer {
  const secret = appConfig(platform).appSecret;
  if (secret === "") throw new Error("Rahasia aplikasi Meta belum diatur di server.");
  return Buffer.from(hkdfSync("sha256", secret, "ngiliyun-social", `token:${platform}`, 32));
}

export function sealToken(platform: AutoPlatform, token: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", cipherKey(platform), iv);
  const body = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  return ["v1", iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), body.toString("base64url")].join(".");
}

export function openToken(platform: AutoPlatform, sealed: string): string | null {
  const [v, iv, tag, body] = sealed.split(".");
  if (v !== "v1" || iv === undefined || tag === undefined || body === undefined) return null;
  try {
    const decipher = createDecipheriv("aes-256-gcm", cipherKey(platform), Buffer.from(iv, "base64url"));
    decipher.setAuthTag(Buffer.from(tag, "base64url"));
    return Buffer.concat([decipher.update(Buffer.from(body, "base64url")), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}

// Ringkasan koneksi tanpa token, aman untuk dirender di halaman CMS.
export type ConnectionStatus = Omit<Connection, "token">;

export async function connectionStatuses(): Promise<Partial<Record<AutoPlatform, ConnectionStatus>>> {
  const doc = await readDoc();
  const strip = (c: Connection | undefined): ConnectionStatus | undefined => {
    if (c === undefined) return undefined;
    const { token: _token, ...rest } = c;
    return rest;
  };
  return { instagram: strip(doc.instagram), facebook: strip(doc.facebook) };
}

export async function getConnection(platform: AutoPlatform): Promise<{ connection: Connection; token: string } | null> {
  const connection = (await readDoc())[platform];
  if (connection === undefined) return null;
  const token = openToken(platform, connection.token);
  return token === null ? null : { connection, token };
}

export async function saveConnection(
  platform: AutoPlatform,
  value: { token: string; accountId: string; name: string; expiresAt: string | null },
) {
  const doc = await readDoc();
  const now = new Date().toISOString();
  const old = doc[platform];
  // Akun yang sama tetap menyimpan laporan tarikan terakhir; akun lain mulai dari awal.
  const lastSync = old ? (old.accountId === value.accountId ? old.lastSync : undefined) : undefined;
  doc[platform] = {
    token: sealToken(platform, value.token),
    accountId: value.accountId,
    name: value.name,
    expiresAt: value.expiresAt,
    connectedAt: old ? (old.accountId === value.accountId ? old.connectedAt : now) : now,
    refreshedAt: now,
    lastSync,
  };
  await writeDoc(doc);
}

export async function updateToken(platform: AutoPlatform, token: string, expiresAt: string | null) {
  const doc = await readDoc();
  const c = doc[platform];
  if (c === undefined) return;
  doc[platform] = { ...c, token: sealToken(platform, token), expiresAt, refreshedAt: new Date().toISOString() };
  await writeDoc(doc);
}

export async function recordSync(platform: AutoPlatform, report: SyncReport) {
  const doc = await readDoc();
  const c = doc[platform];
  if (c === undefined) return;
  doc[platform] = { ...c, lastSync: report };
  await writeDoc(doc);
}

export async function removeConnection(platform: AutoPlatform) {
  const doc = await readDoc();
  delete doc[platform];
  await writeDoc(doc);
}

export async function ignoredKeys(): Promise<Set<string>> {
  return new Set((await readDoc()).ignored ?? []);
}

// Dipanggil saat postingan hasil tarikan dihapus di CMS.
export async function ignorePost(key: string) {
  const doc = await readDoc();
  const list = doc.ignored ?? [];
  if (list.includes(key)) return;
  doc.ignored = [...list, key].slice(-IGNORED_LIMIT);
  await writeDoc(doc);
}
