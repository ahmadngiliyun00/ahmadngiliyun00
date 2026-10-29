import type { NextConfig } from "next";

// Situs dan CMS berjalan sebagai server Node.js (next start), konten dibaca dari MySQL.
// Deploy: lihat docs/DEPLOY.md (VPS aaPanel, PM2, Nginx).

const dev = process.env.NODE_ENV !== "production";
// Upgrade ke https dan HSTS hanya bila situs memang disajikan lewat https (SITE_URL).
const https = (process.env.SITE_URL ?? "").startsWith("https://");

// Content Security Policy. Skrip pihak ketiga hanya Google Analytics (bila diisi di CMS) dan
// Cloudflare Turnstile (bila kuncinya diatur). Pratinjau sertifikat dari Google Drive disematkan
// sebagai iframe, jadi drive.google.com masuk frame-src. 'unsafe-inline' masih dibutuhkan untuk skrip
// inline Next.js; nonce memaksa semua halaman dirender dinamis. Mode dev butuh eval dan websocket.
const GA = "https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com";
const TURNSTILE = "https://challenges.cloudflare.com";
const DRIVE = "https://drive.google.com";
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com ${TURNSTILE}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${GA}`,
  "font-src 'self' data:",
  `connect-src 'self' ${GA} ${TURNSTILE}${dev ? " ws: wss:" : ""}`,
  `frame-src 'self' ${TURNSTILE} ${DRIVE}`,
  // Pratinjau PDF sertifikat memakai <object> dari /files/.
  "object-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(https ? ["upgrade-insecure-requests"] : []),
].join("; ");

const common = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ...(https ? [{ key: "Strict-Transport-Security", value: "max-age=31536000" }] : []),
];

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
  async headers() {
    return [
      // Semua halaman, termasuk CMS: tidak boleh dibingkai situs lain (clickjacking).
      {
        source: "/((?!files/).*)",
        headers: [...common, { key: "Content-Security-Policy", value: csp }, { key: "X-Frame-Options", value: "DENY" }],
      },
      // Berkas unggahan boleh dibingkai halaman situs sendiri (pratinjau PDF), tidak oleh situs lain.
      {
        source: "/files/:path*",
        headers: [
          ...common,
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
  experimental: {
    // Unggah berkas sertifikat lewat Server Action, maksimal 5 MB per berkas.
    serverActions: { bodySizeLimit: "6mb" },
  },
};

export default nextConfig;
