import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DetailPage from "@/components/DetailPage";
import { site } from "@/data/profile";
import { toItem } from "@/lib/achievements";
import { loadSite } from "@/server/content";
import { findByShareToken } from "@/server/entries";
import { getFileMeta } from "@/server/files";

// Halaman tautan berbagi rahasia. Bisa menampilkan data privat, jadi tidak diindeks
// dan tidak mengirim Referer (token tidak bocor ke situs lain yang ditautkan).
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ token: string }> };

async function find(token: string) {
  const entry = await findByShareToken(token);
  if (entry === undefined) return undefined;
  if (entry.collection !== "achievement") return undefined;
  return toItem(entry as Parameters<typeof toItem>[0]);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = await find((await params).token);
  return {
    title: item ? `${item.title.en} - ${site.name}` : site.name,
    robots: { index: false, follow: false, nocache: true },
    referrer: "no-referrer",
  };
}

export default async function SharedPage({ params }: Props) {
  const { token } = await params;
  const item = await find(token);
  if (item === undefined) notFound();
  const content = await loadSite();
  const meta = item.fileId ? await getFileMeta(item.fileId) : undefined;
  return (
    <DetailPage
      lang="en"
      item={item}
      mode="shared"
      otherHref={`/s/${token}/`}
      file={meta ? { url: `/files/${meta.id}/?s=${encodeURIComponent(token)}`, mime: meta.mime } : undefined}
      researchProfiles={content.profile.researchProfiles}
    />
  );
}
