import type { Metadata } from "next";
import ResearchPage from "@/components/ResearchPage";
import { buildPageMetadata } from "@/lib/metadata";
import { seoSettings } from "@/server/seo";

// Konten dibaca dari database (dengan cache memori), jadi halaman dirender saat diminta.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("id", "research", await seoSettings());
}

export default function RisetPage() {
  return <ResearchPage lang="id" />;
}
