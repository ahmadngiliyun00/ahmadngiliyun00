import type { Metadata } from "next";
import AchievementDetail, { achievementDetailMetadata } from "@/components/AchievementDetail";

// Detail capaian per kategori, misalnya /buku/<slug>/. Dibaca dari database setiap
// permintaan (dengan cache memori di loadSite). Hanya item public.
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ kind: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { kind, id } = await params;
  return achievementDetailMetadata("id", kind, id);
}

export default async function AchievementDetailPage({ params }: Props) {
  const { kind, id } = await params;
  return <AchievementDetail lang="id" kindSlug={kind} id={id} />;
}
