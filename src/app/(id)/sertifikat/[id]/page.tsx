import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DetailPage from "@/components/DetailPage";
import { SLUG_PATTERN } from "@/content/fields";
import { publicItems } from "@/lib/achievements";
import { buildDetailMetadata } from "@/lib/metadata";
import { loadSite } from "@/server/content";
import { getFileMeta } from "@/server/files";

// Dibaca dari database setiap permintaan (dengan cache memori di loadSite). Hanya item public.
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

async function find(id: string) {
  if (!SLUG_PATTERN.test(id)) return undefined;
  const content = await loadSite();
  return publicItems(content.achievement).find((a) => a.id === id);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = await find((await params).id);
  return item ? buildDetailMetadata("id", item) : {};
}

export default async function AchievementDetailPage({ params }: Props) {
  const item = await find((await params).id);
  if (item === undefined) notFound();
  const content = await loadSite();
  const meta = item.fileId ? await getFileMeta(item.fileId) : undefined;
  return (
    <DetailPage
      lang="id"
      item={item}
      file={meta ? { url: `/files/${meta.id}/`, mime: meta.mime } : undefined}
      researchProfiles={content.profile.researchProfiles}
    />
  );
}
