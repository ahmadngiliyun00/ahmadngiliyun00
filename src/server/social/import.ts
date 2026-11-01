import "server-only";
import { and, eq } from "drizzle-orm";
import type { Doc } from "@/content/fields";
import type { SocialPlatform } from "@/content/types";
import { db } from "@/db";
import { entries } from "@/db/schema";
import { cleanCaption, partialDateFrom } from "@/lib/social";
import { coverImage, type ExportMedia, type ExportPlatform, type ExportPost } from "@/lib/social-export";
import { primaryLang } from "@/server/content";
import { MAX_UPLOAD_BYTES } from "@/server/files";
import { attachImage, insertPost, key, knownKeys, socialSettings } from "@/server/social/sync";

// Impor postingan dari berkas ekspor Instagram dan Facebook. ZIP dibaca di peramban
// (src/lib/zip-reader.ts dan src/lib/social-export.ts); server hanya menerima daftar postingan
// (teks, waktu, ID) lalu gambar sampul satu per satu, jadi tidak ada permintaan yang melewati
// batas Server Action 6 MB dan Nginx 8 MB. Pemanggil WAJIB sudah memanggil requireAdmin().

const MAX_POSTS = 3000;
const MAX_TEXT = 20000;
const SOURCE_ID = /^[A-Za-z0-9_-]{1,80}$/;
// Batas waktu yang masuk akal: Facebook berdiri 2004, dan tidak ada postingan dari masa depan.
const MIN_TS = Date.UTC(2004, 0, 1) / 1000;

export type ImportPayload = { platform: ExportPlatform; posts: ExportPost[] };

const isObj = (v: unknown): v is Record<string, unknown> => (v === null ? false : typeof v === "object" ? !Array.isArray(v) : false);

// Memeriksa muatan dari peramban. Server tidak mempercayai hasil parser di sisi klien begitu saja.
export function validatePayload(raw: unknown): ImportPayload {
  if (!isObj(raw)) throw new Error("Data impor tidak sah.");
  const platform = raw.platform;
  if (platform !== "instagram") {
    if (platform !== "facebook") throw new Error("Platform impor tidak dikenal.");
  }
  if (!Array.isArray(raw.posts)) throw new Error("Data impor tidak sah.");
  if (raw.posts.length > MAX_POSTS) throw new Error(`Maksimal ${MAX_POSTS} postingan per impor.`);
  const maxTs = Date.now() / 1000 + 24 * 60 * 60;
  const posts: ExportPost[] = raw.posts.map((p, i) => {
    const bad = () => new Error(`Data postingan ke-${i + 1} tidak sah.`);
    if (!isObj(p)) throw bad();
    const { sourceId, timestamp, text } = p;
    if (typeof sourceId !== "string" || !SOURCE_ID.test(sourceId)) throw bad();
    if (typeof timestamp !== "number" || !Number.isInteger(timestamp) || timestamp < MIN_TS || timestamp > maxTs) throw bad();
    if (typeof text !== "string" || text.length > MAX_TEXT) throw bad();
    const media: ExportMedia[] = (Array.isArray(p.media) ? p.media : []).slice(0, 50).map((m) => {
      if (!isObj(m) || typeof m.path !== "string" || m.path.length > 300) throw bad();
      if (m.kind !== "image") {
        if (m.kind !== "video") throw bad();
      }
      return { path: m.path, kind: m.kind };
    });
    const notes = (Array.isArray(p.notes) ? p.notes : []).filter((n): n is string => typeof n === "string").slice(0, 8).map((n) => n.slice(0, 400));
    return { sourceId, timestamp, text, media, notes };
  });
  return { platform: platform as ExportPlatform, posts };
}

export type PendingImage = { id: number; sourceId: string; path: string };
export type ImportReport = { added: number; existing: number; ignored: number; images: PendingImage[] };

function captionKey(text: string): string {
  return cleanCaption(text).caption.toLowerCase().replace(/\s+/g, " ").slice(0, 80);
}

export async function importExportPosts(payload: ImportPayload): Promise<ImportReport> {
  const { platform, posts } = payload;
  const known = await knownKeys();
  const primary = await primaryLang();
  const { topics } = await socialSettings();
  const rows = await db
    .select({ id: entries.id, visibility: entries.visibility, data: entries.data })
    .from(entries)
    .where(eq(entries.collection, "social"));
  const all = rows.map((r) => ({ ...r, data: r.data as Doc }));
  const mine = new Map(all.filter((r) => r.data.platform === platform).map((r) => [String(r.data.sourceId ?? ""), r]));
  // Postingan yang dibagikan silang (Instagram ke Facebook) diberi catatan supaya tidak dobel di situs.
  const other: SocialPlatform = platform === "instagram" ? "facebook" : "instagram";
  const twins = new Map<string, string>();
  for (const r of all) {
    if (r.data.platform !== other) continue;
    const caption = (r.data.caption ?? {}) as Record<string, string>;
    const text = (caption.id || caption.en || "").toLowerCase().replace(/\s+/g, " ").slice(0, 80);
    if (text.length >= 20) twins.set(text, r.data.date ? JSON.stringify(r.data.date) : "");
  }

  const report: ImportReport = { added: 0, existing: 0, ignored: 0, images: [] };
  for (const post of posts) {
    const cover = coverImage(post);
    const k = key(platform, post.sourceId);
    const found = mine.get(post.sourceId);
    if (found) {
      report.existing++;
      // Impor ulang melengkapi gambar yang belum tersalin, hanya untuk data yang masih privat.
      if (cover) {
        if (found.visibility === "private") {
          if (typeof found.data.fileId !== "string") report.images.push({ id: found.id, sourceId: post.sourceId, path: cover.path });
        }
      }
      continue;
    }
    if (known.has(k)) {
      report.ignored++;
      continue;
    }
    const notes = [...post.notes];
    if (twins.has(captionKey(post.text))) {
      notes.push(`Teksnya sama dengan postingan ${other === "instagram" ? "Instagram" : "Facebook"} yang sudah ada; cukup jadikan public salah satunya.`);
    }
    const id = await insertPost(
      {
        platform,
        sourceId: post.sourceId,
        text: post.text,
        date: partialDateFrom(new Date(post.timestamp * 1000).toISOString()),
        note: notes.join("\n"),
      },
      primary,
      topics,
    );
    known.add(k);
    report.added++;
    if (cover) report.images.push({ id, sourceId: post.sourceId, path: cover.path });
  }
  return report;
}

// Satu gambar sampul dari peramban. Hanya untuk data social privat milik sourceId itu yang belum
// punya gambar, jadi tidak bisa dipakai menimpa gambar data lain atau data yang sudah public.
export async function attachExportImage(id: number, sourceId: string, file: File): Promise<string | null> {
  if (file.size === 0) return "Gambar kosong.";
  if (file.size > MAX_UPLOAD_BYTES) return "Gambar melebihi 5 MB.";
  const rows = await db
    .select({ visibility: entries.visibility, data: entries.data })
    .from(entries)
    .where(and(eq(entries.id, id), eq(entries.collection, "social")))
    .limit(1);
  const row = rows[0];
  if (row === undefined) return "Postingan tidak ditemukan.";
  const data = row.data as Doc;
  if (data.sourceId !== sourceId) return "Postingan tidak cocok.";
  if (row.visibility !== "private") return "Postingan sudah public; unggah gambar lewat formulir.";
  if (typeof data.fileId === "string") return null;
  const ok = await attachImage(id, Buffer.from(await file.arrayBuffer()), file.name.slice(0, 120));
  return ok ? null : "Gambar ditolak. Hanya PNG, JPG, atau WebP.";
}
