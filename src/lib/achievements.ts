import {
  achievements,
  authorshipLabels,
  kindLabels,
  kindSingular,
  type Achievement,
  type AchievementKind,
  type PartialDate,
} from "@/data/achievements";
import { copy, site, type Lang } from "@/data/profile";
import { buildLinkedInAddUrl } from "@/lib/linkedin";

// Batas tampilan beranda. Validator (scripts/check-achievements.mjs) memakai angka yang sama.
export const HOME_FEATURED_LIMIT = 6;
export const HOME_HKI_LIMIT = 5;

// Kategori yang punya formulir sertifikasi resmi di LinkedIn.
const LINKEDIN_KINDS: AchievementKind[] = ["sertifikat", "pelatihan"];

function dateKey(d: PartialDate | null): number {
  if (d === null) return 0;
  return d.year * 10000 + (d.month ?? 0) * 100 + (d.day ?? 0);
}

// Terbaru dulu. Peran yang masih berjalan di depan, tanggal kosong di belakang.
function byNewest(a: Achievement, b: Achievement) {
  const ao = a.ongoing ? 1 : 0;
  const bo = b.ongoing ? 1 : 0;
  if (ao !== bo) return bo - ao;
  return dateKey(b.issued) - dateKey(a.issued);
}

export function publicAchievements(): Achievement[] {
  return achievements.filter((a) => a.visibility === "public").sort(byNewest);
}

export function getPublicAchievement(id: string): Achievement | undefined {
  return publicAchievements().find((a) => a.id === id);
}

export function homeFeatured(): Achievement[] {
  return publicAchievements()
    .filter((a) => a.featured)
    .slice(0, HOME_FEATURED_LIMIT);
}

export function homeCopyrights(): Achievement[] {
  return publicAchievements()
    .filter((a) => a.kind === "hki")
    .filter((a) => a.showOnHome === true)
    .slice(0, HOME_HKI_LIMIT);
}

export function countKind(kind: AchievementKind): number {
  return publicAchievements().filter((a) => a.kind === kind).length;
}

export function publicationsByYear(): { year: number; items: Achievement[] }[] {
  const groups = new Map<number, Achievement[]>();
  for (const item of publicAchievements()) {
    if (item.kind !== "publikasi") continue;
    if (item.issued === null) continue;
    const list = groups.get(item.issued.year) ?? [];
    list.push(item);
    groups.set(item.issued.year, list);
  }
  return [...groups.entries()].sort((a, b) => b[0] - a[0]).map(([year, items]) => ({ year, items }));
}

export function formatPartialDate(d: PartialDate, lang: Lang): string {
  const locale = lang === "id" ? "id-ID" : "en-GB";
  if (d.month === undefined) return String(d.year);
  const date = new Date(Date.UTC(d.year, d.month - 1, d.day ?? 1));
  return new Intl.DateTimeFormat(locale, {
    day: d.day === undefined ? undefined : "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function archivePath(lang: Lang): string {
  return lang === "id" ? "/sertifikat/" : "/en/certificates/";
}

export function detailPath(lang: Lang, id: string): string {
  return `${archivePath(lang)}${id}/`;
}

export function detailUrl(lang: Lang, id: string): string {
  return `${site.url}${detailPath(lang, id)}`;
}

export function kindLabel(kind: AchievementKind, lang: Lang): string {
  return kindLabels[kind][lang];
}

export function kindName(kind: AchievementKind, lang: Lang): string {
  return kindSingular[kind][lang];
}

export function hasLinkedInForm(item: Achievement): boolean {
  if (item.linkedin !== true) return false;
  return LINKEDIN_KINDS.includes(item.kind);
}

// certUrl memakai URL verifikasi resmi penerbit bila ada, kalau tidak halaman detail di situs ini.
// Nama yang dikirim adalah judul resmi (bahasa Indonesia), sama seperti yang tercetak di sertifikat.
export function linkedInUrl(item: Achievement): string | null {
  if (!hasLinkedInForm(item)) return null;
  return buildLinkedInAddUrl({
    name: item.title.id,
    organizationName: item.issuer,
    issued: item.issued,
    expires: item.expires,
    certUrl: item.verifyUrl ?? detailUrl("id", item.id),
    certId: item.credentialId,
  });
}

// Bentuk ringkas yang dikirim ke komponen klien (arsip, filter beranda).
export type AchievementCard = {
  id: string;
  kind: AchievementKind;
  kindName: string;
  title: string;
  issuer: string;
  summary: string;
  date: string;
  year: number | null;
  href: string;
  verifyUrl: string | null;
  authorship: string | null;
  search: string;
};

export function toCard(
  item: Achievement,
  lang: Lang,
  labels: { ongoing: string; noDate: string; authorship: Record<string, string> },
): AchievementCard {
  const date = item.ongoing
    ? labels.ongoing
    : item.issued === null
      ? labels.noDate
      : formatPartialDate(item.issued, lang);
  const summary = item.summary ? item.summary[lang] : "";
  const authorship = item.authorship ? labels.authorship[item.authorship] : null;
  return {
    id: item.id,
    kind: item.kind,
    kindName: kindName(item.kind, lang),
    title: item.title[lang],
    issuer: item.issuer,
    summary,
    date,
    year: item.issued === null ? null : item.issued.year,
    href: detailPath(lang, item.id),
    verifyUrl: item.verifyUrl ?? null,
    authorship,
    search: [item.title[lang], item.title.id, item.issuer, summary, ...(item.skills ?? []), item.credentialId ?? ""]
      .join(" ")
      .toLowerCase(),
  };
}

// Kartu untuk komponen klien, dengan label sesuai bahasa.
export function toCards(items: Achievement[], lang: Lang): AchievementCard[] {
  const t = copy[lang].detail;
  const authorship: Record<string, string> = {};
  for (const [key, label] of Object.entries(authorshipLabels)) authorship[key] = label[lang];
  return items.map((item) => toCard(item, lang, { ongoing: t.ongoing, noDate: t.noDate, authorship }));
}

// Kategori yang punya item publik, urut sesuai kindLabels, dengan jumlahnya.
export function kindFilters(lang: Lang): { kind: AchievementKind; label: string; count: number }[] {
  const items = publicAchievements();
  return (Object.keys(kindLabels) as AchievementKind[])
    .map((kind) => ({ kind, label: kindLabel(kind, lang), count: items.filter((a) => a.kind === kind).length }))
    .filter((k) => k.count > 0);
}

export function publicYears(): number[] {
  const years = new Set<number>();
  for (const item of publicAchievements()) {
    if (item.issued !== null) years.add(item.issued.year);
  }
  return [...years].sort((a, b) => b - a);
}
