import "server-only";
import type { SocialPlatform } from "@/content/types";

// Kredensial aplikasi Meta dari variabel lingkungan (bukan database), seperti login GitHub.
// Instagram memakai "Instagram API with Instagram Login" (akun Creator atau Business, tanpa
// Halaman Facebook). Facebook memakai Facebook Login untuk profil pribadi (izin user_posts).
// Keduanya bisa berasal dari satu aplikasi Meta: ID dan rahasia Instagram tertera terpisah di
// dasbor, menu Instagram, API setup with Instagram login.

export type AutoPlatform = Extract<SocialPlatform, "instagram" | "facebook">;
export const AUTO_PLATFORMS: AutoPlatform[] = ["instagram", "facebook"];

export const STATE_COOKIE = "ngp_social_state";

function siteUrl(): string {
  return (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
}

// Versi Graph API. Meta menjaga satu versi sekitar dua tahun; naikkan lewat META_GRAPH_VERSION.
export function graphVersion(): string {
  const v = (process.env.META_GRAPH_VERSION ?? "").trim();
  return /^v\d+\.\d+$/.test(v) ? v : "v24.0";
}

export type AppConfig = { enabled: boolean; appId: string; appSecret: string; callback: string };

export function appConfig(platform: AutoPlatform): AppConfig {
  const prefix = platform === "instagram" ? "INSTAGRAM" : "FACEBOOK";
  const appId = (process.env[`${prefix}_APP_ID`] ?? "").trim();
  const appSecret = (process.env[`${prefix}_APP_SECRET`] ?? "").trim();
  return {
    enabled: appId !== "" ? appSecret !== "" : false,
    appId,
    appSecret,
    callback: `${siteUrl()}/admin/auth/${platform}/callback/`,
  };
}

export function isAutoPlatform(value: unknown): value is AutoPlatform {
  return value === "instagram" ? true : value === "facebook";
}
