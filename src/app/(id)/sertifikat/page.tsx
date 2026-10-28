import type { Metadata } from "next";
import ArchivePage from "@/components/ArchivePage";
import { buildArchiveMetadata } from "@/lib/metadata";

// Konten dibaca dari database (dengan cache memori), jadi halaman dirender saat diminta.
export const dynamic = "force-dynamic";

export const metadata: Metadata = buildArchiveMetadata("id");

export default function SertifikatPage() {
  return <ArchivePage lang="id" />;
}
