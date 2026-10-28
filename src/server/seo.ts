import "server-only";
import type { Metadata } from "next";
import { loadSite } from "@/server/content";

// Meta verifikasi kepemilikan situs dari CMS (Pengaturan, Search Console dan Analytics).
// Dipasang di root layout supaya ada di beranda / dan /en/, tempat Google dan Bing memeriksanya.
// Bila database gagal dibaca, metadata lain tetap dirender tanpa meta verifikasi.
export async function siteVerification(): Promise<Metadata["verification"]> {
  try {
    const { seo } = await loadSite();
    const other: Record<string, string> = {};
    if (seo.bingVerification) other["msvalidate.01"] = seo.bingVerification;
    return { google: seo.googleVerification, other };
  } catch {
    return undefined;
  }
}
