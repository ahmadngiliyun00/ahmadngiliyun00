import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import RootShell from "@/components/RootShell";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata("en");
export const viewport: Viewport = { themeColor: "#0A1633", colorScheme: "dark" };

export default function EnglishLayout({ children }: { children: ReactNode }) {
  return <RootShell lang="en">{children}</RootShell>;
}
