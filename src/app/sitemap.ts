import type { MetadataRoute } from "next";
import type { Entry } from "@/content/types";
import { site } from "@/data/profile";
import { archivePath, detailPath } from "@/lib/achievements";
import { type PageKey, PAGE_KEYS, pagePath } from "@/lib/nav";
import { hasPage, postPath, postsPath, publicPosts } from "@/lib/posts";
import { SITEMAP_RULES, w3cDate } from "@/lib/sitemap";
import { loadSite } from "@/server/content";

// Dibaca dari database saat diminta, jadi data yang baru dipublikasikan di CMS langsung masuk
// dan data yang disembunyikan langsung keluar. Hanya item public yang masuk sitemap; data privat,
// CMS, tautan berbagi, dan berkas unggahan diblokir di robots.ts.
// lastModified memakai waktu ubah data terakhir, bukan waktu sekarang, supaya Google
// hanya merayapi ulang halaman yang memang berubah.
// Pasangan bahasa (hreflang) tidak ditulis di sini karena sudah ada di <head> setiap halaman
// (alternates.languages di src/lib/metadata.ts). Tanpa elemen xhtml:link, browser menampilkan
// sitemap sebagai pohon XML yang mudah dibaca, bukan teks yang menyambung.
// Format lastmod, changefreq, dan priority mengikuti src/lib/sitemap.ts.
export const dynamic = "force-dynamic";

function latest(list: Entry[]): Date | undefined {
  let max = 0;
  for (const e of list) max = Math.max(max, Date.parse(e.updatedAt));
  return max === 0 ? undefined : new Date(max);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await loadSite();
  type Rule = (typeof SITEMAP_RULES)[keyof typeof SITEMAP_RULES];
  const item = (path: string, date: Date | undefined, rule: Rule) => ({ url: `${site.url}${path}`, lastModified: w3cDate(date), ...rule });
  const pair = (id: string, en: string, date: Date | undefined, rule: Rule) => [item(id, date, rule), item(en, date, rule)];

  const achievements = content.achievement.filter((e) => e.visibility === "public");
  const everything = Object.values(content).filter(Array.isArray).flat() as Entry[];
  const posts = publicPosts(content.post);
  const news = content.post.filter((e) => e.visibility === "public");
  // Halaman tulisan hanya untuk bahasa yang punya isi lengkap; liputan tanpa isi menaut ke luar.
  // Halaman dalam memakai waktu ubah data yang tampil di dalamnya.
  const sources: Record<PageKey, Entry[]> = {
    projects: [...content.project, ...content.system, ...content.contribution, ...content.area],
    research: achievements.filter((e) => ["publikasi", "hibah", "reviewer"].includes(e.data.kind)),
    teaching: [...content.institution, ...content.course, ...content.term, ...content.focus],
    journey: [...content.milestone, ...content.plan, ...content.principle],
    social: content.social,
  };
  const innerPages = PAGE_KEYS.flatMap((page) => pair(pagePath("id", page), pagePath("en", page), latest(sources[page]), SITEMAP_RULES.inner));
  const postPages = posts.flatMap((p) =>
    (["id", "en"] as const)
      .filter((l) => hasPage(p, l))
      .map((l) => item(postPath(l, p.slug), new Date(p.updatedAt), SITEMAP_RULES.post)),
  );

  return [
    ...pair("/", "/en/", latest(everything), SITEMAP_RULES.home),
    ...innerPages,
    ...pair(archivePath("id"), archivePath("en"), latest(achievements), SITEMAP_RULES.archive),
    ...achievements.flatMap((e) =>
      pair(detailPath("id", e.slug), detailPath("en", e.slug), new Date(e.updatedAt), SITEMAP_RULES.detail),
    ),
    ...(news.length === 0 ? [] : pair(postsPath("id"), postsPath("en"), latest(news), SITEMAP_RULES.archive)),
    ...postPages,
  ];
}
