import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import RootShell from "@/components/RootShell";
import { adminCopy } from "@/data/admin";
import "./admin.css";

// Root layout CMS. Tidak diindeks mesin pencari.
export const metadata: Metadata = {
  title: adminCopy.meta.title,
  robots: { index: false, follow: false },
  icons: { icon: "/favicon.svg" },
};
export const viewport: Viewport = { themeColor: "#0A1633", colorScheme: "dark" };

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <RootShell lang="id">{children}</RootShell>;
}
