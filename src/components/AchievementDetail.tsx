import type { Metadata } from "next";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import DetailPage from "@/components/DetailPage";
import { kindFromSlug } from "@/content/types";
import { SLUG_PATTERN } from "@/content/fields";
import type { Lang } from "@/data/profile";
import { detailPath, kindIndexPath, publicItems } from "@/lib/achievements";
import { buildDetailMetadata } from "@/lib/metadata";
import { loadSite } from "@/server/content";
import { getFileMeta } from "@/server/files";

// Halaman detail capaian public di /<kategori>/<slug>/ (Inggris /en/<category>/<slug>/), misalnya
// /buku/<slug>/ atau /hak-cipta/<slug>/. Segmen kategori dari KIND_SLUGS (src/content/types.ts).
// Alamat dengan kategori yang tidak cocok dengan datanya, termasuk alamat lama /sertifikat/<slug>/
// untuk buku atau hak cipta, dialihkan permanen ke alamat yang benar.

async function find(id: string) {
  if (!SLUG_PATTERN.test(id)) return undefined;
  const content = await loadSite();
  return publicItems(content.achievement).find((a) => a.id === id);
}

export async function achievementDetailMetadata(lang: Lang, kindSlug: string, id: string): Promise<Metadata> {
  const kind = kindFromSlug(lang, kindSlug);
  if (kind === undefined) return {};
  const item = await find(id);
  if (item === undefined) return {};
  // Alamat yang akan dialihkan tidak perlu metadata sendiri.
  return item.kind === kind ? buildDetailMetadata(lang, item) : {};
}

export default async function AchievementDetail({ lang, kindSlug, id }: { lang: Lang; kindSlug: string; id: string }) {
  const kind = kindFromSlug(lang, kindSlug);
  if (kind === undefined) notFound();
  const item = await find(id);
  if (item === undefined) notFound();
  if (item.kind !== kind) permanentRedirect(detailPath(lang, item));
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

// Alamat kategori tanpa slug, misalnya /buku/. Tidak punya halaman sendiri; dialihkan sementara ke
// bagian yang memuat kategori itu. Segmen lain yang tidak dikenal tetap 404.
export function KindIndex({ lang, kindSlug }: { lang: Lang; kindSlug: string }): never {
  const kind = kindFromSlug(lang, kindSlug);
  if (kind === undefined) notFound();
  redirect(kindIndexPath(lang, kind));
}
