import type { Metadata } from "next";
import ProjectsPage from "@/components/ProjectsPage";
import { buildPageMetadata } from "@/lib/metadata";
import { seoSettings } from "@/server/seo";

// Konten dibaca dari database (dengan cache memori), jadi halaman dirender saat diminta.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("en", "projects", await seoSettings());
}

export default function EnglishProjectsPage() {
  return <ProjectsPage lang="en" />;
}
