import "server-only";
import { and, eq } from "drizzle-orm";
import type { Doc } from "@/content/fields";
import type { Lang, SocialPlatform, SocialPost, SocialSettings } from "@/content/types";
import { db } from "@/db";
import { entries } from "@/db/schema";
import { cleanCaption, isAllowedMediaUrl, matchTopic, parseLinkedinShares, parseTopicRules, partialDateFrom, socialSlug } from "@/lib/social";
import { getSetting, primaryLang } from "@/server/content";
import { MAX_UPLOAD_BYTES, saveUpload } from "@/server/files";
import { appConfig, type AutoPlatform } from "@/server/social/config";
import { fetchPage, instagramRefresh, MetaError, type RemotePost } from "@/server/social/meta";
import { getConnection, ignoredKeys, recordSync, updateToken, type SyncReport } from "@/server/social/store";

// Menarik postingan dari akun yang terhubung ke koleksi "social" sebagai data privat.
// Postingan yang sudah ada (atau pernah dihapus di CMS) tidak ditarik lagi dan tidak ditimpa,
// jadi suntingan di CMS aman. Pemanggil WAJIB sudah memanggil requireAdmin() atau memeriksa
// rahasia cron.

// Satu kali tarik paling banyak sekian postingan baru, supaya permintaan tidak melewati batas
// waktu proxy (Nginx 60 detik). Sisanya ditarik pada tarikan berikutnya.
const MAX_NEW = 30;
const MAX_PAGES = 20;
const DAY_MS = 24 * 60 * 60 * 1000;

export const key = (platform: SocialPlatform, sourceId: string) => `${platform}:${sourceId}`;

export async function knownKeys(): Promise<Set<string>> {
  const rows = await db.select({ data: entries.data }).from(entries).where(eq(entries.collection, "social"));
  const known = await ignoredKeys();
  for (const r of rows) {
    const d = r.data as Doc;
    if (typeof d.platform === "string") {
      if (typeof d.sourceId === "string") known.add(key(d.platform as SocialPlatform, d.sourceId));
    }
  }
  return known;
}

export async function socialSettings(): Promise<{ topics: ReturnType<typeof parseTopicRules>["rules"]; facebookAll: boolean }> {
  const s = (await getSetting<SocialSettings>("social")) ?? {};
  return { topics: parseTopicRules(s.topicRules ?? []).rules, facebookAll: s.facebookAll === true };
}

function localized(primary: Lang, text: string): Record<Lang, string> {
  return primary === "id" ? { id: text, en: "" } : { id: "", en: text };
}

async function downloadImage(url: string): Promise<Buffer | null> {
  if (!isAllowedMediaUrl(url)) return null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(20000), redirect: "error", cache: "no-store" });
    if (!res.ok) return null;
    const size = Number(res.headers.get("content-length") ?? "0");
    if (size > MAX_UPLOAD_BYTES) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    return buf.length > MAX_UPLOAD_BYTES ? null : buf;
  } catch {
    return null;
  }
}

export type NewPost = {
  platform: SocialPlatform;
  sourceId: string;
  url?: string;
  text: string;
  date: SocialPost["date"];
  note?: string;
  imageUrl?: string;
};

export type TopicRules = ReturnType<typeof parseTopicRules>["rules"];

// Menyimpan satu postingan baru sebagai data privat: caption lewat cleanCaption, topik lewat
// matchTopic. Mengembalikan ID data. Gambar disalin terpisah (attachRemoteImage atau impor ekspor).
export async function insertPost(post: NewPost, primary: Lang, topics: TopicRules): Promise<number> {
  const { caption, tags } = cleanCaption(post.text);
  const data: Doc = {
    platform: post.platform,
    date: post.date,
    caption: localized(primary, caption),
    sourceId: post.sourceId,
  };
  if (post.url !== undefined) data.url = post.url;
  if (tags.length > 0) data.tags = tags;
  const topic = matchTopic(topics, caption, tags);
  if (topic !== undefined) data.topic = topic;
  if (post.note) data.importNote = post.note;

  const now = new Date();
  const res = await db.insert(entries).values({
    collection: "social",
    slug: socialSlug(post.platform, post.sourceId),
    visibility: "private",
    position: 0,
    data,
    createdAt: now,
    updatedAt: now,
  });
  return Number(res[0].insertId);
}

