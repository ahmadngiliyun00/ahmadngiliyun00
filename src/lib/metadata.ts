import type { Metadata } from "next";
import { copy, site, type Lang } from "@/data/profile";

export function buildMetadata(lang: Lang): Metadata {
  const t = copy[lang].meta;
  const path = lang === "id" ? "/" : "/en/";

  return {
    metadataBase: new URL(site.url),
    title: t.title,
    description: t.description,
    alternates: {
      canonical: path,
      languages: { id: "/", en: "/en/", "x-default": "/" },
    },
    openGraph: {
      title: t.title,
      description: t.description,
      url: path,
      siteName: site.name,
      locale: lang === "id" ? "id_ID" : "en_US",
      type: "website",
    },
    icons: { icon: "/favicon.svg" },
  };
}
