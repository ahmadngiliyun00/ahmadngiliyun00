import type { MetadataRoute } from "next";
import { site } from "@/data/profile";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = { id: `${site.url}/`, en: `${site.url}/en/` };
  const lastModified = new Date();

  return [
    { url: `${site.url}/`, lastModified, alternates: { languages } },
    { url: `${site.url}/en/`, lastModified, alternates: { languages } },
  ];
}
