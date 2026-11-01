import type { Metadata } from "next";
import SocialPage from "@/components/SocialPage";
import { buildPageMetadata } from "@/lib/metadata";
import { seoSettings } from "@/server/seo";

// Konten dibaca dari database (dengan cache memori), jadi halaman dirender saat diminta.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("en", "social", await seoSettings());
}

export default function EnglishSocialPage() {
  return <SocialPage lang="en" />;
}
