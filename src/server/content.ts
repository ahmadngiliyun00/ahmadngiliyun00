import "server-only";
import { and, asc, eq } from "drizzle-orm";
import type { Doc } from "@/content/fields";
import type {
  CollectionData,
  CollectionKey,
  Entry,
  MetricsSettings,
  ProfileSettings,
  SeoSettings,
  Visibility,
} from "@/content/types";
import { db } from "@/db";
import { entries, settings } from "@/db/schema";

// Lapisan baca konten. Situs publik memakai loadSite(), yang menyimpan salinan semua konten
// public di memori dan dibuang setiap kali CMS menyimpan perubahan (invalidateSite).
// Proses Next.js dijalankan satu instans (PM2 fork), jadi cache memori ini selalu konsisten.

type Row = typeof entries.$inferSelect;

function toIso(d: Date | string): string {
  return d instanceof Date ? d.toISOString() : new Date(d).toISOString();
}

export function rowToEntry<K extends CollectionKey>(row: Row): Entry<K> {
  return {
    id: row.id,
    collection: row.collection as K,
    slug: row.slug,
    visibility: row.visibility as Visibility,
    position: row.position,
    data: row.data as CollectionData[K],
    shared: row.shareHash !== null,
    updatedAt: toIso(row.updatedAt),
  };
}

export async function listEntries<K extends CollectionKey>(
  collection: K,
  opts: { publicOnly: boolean },
): Promise<Entry<K>[]> {
  const where = opts.publicOnly
    ? and(eq(entries.collection, collection), eq(entries.visibility, "public"))
    : eq(entries.collection, collection);
  const rows = await db.select().from(entries).where(where).orderBy(asc(entries.position), asc(entries.id));
  return rows.map((r) => rowToEntry<K>(r));
}

export async function getEntryById(id: number): Promise<Entry | undefined> {
  const rows = await db.select().from(entries).where(eq(entries.id, id)).limit(1);
  return rows[0] ? rowToEntry(rows[0]) : undefined;
}

export async function getSetting<T>(key: string): Promise<T | undefined> {
  const rows = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
  return rows[0] ? (rows[0].value as T) : undefined;
}

export async function getSettingDoc(key: string): Promise<Doc> {
  return (await getSetting<Doc>(key)) ?? {};
}

// ---------- Snapshot situs publik ----------

export type SiteContent = {
  profile: ProfileSettings;
  metrics: MetricsSettings;
  seo: SeoSettings;
  achievement: Entry<"achievement">[];
  project: Entry<"project">[];
  system: Entry<"system">[];
  institution: Entry<"institution">[];
  course: Entry<"course">[];
  term: Entry<"term">[];
  focus: Entry<"focus">[];
  milestone: Entry<"milestone">[];
  area: Entry<"area">[];
  contribution: Entry<"contribution">[];
  collab: Entry<"collab">[];
  channel: Entry<"channel">[];
  plan: Entry<"plan">[];
  principle: Entry<"principle">[];
};

const TTL_MS = 5 * 60 * 1000;
const globalCache = globalThis as unknown as { siteCache?: { at: number; value: Promise<SiteContent> } };

async function fetchSite(): Promise<SiteContent> {
  const rows = await db
    .select()
    .from(entries)
    .where(eq(entries.visibility, "public"))
    .orderBy(asc(entries.position), asc(entries.id));
  const pick = <K extends CollectionKey>(k: K) => rows.filter((r) => r.collection === k).map((r) => rowToEntry<K>(r));
  const [profile, metrics, seo] = await Promise.all([
    getSetting<ProfileSettings>("profile"),
    getSetting<MetricsSettings>("metrics"),
    getSetting<SeoSettings>("seo"),
  ]);
  if (profile === undefined || metrics === undefined) {
    throw new Error("Pengaturan profil atau metrik belum ada. Jalankan npm run db:seed.");
  }
  return {
    profile,
    metrics,
    seo: seo ?? {},
    achievement: pick("achievement"),
    project: pick("project"),
    system: pick("system"),
    institution: pick("institution"),
    course: pick("course"),
    term: pick("term"),
    focus: pick("focus"),
    milestone: pick("milestone"),
    area: pick("area"),
    contribution: pick("contribution"),
    collab: pick("collab"),
    channel: pick("channel"),
    plan: pick("plan"),
    principle: pick("principle"),
  };
}

export function loadSite(): Promise<SiteContent> {
  const hit = globalCache.siteCache;
  if (hit) {
    if (Date.now() - hit.at < TTL_MS) return hit.value;
  }
  const value = fetchSite();
  globalCache.siteCache = { at: Date.now(), value };
  // Jangan simpan kegagalan di cache.
  value.catch(() => {
    if (globalCache.siteCache?.value === value) globalCache.siteCache = undefined;
  });
  return value;
}

export function invalidateSite() {
  globalCache.siteCache = undefined;
}
