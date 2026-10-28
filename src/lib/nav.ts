import type { NavItem } from "@/components/Header";
import { copy, type Lang } from "@/data/profile";
import { archivePath } from "@/lib/achievements";
import { postsPath } from "@/lib/posts";

// Halaman dalam yang dipindah dari beranda. Slug mengikuti pola /sertifikat/ dan /en/certificates/.
export type PageKey = "projects" | "research" | "teaching" | "journey";

export const PAGE_KEYS: PageKey[] = ["projects", "research", "teaching", "journey"];

const PAGE_SLUGS: Record<PageKey, Record<Lang, string>> = {
  projects: { id: "proyek", en: "projects" },
  research: { id: "riset", en: "research" },
  teaching: { id: "mengajar", en: "teaching" },
  journey: { id: "perjalanan", en: "journey" },
};

export function homePath(lang: Lang): string {
  return lang === "id" ? "/" : "/en/";
}

export function pagePath(lang: Lang, page: PageKey): string {
  const slug = PAGE_SLUGS[page][lang];
  return lang === "id" ? `/${slug}/` : `/en/${slug}/`;
}

// Halaman yang sedang dibuka, untuk menandai tautan navigasinya.
export type CurrentPage = PageKey | "home" | "certificates" | "news";

// Header: halaman dalam, arsip sertifikat, dan Kontak (jangkar di beranda).
export function navItems(lang: Lang, current?: CurrentPage): NavItem[] {
  const t = copy[lang].nav;
  const contact = current === "home" ? "#contact" : `${homePath(lang)}#contact`;
  return [
    ...PAGE_KEYS.map((page) => ({ id: page, label: t[page], href: pagePath(lang, page), current: current === page })),
    { id: "certificates", label: t.certificates, href: archivePath(lang), current: current === "certificates" },
    { id: "contact", label: t.contact, href: contact },
  ];
}

// Footer: semua halaman situs.
export function footerLinks(lang: Lang): { label: string; href: string }[] {
  const t = copy[lang].nav;
  const home = homePath(lang);
  return [
    { label: t.home, href: home },
    ...PAGE_KEYS.map((page) => ({ label: t[page], href: pagePath(lang, page) })),
    { label: t.certificates, href: archivePath(lang) },
    { label: t.news, href: postsPath(lang) },
    { label: t.contact, href: `${home}#contact` },
  ];
}

// Jangkar beranda lama yang bagiannya kini punya halaman sendiri. Tautan lama seperti /#research
// dialihkan ke halaman barunya oleh komponen LegacyAnchors.
export const LEGACY_ANCHORS: Record<string, { page: PageKey; hash?: string }> = {
  research: { page: "research" },
  teaching: { page: "teaching" },
  journey: { page: "journey" },
  next: { page: "journey", hash: "next" },
  activity: { page: "projects", hash: "activity" },
};

// Tautan "#bagian" yang ditulis di CMS (misalnya di koleksi Di luar kode) diarahkan ke tempat
// bagian itu sekarang: halaman dalam, atau bagian beranda bila dibuka dari halaman lain.
export function sectionHref(lang: Lang, href: string, onHome: boolean): string {
  if (!href.startsWith("#")) return href;
  const moved = LEGACY_ANCHORS[href.slice(1)];
  if (moved) return `${pagePath(lang, moved.page)}${moved.hash ? `#${moved.hash}` : ""}`;
  return onHome ? href : `${homePath(lang)}${href}`;
}
