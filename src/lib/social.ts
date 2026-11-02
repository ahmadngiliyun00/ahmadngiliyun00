// Aturan murni untuk postingan media sosial: membersihkan caption, membaca tagar, mencocokkan
// topik, membaca tanggal, memeriksa alamat gambar, dan membaca CSV ekspor data LinkedIn.
// Tanpa impor nilai, supaya bisa diuji langsung dari tests/social.test.mjs.

import type { PartialDate, SocialPlatform } from "@/content/types";

const EM_DASH = String.fromCharCode(0x2014);
const EN_DASH = String.fromCharCode(0x2013);
const AMPERSAND = String.fromCharCode(0x26);

// Emoji dan pelengkapnya (warna kulit, bendera, penyambung, pemilih varian, keycap).
const EMOJI = /[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}\u{1F1E6}-\u{1F1FF}\u{E0020}-\u{E007F}︎️‍⃣]/gu;
const HASHTAG = /#([\p{L}\p{N}_]+)/gu;
// Baris yang isinya hanya tagar (biasanya blok tagar di akhir caption Instagram).
const TAG_LINE = /^(?:[\s.,;|]*#[\p{L}\p{N}_]+)+[\s.,;|]*$/u;

export type CleanCaption = { caption: string; tags: string[] };

// Caption siap simpan: tanpa emoji, em dash, dan ampersand (aturan situs dan validasi CMS),
// tagar dipindah ke daftar terpisah, blok tagar di akhir dibuang, spasi dirapikan.
export function cleanCaption(raw: string): CleanCaption {
  const text = raw.replace(/\r\n?/g, "\n");
  const tags: string[] = [];
  for (const m of text.matchAll(HASHTAG)) {
    const tag = m[1];
    if (!tags.some((t) => t.toLowerCase() === tag.toLowerCase())) tags.push(tag);
  }
  const caption = text
    .replace(EMOJI, "")
    .split("\n")
    .filter((line) => !TAG_LINE.test(line))
    .join("\n")
    .split(` ${EM_DASH} `).join(" - ")
    .split(` ${EN_DASH} `).join(" - ")
    .split(EM_DASH).join("-")
    .split(EN_DASH).join("-")
    .replace(new RegExp(`\\s*${AMPERSAND}\\s*`, "g"), " dan ")
    .split("\n")
    .map((line) => line.replace(/[ \t ]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return { caption, tags };
}

// Judul ringkas untuk daftar CMS: baris pertama, dipotong di batas kata.
export function captionTitle(caption: string, max = 80): string {
  const first = (caption.split("\n").find((l) => l.trim() !== "") ?? "").trim();
  if (first.length <= max) return first;
  const cut = first.slice(0, max);
  const space = cut.lastIndexOf(" ");
  return `${(space > max / 2 ? cut.slice(0, space) : cut).replace(/[\s.,;:!?-]+$/, "")}...`;
}

export type TopicRule = { keyword: string; topic: string };

// Aturan topik dari Pengaturan, satu per baris: "kata kunci | Nama topik".
// Kata kunci boleh diawali tanda pagar; pencocokan tidak membedakan huruf besar dan kecil.
export function parseTopicRules(lines: string[]): { rules: TopicRule[]; errors: string[] } {
  const rules: TopicRule[] = [];
  const errors: string[] = [];
  for (const line of lines) {
    const parts = line.split("|").map((p) => p.trim());
    const keyword = (parts[0] ?? "").replace(/^#/, "").toLowerCase();
    const topic = parts[1] ?? "";
    if (parts.length !== 2 || keyword === "" || topic === "") {
      errors.push(line);
      continue;
    }
    rules.push({ keyword, topic });
  }
  return { rules, errors };
}

// Topik pertama yang kata kuncinya ada di tagar atau caption. Tanpa kecocokan: undefined.
export function matchTopic(rules: TopicRule[], caption: string, tags: string[]): string | undefined {
  const text = caption.toLowerCase();
  const lowerTags = tags.map((t) => t.toLowerCase());
  for (const rule of rules) {
    if (lowerTags.includes(rule.keyword)) return rule.topic;
    if (text.includes(rule.keyword)) return rule.topic;
  }
  return undefined;
}

// Tanggal postingan dalam waktu Indonesia barat (UTC+7). Menerima format Graph API
// (2026-05-10T08:12:33+0000), ISO biasa, dan format CSV LinkedIn (2026-05-10 08:12:33, UTC).
export function partialDateFrom(value: string): PartialDate | null {
  let text = value.trim();
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?$/.test(text)) text = `${text.replace(" ", "T")}Z`;
  text = text.replace(/([+-]\d{2})(\d{2})$/, "$1:$2");
  const ms = Date.parse(text);
  if (Number.isNaN(ms)) return null;
  const wib = new Date(ms + 7 * 60 * 60 * 1000);
  return { year: wib.getUTCFullYear(), month: wib.getUTCMonth() + 1, day: wib.getUTCDate() };
}

// Gambar hanya diunduh dari CDN Meta, supaya server tidak bisa disuruh mengambil alamat lain.
const MEDIA_HOSTS = [".cdninstagram.com", ".fbcdn.net"];

export function isAllowedMediaUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    return MEDIA_HOSTS.some((h) => url.hostname.endsWith(h));
  } catch {
    return false;
  }
}

// Slug data dari platform dan ID sumber, misalnya instagram-17912345678901234.
export function socialSlug(platform: SocialPlatform, sourceId: string): string {
  const id = sourceId
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
  return `${platform}-${id}`;
}

export type LinkedinShare = { sourceId: string; url: string; text: string; date: PartialDate | null };

// Shares.csv dari ekspor data LinkedIn (Settings, Data privacy, Get a copy of your data).
// Kolom yang dipakai: Date, ShareLink, ShareCommentary. Baris tanpa tautan postingan dilewati.
export function parseLinkedinShares(rows: string[][]): { items: LinkedinShare[]; skipped: number } {
  const header = (rows[0] ?? []).map((h) => h.trim().toLowerCase());
  const col = (name: string) => header.indexOf(name.toLowerCase());
  const iDate = col("Date");
  const iLink = col("ShareLink");
  const iText = col("ShareCommentary");
  if (iLink < 0 || iText < 0) throw new Error("Ini bukan Shares.csv dari LinkedIn: kolom ShareLink dan ShareCommentary tidak ada.");
  const items: LinkedinShare[] = [];
  let skipped = 0;
  for (const row of rows.slice(1)) {
    if (row.every((c) => c.trim() === "")) continue;
    const url = (row[iLink] ?? "").trim();
    const sourceId = linkedinId(url);
    if (sourceId === null) {
      skipped++;
      continue;
    }
    const text = unwrapLinkedinLines(row[iText] ?? "").trim();
    items.push({ sourceId, url, text, date: iDate < 0 ? null : partialDateFrom(row[iDate] ?? "") });
  }
  return { items, skipped };
}

// Ekspor LinkedIn membungkus setiap baris teks postingan dengan tanda kutip sendiri, jadi setelah
// CSV dibaca teks berbentuk: baris satu." lalu "" (baris kosong) lalu "baris dua. Bila pola kutip,
// baris baru, kutip itu ada, satu lapis kutip di awal dan akhir setiap baris dibuang. Teks satu
// baris atau tanpa pola itu tidak diubah.
export function unwrapLinkedinLines(text: string): string {
  const normalized = text.replace(/\r\n?/g, "\n");
  if (!/"\n"/.test(normalized)) return normalized;
  return normalized
    .split("\n")
    .map((line) => {
      let out = line;
      if (out.startsWith('"')) out = out.slice(1);
      if (out.endsWith('"')) out = out.slice(0, -1);
      return out;
    })
    .join("\n");
}

// ID postingan LinkedIn dari tautannya: urn:li:share:123, urn:li:activity:123, atau urn:li:ugcPost:123.
export function linkedinId(url: string): string | null {
  let text = url;
  try {
    text = decodeURIComponent(url);
  } catch {
    // Biarkan apa adanya bila tautan tidak bisa didekode.
  }
  if (!/^https:\/\/([a-z]+\.)?linkedin\.com\//i.test(text)) return null;
  const m = text.match(/urn:li:(share|activity|ugcPost):(\d+)/i);
  return m ? `${m[1].toLowerCase()}-${m[2]}` : null;
}

function dateKey(d: PartialDate | null): number {
  return d === null ? 0 : d.year * 10000 + (d.month ?? 0) * 100 + (d.day ?? 0);
}

export type TopicGroup<T> = { topic: string | null; id: string; items: T[] };

// Kelompok topik untuk halaman Media sosial: postingan terbaru di atas, topik dengan postingan
// paling baru didahulukan, postingan tanpa topik di kelompok terakhir.
export function groupByTopic<T extends { topic?: string; date: PartialDate | null }>(items: T[]): TopicGroup<T>[] {
  const sorted = [...items].sort((a, b) => dateKey(b.date) - dateKey(a.date));
  const groups: TopicGroup<T>[] = [];
  let rest: TopicGroup<T> | null = null;
  for (const item of sorted) {
    const topic = (item.topic ?? "").trim();
    if (topic === "") {
      rest ??= { topic: null, id: "lainnya", items: [] };
      rest.items.push(item);
      continue;
    }
    const found = groups.find((g) => g.topic?.toLowerCase() === topic.toLowerCase());
    if (found) found.items.push(item);
    else groups.push({ topic, id: topicId(topic, groups.length), items: [item] });
  }
  return rest === null ? groups : [...groups, rest];
}

// Jangkar bagian topik, misalnya "Program PIJAK" menjadi topik-program-pijak.
export function topicId(topic: string, index: number): string {
  const slug = topic
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return slug === "" ? `topik-${index + 1}` : `topik-${slug}`;
}
