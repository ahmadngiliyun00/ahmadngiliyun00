import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import RootShell from "@/components/RootShell";
import { buildMetadata } from "@/lib/metadata";
import { seoSettings, siteVerification } from "@/server/seo";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await seoSettings();
  return { ...buildMetadata("en", seo), verification: siteVerification(seo) };
}

export const viewport: Viewport = { themeColor: "#0A1633", colorScheme: "dark" };

export default function EnglishLayout({ children }: { children: ReactNode }) {
  return <RootShell lang="en">{children}</RootShell>;
}
