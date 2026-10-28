import type { Metadata } from "next";
import JourneyPage from "@/components/JourneyPage";
import { buildPageMetadata } from "@/lib/metadata";
import { seoSettings } from "@/server/seo";

// Konten dibaca dari database (dengan cache memori), jadi halaman dirender saat diminta.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("id", "journey", await seoSettings());
}

export default function PerjalananPage() {
  return <JourneyPage lang="id" />;
}
