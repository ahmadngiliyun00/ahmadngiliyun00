import { postKindLabels, type Entry, type PartialDate, type Post } from "@/content/types";
import { site, type Lang } from "@/data/profile";
import { formatPartialDate } from "@/lib/achievements";

// Berita dan tulisan untuk situs publik: urutan, alamat, dan pemecah isi lengkap.

export interface PostItem extends Post {
  slug: string;
  updatedAt: string;
}

function dateKey(d: PartialDate | null): number {
  if (d === null) return 0;
  return d.year * 10000 + (d.month ?? 0) * 100 + (d.day ?? 0);
}

export function byPostDate(a: Pick<Post, "date">, b: Pick<Post, "date">): number {
  return dateKey(b.date) - dateKey(a.date);
}

// Semua berita public, terbaru di atas. Masukan: entri dari loadSite() (sudah public saja).
export function publicPosts(list: Entry<"post">[]): PostItem[] {
  return list
    .filter((e) => e.visibility === "public")
    .map((e) => ({ ...e.data, slug: e.slug, updatedAt: e.updatedAt }))
    .sort(byPostDate);
}

export function postsPath(lang: Lang): string {
  return lang === "id" ? "/kabar/" : "/en/news/";
}

export function postPath(lang: Lang, slug: string): string {
  return `${postsPath(lang)}${slug}/`;
}

export function postUrl(lang: Lang, slug: string): string {
  return `${site.url}${postPath(lang, slug)}`;
}

// Halaman sendiri hanya untuk berita yang punya isi lengkap dalam bahasa itu.
export function hasPage(post: Post, lang: Lang): boolean {
  return (post.body?.[lang] ?? "") !== "";
}

// Tujuan kartu: halaman di situs bila ada isi lengkap, kalau tidak tautan sumber.
export function postHref(post: PostItem, lang: Lang): { href: string; external: boolean } | null {
  if (hasPage(post, lang)) return { href: postPath(lang, post.slug), external: false };
  return post.url ? { href: post.url, external: true } : null;
}

export function postKindLabel(post: Post, lang: Lang): string {
  return postKindLabels[post.kind][lang];
}

export function postDate(post: Post, lang: Lang): string {
  return post.date ? formatPartialDate(post.date, lang) : "";
}

export function isoPartialDate(d: PartialDate): string {
  const parts = [String(d.year)];
  if (d.month !== undefined) {
    parts.push(String(d.month).padStart(2, "0"));
    if (d.day !== undefined) parts.push(String(d.day).padStart(2, "0"));
  }
  return parts.join("-");
}

// Isi lengkap: paragraf dipisah baris kosong, baris berawalan "## " menjadi subjudul.
export type PostBlock = { type: "heading"; text: string } | { type: "paragraph"; lines: string[] };

export function postBlocks(body: string): PostBlock[] {
  return body
    .replace(/\r\n?/g, "\n")
    .split(/\n\s*\n/)
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk !== "")
    .map((chunk): PostBlock => {
      if (chunk.startsWith("## ")) return { type: "heading", text: chunk.slice(3).trim() };
      return { type: "paragraph", lines: chunk.split("\n").map((l) => l.trim()) };
    });
}

// Dikelompokkan per tahun untuk arsip.
export function groupByYear(items: PostItem[]): { year: string; items: PostItem[] }[] {
  const groups: { year: string; items: PostItem[] }[] = [];
  for (const item of items) {
    const year = item.date ? String(item.date.year) : "";
    const last = groups[groups.length - 1];
    if (last ? last.year === year : false) last.items.push(item);
    else groups.push({ year, items: [item] });
  }
  return groups;
}
