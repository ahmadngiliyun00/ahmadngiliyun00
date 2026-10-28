import type { MetadataRoute } from "next";
import { site } from "@/data/profile";
import { archivePath, detailPath, publicAchievements } from "@/lib/achievements";

export const dynamic = "force-static";

// Hanya item public yang masuk sitemap.
export default function sitemap(): MetadataRoute.Sitemap {
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
    ...publicAchievements().flatMap((a) => pair(detailPath("id", a.id), detailPath("en", a.id))),
  ];
}
