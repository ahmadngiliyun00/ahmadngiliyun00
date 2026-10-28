import type { MetadataRoute } from "next";
import { site } from "@/data/profile";

export const dynamic = "force-static";

// CMS, tautan berbagi rahasia, dan berkas unggahan tidak untuk mesin pencari.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin/", "/api/", "/s/", "/en/s/", "/files/"] },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
