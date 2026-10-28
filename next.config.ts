import type { NextConfig } from "next";

// Situs dan CMS berjalan sebagai server Node.js (next start), konten dibaca dari MySQL.
// Deploy: lihat docs/DEPLOY.md (VPS aaPanel, PM2, Nginx).
const nextConfig: NextConfig = {
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  poweredByHeader: false,
  serverExternalPackages: ["mysql2"],
  // Berkas verifikasi Google Search Console (metode File HTML), isinya diatur lewat CMS.
  async rewrites() {
    return [{ source: "/:file(google[a-z0-9]+\\.html)", destination: "/site-verification/:file" }];
  },
  experimental: {
    // Unggah berkas sertifikat lewat Server Action, maksimal 5 MB per berkas.
    serverActions: { bodySizeLimit: "6mb" },
  },
};

export default nextConfig;
