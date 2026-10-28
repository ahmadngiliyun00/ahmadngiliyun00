import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/instrument-sans";
import "@/app/globals.css";
import type { ReactNode } from "react";
import Toaster from "@/components/Toaster";
import type { Lang } from "@/data/profile";

const TOAST_LABELS: Record<Lang, { close: string; more: string }> = {
  id: { close: "Tutup notifikasi", more: "dan {n} lainnya" },
  en: { close: "Dismiss notification", more: "and {n} more" },
};

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
      <body>
        {children}
        <Toaster closeLabel={TOAST_LABELS[lang].close} moreLabel={TOAST_LABELS[lang].more} />
      </body>
    </html>
  );
}
