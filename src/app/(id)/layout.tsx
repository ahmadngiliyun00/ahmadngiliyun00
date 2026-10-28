import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import RootShell from "@/components/RootShell";
import { buildMetadata } from "@/lib/metadata";
import { siteVerification } from "@/server/seo";

export async function generateMetadata(): Promise<Metadata> {
  return { ...buildMetadata("id"), verification: await siteVerification() };
}

export const viewport: Viewport = { themeColor: "#0A1633", colorScheme: "dark" };

export default function IndonesianLayout({ children }: { children: ReactNode }) {
  return <RootShell lang="id">{children}</RootShell>;
}
