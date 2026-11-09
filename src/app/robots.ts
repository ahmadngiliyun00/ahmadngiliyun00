import type { MetadataRoute } from "next";
import { site } from "@/data/profile";

export const dynamic = "force-static";

// CMS dan tautan berbagi rahasia tidak untuk mesin pencari.
// /files/ sengaja TIDAK diblokir di sini. Berkas unggahan dijaga lewat header X-Robots-Tag noindex
// (src/app/files/[id]/route.ts), dan header itu hanya terbaca bila perayap boleh mengambil berkasnya.
// Bila /files/ diblokir: Google tetap mencatat alamatnya dari <img> dan <a> (laporan "Blocked by
// robots.txt"), bahkan bisa mengindeks alamatnya tanpa isi, halaman dirender tanpa gambar, dan
// perayap pratinjau tautan (LinkedIn, X) tidak bisa mengambil gambar og:image.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin/", "/api/", "/cron/", "/s/", "/en/s/"] },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
