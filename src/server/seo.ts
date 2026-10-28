import "server-only";
import type { Metadata } from "next";
import type { SeoSettings } from "@/content/types";
import { loadSite } from "@/server/content";

// Pengaturan SEO dari CMS (Pengaturan, SEO dan Search Console). Bila database gagal dibaca,
// halaman tetap dirender dengan judul dan deskripsi bawaan tanpa meta verifikasi.
export async function seoSettings(): Promise<SeoSettings> {
  try {
    return (await loadSite()).seo;
  } catch {
    return {};
  }
}

// Meta verifikasi kepemilikan situs. Dipasang di root layout supaya ada di beranda / dan /en/,
// tempat Google dan Bing memeriksanya.
export function siteVerification(seo: SeoSettings): Metadata["verification"] {
  const other: Record<string, string> = {};
  if (seo.bingVerification) other["msvalidate.01"] = seo.bingVerification;
  return { google: seo.googleVerification, other };
}
