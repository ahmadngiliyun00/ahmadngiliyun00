import type { Metadata } from "next";
import TeachingPage from "@/components/TeachingPage";
import { buildPageMetadata } from "@/lib/metadata";
import { seoSettings } from "@/server/seo";

// Konten dibaca dari database (dengan cache memori), jadi halaman dirender saat diminta.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("id", "teaching", await seoSettings());
}

export default function MengajarPage() {
  return <TeachingPage lang="id" />;
}
