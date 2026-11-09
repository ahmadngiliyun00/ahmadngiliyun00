import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import DetailPage from "@/components/DetailPage";
import { isResearchKind } from "@/content/types";
import { SLUG_PATTERN } from "@/content/fields";
import type { Lang } from "@/data/profile";
import { detailPath, publicItems } from "@/lib/achievements";
import { buildDetailMetadata } from "@/lib/metadata";
import { loadSite } from "@/server/content";
import { getFileMeta } from "@/server/files";

// Halaman detail capaian public, dipakai empat rute: /sertifikat/<slug>/, /riset/<slug>/, dan
// padanan Inggrisnya. Keluaran riset (buku, hak cipta, publikasi, hibah, reviewer) tinggal di bawah
// Riset, yang lain di bawah arsip sertifikat. Alamat di induk yang salah, termasuk alamat lama
// /sertifikat/<slug>/ untuk buku dan hak cipta, dialihkan permanen ke alamat yang benar.
export type DetailSection = "certificates" | "research";

async function find(id: string) {
  if (!SLUG_PATTERN.test(id)) return undefined;
  const content = await loadSite();
  return publicItems(content.achievement).find((a) => a.id === id);
}

function inSection(kind: Parameters<typeof isResearchKind>[0], section: DetailSection): boolean {
  return isResearchKind(kind) ? section === "research" : section === "certificates";
}

export async function achievementDetailMetadata(lang: Lang, id: string, section: DetailSection): Promise<Metadata> {
  const item = await find(id);
  if (item === undefined) return {};
  // Alamat yang akan dialihkan tidak perlu metadata sendiri.
  return inSection(item.kind, section) ? buildDetailMetadata(lang, item) : {};
}

export default async function AchievementDetail({ lang, id, section }: { lang: Lang; id: string; section: DetailSection }) {
  const item = await find(id);
  if (item === undefined) notFound();
  if (!inSection(item.kind, section)) permanentRedirect(detailPath(lang, item));
  const content = await loadSite();
  const meta = item.fileId ? await getFileMeta(item.fileId) : undefined;
  return (
    <DetailPage
      lang={lang}
      item={item}
      file={meta ? { url: `/files/${meta.id}/`, mime: meta.mime } : undefined}
      researchProfiles={content.profile.researchProfiles}
    />
  );
}
