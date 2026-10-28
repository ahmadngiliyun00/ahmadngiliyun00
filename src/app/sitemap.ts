import type { MetadataRoute } from "next";
import type { Entry } from "@/content/types";
import { site } from "@/data/profile";
import { archivePath, detailPath } from "@/lib/achievements";
import { loadSite } from "@/server/content";

// Dibaca dari database saat diminta, jadi data yang baru dipublikasikan di CMS langsung masuk
// dan data yang disembunyikan langsung keluar. Hanya item public yang masuk sitemap; data privat,
// CMS, tautan berbagi, dan berkas unggahan diblokir di robots.ts.
// lastModified memakai waktu ubah data terakhir, bukan waktu sekarang, supaya Google
// hanya merayapi ulang halaman yang memang berubah.
export const dynamic = "force-dynamic";

function latest(list: Entry[]): Date | undefined {
  let max = 0;
  for (const e of list) max = Math.max(max, Date.parse(e.updatedAt));
  return max === 0 ? undefined : new Date(max);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await loadSite();
  const pair = (id: string, en: string, lastModified: Date | undefined) => {
    const languages = { id: `${site.url}${id}`, en: `${site.url}${en}` };
    return [
      { url: languages.id, lastModified, alternates: { languages } },
      { url: languages.en, lastModified, alternates: { languages } },
    ];
  };

  const achievements = content.achievement.filter((e) => e.visibility === "public");
  const everything = Object.values(content).filter(Array.isArray).flat() as Entry[];

  return [
    ...pair("/", "/en/", latest(everything)),
    ...pair(archivePath("id"), archivePath("en"), latest(achievements)),
    ...achievements.flatMap((e) =>
      pair(detailPath("id", e.slug), detailPath("en", e.slug), new Date(e.updatedAt)),
    ),
  ];
}
