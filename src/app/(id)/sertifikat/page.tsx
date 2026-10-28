import type { Metadata } from "next";
import ArchivePage from "@/components/ArchivePage";
import { buildArchiveMetadata } from "@/lib/metadata";
import { seoSettings } from "@/server/seo";

// Konten dibaca dari database (dengan cache memori), jadi halaman dirender saat diminta.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildArchiveMetadata("id", await seoSettings());
}

export default function SertifikatPage() {
  return <ArchivePage lang="id" />;
}
