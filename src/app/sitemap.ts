import type { MetadataRoute } from "next";
import type { Entry } from "@/content/types";
import { site } from "@/data/profile";
import { archivePath, detailPath } from "@/lib/achievements";
import { hasPage, postPath, postsPath, publicPosts } from "@/lib/posts";
import { loadSite } from "@/server/content";

// Dibaca dari database saat diminta, jadi data yang baru dipublikasikan di CMS langsung masuk
// dan data yang disembunyikan langsung keluar. Hanya item public yang masuk sitemap; data privat,
// CMS, tautan berbagi, dan berkas unggahan diblokir di robots.ts.
// lastModified memakai waktu ubah data terakhir, bukan waktu sekarang, supaya Google
// hanya merayapi ulang halaman yang memang berubah.
// Pasangan bahasa (hreflang) tidak ditulis di sini karena sudah ada di <head> setiap halaman
// (alternates.languages di src/lib/metadata.ts). Tanpa elemen xhtml:link, browser menampilkan
// sitemap sebagai pohon XML yang mudah dibaca, bukan teks yang menyambung.
export const dynamic = "force-dynamic";

function latest(list: Entry[]): Date | undefined {
  let max = 0;
  for (const e of list) max = Math.max(max, Date.parse(e.updatedAt));
  return max === 0 ? undefined : new Date(max);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await loadSite();
  const pair = (id: string, en: string, lastModified: Date | undefined) => [
    { url: `${site.url}${id}`, lastModified },
    { url: `${site.url}${en}`, lastModified },
  ];

  const achievements = content.achievement.filter((e) => e.visibility === "public");
  const everything = Object.values(content).filter(Array.isArray).flat() as Entry[];
  const posts = publicPosts(content.post);
  const news = content.post.filter((e) => e.visibility === "public");
  // Halaman tulisan hanya untuk bahasa yang punya isi lengkap; liputan tanpa isi menaut ke luar.
  const postPages = posts.flatMap((p) =>
    (["id", "en"] as const)
      .filter((l) => hasPage(p, l))
      .map((l) => ({ url: `${site.url}${postPath(l, p.slug)}`, lastModified: new Date(p.updatedAt) })),
  );

  return [
    ...pair("/", "/en/", latest(everything)),
    ...pair(archivePath("id"), archivePath("en"), latest(achievements)),
    ...achievements.flatMap((e) =>
      pair(detailPath("id", e.slug), detailPath("en", e.slug), new Date(e.updatedAt)),
    ),
    ...(news.length === 0 ? [] : pair(postsPath("id"), postsPath("en"), latest(news))),
    ...postPages,
  ];
}
