import type { Metadata } from "next";
import { copy, site, type Lang } from "@/data/profile";
import { type AchievementItem, archivePath, detailPath, formatPartialDate, kindName } from "@/lib/achievements";

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

export function buildArchiveMetadata(lang: Lang): Metadata {
  const t = copy[lang].archive;
  const path = archivePath(lang);

  return {
    metadataBase: new URL(site.url),
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: {
      canonical: path,
      languages: { id: archivePath("id"), en: archivePath("en"), "x-default": archivePath("id") },
    },
    openGraph: {
      title: t.metaTitle,
      description: t.metaDescription,
      url: path,
      siteName: site.name,
      locale: lang === "id" ? "id_ID" : "en_US",
      type: "website",
    },
    icons: { icon: "/favicon.svg" },
  };
}

export function buildDetailMetadata(lang: Lang, item: AchievementItem): Metadata {
  const title = `${item.title[lang]} - ${site.name}`;
  const when = item.issued ? `, ${formatPartialDate(item.issued, lang)}` : "";
  const fallback = `${kindName(item.kind, lang)}, ${item.issuer}${when}.`;
  const description = item.summary ? item.summary[lang] : fallback;
  const path = detailPath(lang, item.id);

  return {
    metadataBase: new URL(site.url),
    title,
    description,
    alternates: {
      canonical: path,
      languages: {
        id: detailPath("id", item.id),
        en: detailPath("en", item.id),
        "x-default": detailPath("id", item.id),
      },
    },
    openGraph: {
      title,
      description,
      url: path,
      siteName: site.name,
      locale: lang === "id" ? "id_ID" : "en_US",
      type: "article",
    },
    icons: { icon: "/favicon.svg" },
  };
}
