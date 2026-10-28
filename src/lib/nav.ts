import type { NavItem } from "@/components/Header";
import { copy, type Lang } from "@/data/profile";

// Urutan bagian beranda. Di halaman lain, tautan diarahkan ke bagian beranda yang sama.
const SECTIONS = ["about", "projects", "activity", "achievements", "research", "teaching", "journey", "next", "contact"] as const;

export function homePath(lang: Lang): string {
  return lang === "id" ? "/" : "/en/";
}

export function navItems(lang: Lang, onHome: boolean): NavItem[] {
  const t = copy[lang].nav;
  const home = homePath(lang);
  return SECTIONS.map((id) => ({
    id,
    label: t[id],
    href: onHome ? undefined : `${home}#${id}`,
  }));
}
