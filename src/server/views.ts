import "server-only";
import { createHash } from "node:crypto";
import { and, count, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { postViews } from "@/db/schema";
import { deviceOf, wibDay } from "@/lib/views";

// Hitungan pembaca tulisan. Satu baris per pengunjung per tulisan per hari (WIB): muat ulang
// berkali-kali di hari yang sama tidak menambah hitungan. Pengunjung dikenali lewat hash harian
// dari IP dan user agent; IP aslinya tidak disimpan, dan hash berganti setiap hari sehingga
// pengunjung tidak bisa dilacak antarhari.

function salt(): string {
  return process.env.CONTACT_IP_SALT ?? "ngiliyun-views";
}

export async function recordView(input: { entryId: number; ip: string; userAgent: string; lang: "id" | "en"; source: string }) {
  const now = new Date();
  const day = wibDay(now);
  const visitor = createHash("sha256").update(`${salt()}|${day}|${input.ip}|${input.userAgent}`).digest("hex");
  await db
    .insert(postViews)
    .values({ entryId: input.entryId, visitor, day, source: input.source, device: deviceOf(input.userAgent), lang: input.lang, createdAt: now })
    .onDuplicateKeyUpdate({ set: { entryId: sql`entry_id` } });
}

export async function viewCount(entryId: number): Promise<number> {
  try {
    const rows = await db.select({ n: count() }).from(postViews).where(eq(postViews.entryId, entryId));
    return rows[0]?.n ?? 0;
  } catch {
    // Tabel belum dimigrasi: halaman tetap tampil tanpa angka.
    return 0;
  }
}

// Jumlah pembaca untuk banyak tulisan sekaligus (daftar CMS).
export async function viewCounts(entryIds: number[]): Promise<Map<number, number>> {
  const out = new Map<number, number>();
  if (entryIds.length === 0) return out;
  try {
    const rows = await db
      .select({ entryId: postViews.entryId, n: count() })
      .from(postViews)
      .where(inArray(postViews.entryId, entryIds))
      .groupBy(postViews.entryId);
    for (const r of rows) out.set(r.entryId, r.n);
  } catch {
    // Tabel belum dimigrasi.
  }
  return out;
}

export type ViewStats = {
  total: number;
  last7: number;
  last30: number;
  days: { day: string; n: number }[]; // 30 hari terakhir, termasuk hari tanpa pembaca
  sources: { name: string; n: number }[];
  devices: { mobile: number; desktop: number };
  langs: { id: number; en: number };
};

// Statistik satu tulisan untuk panel CMS.
export async function viewStats(entryId: number): Promise<ViewStats> {
  const today = new Date();
  const days: string[] = [];
  for (let i = 29; i >= 0; i -= 1) days.push(wibDay(new Date(today.getTime() - i * 86400000)));
  const since = days[0];
  const since7 = days[days.length - 7];
  const byEntry = eq(postViews.entryId, entryId);

  const [total, perDay, sources, devices, langs] = await Promise.all([
    db.select({ n: count() }).from(postViews).where(byEntry),
    db
      .select({ day: postViews.day, n: count() })
      .from(postViews)
      .where(and(byEntry, gte(postViews.day, since)))
      .groupBy(postViews.day),
    db
      .select({ name: postViews.source, n: count() })
      .from(postViews)
      .where(byEntry)
      .groupBy(postViews.source)
      .orderBy(desc(count()))
      .limit(8),
    db.select({ device: postViews.device, n: count() }).from(postViews).where(byEntry).groupBy(postViews.device),
    db.select({ lang: postViews.lang, n: count() }).from(postViews).where(byEntry).groupBy(postViews.lang),
  ]);

  const dayMap = new Map(perDay.map((r) => [r.day, r.n]));
  const series = days.map((day) => ({ day, n: dayMap.get(day) ?? 0 }));
  return {
    total: total[0]?.n ?? 0,
    last7: series.filter((d) => d.day >= since7).reduce((a, d) => a + d.n, 0),
    last30: series.reduce((a, d) => a + d.n, 0),
    days: series,
    sources,
    devices: {
      mobile: devices.find((d) => d.device === "mobile")?.n ?? 0,
      desktop: devices.find((d) => d.device === "desktop")?.n ?? 0,
    },
    langs: { id: langs.find((l) => l.lang === "id")?.n ?? 0, en: langs.find((l) => l.lang === "en")?.n ?? 0 },
  };
}
