import type { Metadata } from "next";
import NewsArchivePage from "@/components/NewsArchivePage";
import { buildNewsMetadata } from "@/lib/metadata";

// Konten dibaca dari database (dengan cache memori), jadi halaman dirender saat diminta.
export const dynamic = "force-dynamic";

export const metadata: Metadata = buildNewsMetadata("id");

export default function NewsPage() {
  return <NewsArchivePage lang="id" />;
}
