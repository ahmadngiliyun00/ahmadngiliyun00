import type { Metadata } from "next";
import AchievementDetail, { achievementDetailMetadata } from "@/components/AchievementDetail";

// Dibaca dari database setiap permintaan (dengan cache memori di loadSite). Hanya item public.
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return achievementDetailMetadata("en", (await params).id, "research");
}

export default async function ResearchDetailPage({ params }: Props) {
  return <AchievementDetail lang="en" id={(await params).id} section="research" />;
}
