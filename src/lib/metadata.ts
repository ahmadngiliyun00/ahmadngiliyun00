import type { Metadata } from "next";
import type { SeoSettings } from "@/content/types";
import { copy, site, type Lang } from "@/data/profile";
import { type AchievementItem, archivePath, detailPath, formatPartialDate, kindName } from "@/lib/achievements";
import { type PostItem, hasPage, isoPartialDate, postPath, postsPath } from "@/lib/posts";

export type SeoPage = "home" | "archive";

// Judul dan deskripsi yang dipakai halaman: isian CMS bila ada, kalau tidak teks bawaan di profile.ts.
// Juga dipakai pratinjau hasil Google di CMS.
export function defaultPageText(lang: Lang, page: SeoPage): { title: string; description: string } {
  const t = copy[lang];
  return page === "home"
    ? { title: t.meta.title, description: t.meta.description }
    : { title: t.archive.metaTitle, description: t.archive.metaDescription };
}

export function pageText(lang: Lang, page: SeoPage, seo: SeoSettings) {
  const fallback = defaultPageText(lang, page);
  const own = seo[page];
  const keywords = seo.keywords?.[lang] ?? [];
  return {
    title: own?.title?.[lang] || fallback.title,
    description: own?.description?.[lang] || fallback.description,
    keywords: keywords.length > 0 ? keywords : undefined,
  };
}

function pageMetadata(lang: Lang, page: SeoPage, seo: SeoSettings, path: string, languages: Record<string, string>): Metadata {
  const { title, description, keywords } = pageText(lang, page, seo);
  return {
    metadataBase: new URL(site.url),
    title,
    description,
    keywords,
    authors: [{ name: site.fullName, url: site.url }],
    alternates: { canonical: path, languages },
    openGraph: {
      title,
      description,
      url: path,
      siteName: site.name,
      locale: lang === "id" ? "id_ID" : "en_US",
      type: "website",
    },
    twitter: { card: "summary", title, description },
    icons: { icon: "/favicon.svg" },
  };
}

export function buildMetadata(lang: Lang, seo: SeoSettings = {}): Metadata {
  const path = lang === "id" ? "/" : "/en/";
  return pageMetadata(lang, "home", seo, path, { id: "/", en: "/en/", "x-default": "/" });
}

export function buildArchiveMetadata(lang: Lang, seo: SeoSettings = {}): Metadata {
  return pageMetadata(lang, "archive", seo, archivePath(lang), {
    id: archivePath("id"),
    en: archivePath("en"),
    "x-default": archivePath("id"),
  });
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

export function buildNewsMetadata(lang: Lang): Metadata {
  const t = copy[lang].news;
  return {
    metadataBase: new URL(site.url),
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: {
      canonical: postsPath(lang),
      languages: { id: postsPath("id"), en: postsPath("en"), "x-default": postsPath("id") },
    },
    openGraph: {
      title: t.metaTitle,
      description: t.metaDescription,
      url: postsPath(lang),
      siteName: site.name,
      locale: lang === "id" ? "id_ID" : "en_US",
      type: "website",
    },
    icons: { icon: "/favicon.svg" },
  };
}

export function buildPostMetadata(lang: Lang, post: PostItem): Metadata {
  const title = `${post.title[lang]} - ${site.name}`;
  const description = post.summary ? post.summary[lang] : copy[lang].news.metaDescription;
  const path = postPath(lang, post.slug);
  // Pasangan bahasa hanya dicantumkan bila versi bahasa itu punya isi lengkap.
  const languages: Record<string, string> = {};
  for (const l of ["id", "en"] as const) {
    if (hasPage(post, l)) languages[l] = postPath(l, post.slug);
  }
  return {
    metadataBase: new URL(site.url),
    title,
    description,
    alternates: { canonical: path, languages },
    openGraph: {
      title,
      description,
      url: path,
      siteName: site.name,
      locale: lang === "id" ? "id_ID" : "en_US",
      type: "article",
      publishedTime: post.date ? isoPartialDate(post.date) : undefined,
    },
    twitter: { card: "summary", title, description },
    icons: { icon: "/favicon.svg" },
  };
}
