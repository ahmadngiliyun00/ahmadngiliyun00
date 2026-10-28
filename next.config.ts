import type { NextConfig } from "next";

// Static export: hasilnya folder `out/` berisi HTML statis.
// Bisa di-host di Vercel, Cloudflare Pages, atau Nginx di VPS tanpa perubahan kode.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
