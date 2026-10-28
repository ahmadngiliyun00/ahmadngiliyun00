import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/instrument-sans";
import "@/app/globals.css";
import type { ReactNode } from "react";
import type { Lang } from "@/data/profile";

// Dipakai oleh dua root layout (Indonesia dan Inggris) supaya atribut
// lang pada <html> sesuai dengan bahasa halaman.
export default function RootShell({
  lang,
  children,
}: {
  lang: Lang;
  children: ReactNode;
}) {
  return (
    <html lang={lang}>
      <body>{children}</body>
    </html>
  );
}
