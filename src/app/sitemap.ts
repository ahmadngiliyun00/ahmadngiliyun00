import type { MetadataRoute } from "next";
import { site } from "@/data/profile";
import { archivePath, detailPath, publicItems } from "@/lib/achievements";
import { loadSite } from "@/server/content";

// Dibaca dari database saat diminta. Hanya item public yang masuk sitemap.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await loadSite();
  const lastModified = new Date();
  const pair = (id: string, en: string) => {
    const languages = { id: `${site.url}${id}`, en: `${site.url}${en}` };
    return [
      { url: languages.id, lastModified, alternates: { languages } },
      { url: languages.en, lastModified, alternates: { languages } },
    ];
  };

  return [
    ...pair("/", "/en/"),
    ...pair(archivePath("id"), archivePath("en")),
    ...publicItems(content.achievement).flatMap((a) => pair(detailPath("id", a.id), detailPath("en", a.id))),
  ];
}