// Menyimpan gambar sebagai berkas milik data itu (fileId). Gagal diam-diam: postingan tetap ada.
export async function attachImage(id: number, buf: Buffer, name: string): Promise<boolean> {
  try {
    const meta = await saveUpload(buf, name, id, { imagesOnly: true });
    const rows = await db.select({ data: entries.data }).from(entries).where(and(eq(entries.id, id), eq(entries.collection, "social"))).limit(1);
    if (rows.length === 0) return false;
    await db.update(entries).set({ data: { ...(rows[0].data as Doc), fileId: meta.id }, updatedAt: new Date() }).where(eq(entries.id, id));
    return true;
  } catch {
    return false;
  }
}

async function attachRemoteImage(id: number, post: NewPost): Promise<boolean> {
  if (post.imageUrl === undefined) return false;
  const buf = await downloadImage(post.imageUrl);
  return buf === null ? false : attachImage(id, buf, `${post.platform}-${post.sourceId}.jpg`);
}

// Token Instagram diperpanjang otomatis paling sering sekali sehari.
async function freshToken(platform: AutoPlatform): Promise<string> {
  const found = await getConnection(platform);
  if (found === null) throw new MetaError("Akun belum terhubung, atau rahasia aplikasi di server berubah. Hubungkan ulang.", null);
  const { connection, token } = found;
  if (connection.expiresAt !== null) {
    if (Date.parse(connection.expiresAt) <= Date.now()) {
      throw new MetaError("Koneksi sudah kedaluwarsa. Klik Hubungkan ulang.", 190);
    }
  }
  if (platform !== "instagram") return token;
  if (Date.now() - Date.parse(connection.refreshedAt) < DAY_MS) return token;
  try {
    const grant = await instagramRefresh(token);
    await updateToken(platform, grant.token, grant.expiresAt);
    return grant.token;
  } catch (err) {
    if (err instanceof MetaError) {
      if (err.expired) throw err;
    }
    // Perpanjangan gagal sementara: token lama masih berlaku, coba lagi besok.
    return token;
  }
}

export async function syncPlatform(platform: AutoPlatform): Promise<SyncReport> {
  const report: SyncReport = { at: new Date().toISOString(), added: 0, skipped: 0, images: 0, more: false };
  if (!appConfig(platform).enabled) {
    return { ...report, error: "Aplikasi Meta untuk platform ini belum diatur di server." };
  }
  try {
    const token = await freshToken(platform);
    const known = await knownKeys();
    const primary = await primaryLang();
    const { topics, facebookAll } = await socialSettings();
    let next: string | null = null;
    for (let page = 0; page < MAX_PAGES; page++) {
      const result: { items: RemotePost[]; next: string | null } = await fetchPage(platform, token, next);
      for (const item of result.items) {
        if (known.has(key(platform, item.sourceId))) continue;
        if (!item.isPublic) {
          if (!facebookAll) {
            report.skipped++;
            continue;
          }
        }
        if (report.added >= MAX_NEW) {
          report.more = true;
          break;
        }
        const post: NewPost = {
          platform,
          sourceId: item.sourceId,
          url: item.url,
          text: item.text,
          date: partialDateFrom(item.timestamp),
          imageUrl: item.imageUrl,
        };
        const withImage = await attachRemoteImage(await insertPost(post, primary, topics), post);
        known.add(key(platform, item.sourceId));
        report.added++;
        if (withImage) report.images++;
      }
      if (report.more) break;
      next = result.next;
      if (next === null) break;
    }
  } catch (err) {
    report.error = err instanceof Error ? err.message : "Gagal menarik postingan.";
  }
  await recordSync(platform, report);
  return report;
}

// Impor Shares.csv dari ekspor data LinkedIn. Tidak ada gambar; unggah manual bila perlu.
export async function importLinkedin(rows: string[][]): Promise<{ added: number; existing: number; skipped: number }> {
  const { items, skipped } = parseLinkedinShares(rows);
  const known = await knownKeys();
  const primary = await primaryLang();
  const { topics } = await socialSettings();
  let added = 0;
  let existing = 0;
  for (const item of items) {
    if (known.has(key("linkedin", item.sourceId))) {
      existing++;
      continue;
    }
    await insertPost({ platform: "linkedin", sourceId: item.sourceId, url: item.url, text: item.text, date: item.date }, primary, topics);
    known.add(key("linkedin", item.sourceId));
    added++;
  }
  return { added, existing, skipped };
}
