import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DetailPage from "@/components/DetailPage";
import { getPublicAchievement, publicAchievements } from "@/lib/achievements";
import { buildDetailMetadata } from "@/lib/metadata";

// Hanya item public yang dibuatkan halaman. Item draft tidak pernah dirender.
export const dynamicParams = false;

export function generateStaticParams() {
  return publicAchievements().map((a) => ({ id: a.id }));
}

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const item = getPublicAchievement(id);
  return item ? buildDetailMetadata("en", item) : {};
}

export default async function CertificateDetailPage({ params }: Props) {
  const { id } = await params;
  const item = getPublicAchievement(id);
  if (item === undefined) notFound();
  return <DetailPage lang="en" item={item} />;
}
