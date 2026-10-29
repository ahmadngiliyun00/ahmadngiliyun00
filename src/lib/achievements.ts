import {
  authorshipLabels,
  kindLabels,
  kindSingular,
  type Achievement,
  type AchievementKind,
  type Entry,
  type PartialDate,
  type Visibility,
} from "@/content/types";
import { copy, site, type Lang } from "@/data/profile";
import { parseDriveUrl } from "@/lib/drive";
import { buildLinkedInAddUrl } from "@/lib/linkedin";

// Batas tampilan beranda. Formulir CMS menolak lebih dari ini.
export const HOME_FEATURED_LIMIT = 6;
export const HOME_HKI_LIMIT = 5;

// Satu capaian seperti yang dipakai komponen: data ditambah slug (id) dan visibility.
export interface AchievementItem extends Achievement {
  id: string;
  visibility: Visibility;
  fileUrl?: string;
}

// Kategori yang punya formulir sertifikasi resmi di LinkedIn.
const LINKEDIN_KINDS: AchievementKind[] = ["sertifikat", "pelatihan"];

export function toItem(entry: Entry<"achievement">): AchievementItem {
  return {
    ...entry.data,
    id: entry.slug,
    visibility: entry.visibility,
    fileUrl: entry.data.fileId ? `/files/${entry.data.fileId}/` : undefined,
  };
}

function dateKey(d: PartialDate | null): number {
  if (d === null) return 0;
  return d.year * 10000 + (d.month ?? 0) * 100 + (d.day ?? 0);
}

// Terbaru dulu. Peran yang masih berjalan di depan, tanggal kosong di belakang.
export function byNewest(a: Achievement, b: Achievement) {
  const ao = a.ongoing ? 1 : 0;
  const bo = b.ongoing ? 1 : 0;
  if (ao !== bo) return bo - ao;
  return dateKey(b.issued) - dateKey(a.issued);
}

// Semua capaian public, terurut. Masukan: entri dari loadSite() (sudah public saja).
export function publicItems(list: Entry<"achievement">[]): AchievementItem[] {
  return list
    .filter((e) => e.visibility === "public")
    .map(toItem)
    .sort(byNewest);
}

export function homeFeatured(items: AchievementItem[]): AchievementItem[] {
  return items.filter((a) => a.featured).slice(0, HOME_FEATURED_LIMIT);
}

export function homeCopyrights(items: AchievementItem[]): AchievementItem[] {
  return items
    .filter((a) => a.kind === "hki")
    .filter((a) => a.showOnHome === true)
    .slice(0, HOME_HKI_LIMIT);
}

export function countKind(items: AchievementItem[], kind: AchievementKind): number {
  return items.filter((a) => a.kind === kind).length;
}

export function publicationsByYear(items: AchievementItem[]): { year: number; items: AchievementItem[] }[] {
  const groups = new Map<number, AchievementItem[]>();
  for (const item of items) {
    if (item.kind !== "publikasi") continue;
    if (item.issued === null) continue;
    const list = groups.get(item.issued.year) ?? [];
    list.push(item);
    groups.set(item.issued.year, list);
  }
  return [...groups.entries()].sort((a, b) => b[0] - a[0]).map(([year, list]) => ({ year, items: list }));
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
export function linkedInUrl(item: AchievementItem): string | null {
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

// Ada bukti yang bisa dipratinjau di halaman detail: berkas unggahan atau tautan Google Drive.
export function hasProof(item: Achievement): boolean {
  return item.fileId ? true : item.driveUrl ? parseDriveUrl(item.driveUrl) !== null : false;
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
  proof: boolean; // ada berkas unggahan atau tautan Google Drive yang bisa dipratinjau di halaman detail
  authorship: string | null;
  search: string;
};

export function toCards(items: AchievementItem[], lang: Lang): AchievementCard[] {
  const t = copy[lang].detail;
  return items.map((item) => {
    const date = item.ongoing
      ? t.ongoing
      : item.issued === null
        ? t.noDate
        : formatPartialDate(item.issued, lang);
    const summary = item.summary ? item.summary[lang] : "";
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
      proof: hasProof(item),
      authorship: item.authorship ? authorshipLabels[item.authorship][lang] : null,
      search: [item.title[lang], item.title.id, item.issuer, summary, ...(item.skills ?? []), item.credentialId ?? ""]
        .join(" ")
        .toLowerCase(),
    };
  });
}

// Kategori yang punya item, urut sesuai kindLabels, dengan jumlahnya.
export function kindFilters(items: AchievementItem[], lang: Lang): { kind: AchievementKind; label: string; count: number }[] {
  return (Object.keys(kindLabels) as AchievementKind[])
    .map((kind) => ({ kind, label: kindLabel(kind, lang), count: items.filter((a) => a.kind === kind).length }))
    .filter((k) => k.count > 0);
}

export function itemYears(items: AchievementItem[]): number[] {
  const years = new Set<number>();
  for (const item of items) {
    if (item.issued !== null) years.add(item.issued.year);
  }
  return [...years].sort((a, b) => b - a);
}
