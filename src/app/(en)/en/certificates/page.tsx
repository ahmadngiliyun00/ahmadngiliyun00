import type { Metadata } from "next";
import ArchivePage from "@/components/ArchivePage";
import { buildArchiveMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildArchiveMetadata("en");

export default function CertificatesPage() {
  return <ArchivePage lang="en" />;
}
