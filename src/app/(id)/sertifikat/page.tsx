import type { Metadata } from "next";
import ArchivePage from "@/components/ArchivePage";
import { buildArchiveMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildArchiveMetadata("id");

export default function SertifikatPage() {
  return <ArchivePage lang="id" />;
}
