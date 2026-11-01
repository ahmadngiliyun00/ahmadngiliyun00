// Membaca berkas ekspor data Instagram dan Facebook (Pusat Akun Meta, format JSON) dan
// mengenali arsip ekspor LinkedIn. Fungsi murni tanpa impor nilai: dipakai di peramban (komponen
// impor CMS) dan diuji langsung dari tests/social-export.test.mjs.
//
// Bentuk ekspor yang dikenali (diperiksa dari ekspor asli, November 2026):
// - Instagram: your_instagram_activity/media/posts.json (format berlabel: fbid, label_values
//   Caption, Media, Published, Draft) dan posts_1.json (format lama: media[] dengan uri, title,
//   creation_timestamp; carousel memuat semua gambarnya). Ekspor lama memakai content/posts_1.json.
// - Facebook: your_facebook_activity/posts/your_posts__check_ins__photos_and_videos_1.json
//   (timestamp, title, data[].post, attachments[].data[].media.uri). Ekspor lama: posts/your_posts_1.json.
// Ekspor Meta tidak memuat tautan postingan, dan Facebook tidak memuat ID postingan maupun audiens.

export type ExportPlatform = "instagram" | "facebook";

export type ExportMedia = { path: string; kind: "image" | "video" };

export type ExportPost = {
  sourceId: string;
  timestamp: number; // detik sejak epoch (UTC)
  text: string; // teks asli yang sudah diperbaiki dari mojibake, belum lewat cleanCaption
  media: ExportMedia[];
  notes: string[]; // peringatan untuk diperiksa di CMS
};

export type SkipReason = "draft" | "empty" | "other-profile" | "not-owner" | "duplicate";

export type ExportParse = {
  platform: ExportPlatform;
  posts: ExportPost[];
  skipped: Partial<Record<SkipReason, number>>;
};

// ---------- Teks rusak (mojibake) ----------

// Meta menulis UTF-8 sebagai deretan byte yang di-escape per huruf (ð\u009f\u0098\u0080 untuk
// satu emoji). Bila semua karakter muat dalam satu byte dan byte-nya sah sebagai UTF-8, teks
// dibaca ulang sebagai UTF-8. Teks yang sudah benar (atau bukan UTF-8 sah) dibiarkan.
export function fixMetaText(value: string): string {
  let multibyte = false;
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code > 0xff) return value;
    if (code >= 0x80) multibyte = true;
  }
  if (!multibyte) return value;
  const bytes = new Uint8Array(value.length);
  for (let i = 0; i < value.length; i++) bytes[i] = value.charCodeAt(i);
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return value;
  }
}

const str = (v: unknown): string => (typeof v === "string" ? fixMetaText(v) : "");
const num = (v: unknown): number => (typeof v === "number" ? (Number.isFinite(v) ? v : 0) : 0);
const isObj = (v: unknown): v is Record<string, unknown> => (v === null ? false : typeof v === "object" ? !Array.isArray(v) : false);
const list = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

const VIDEO = /\.(mp4|mov|m4v|webm)$/i;
const IMAGE = /\.(jpe?g|png|webp|heic|gif)$/i;

function mediaOf(uri: string): ExportMedia | null {
  const path = uri.replace(/^\/+/, "");
  if (path === "" || path.includes("..") || /^[a-z]+:/i.test(path)) return null;
  if (VIDEO.test(path)) return { path, kind: "video" };
  if (IMAGE.test(path)) return { path, kind: "image" };
  return null;
}

function baseName(path: string): string {
  return (path.split("/").pop() ?? "").replace(/\.[^.]+$/, "");
}

// Hash pendek FNV-1a 32 bit, untuk ID stabil postingan tanpa media.
export function shortHash(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

// ID stabil bila platform tidak memberi ID: waktu posting dan nama berkas media pertama, atau
// hash teks untuk postingan tanpa media. Contoh: t1700000000-1234567890123456.
export function derivedSourceId(timestamp: number, media: ExportMedia[], text: string): string {
  const first = media[0] ? baseName(media[0].path).replace(/[^A-Za-z0-9_-]+/g, "").slice(0, 40) : "";
  return `t${Math.trunc(timestamp)}-${first === "" ? shortHash(text) : first}`;
}

// Tautan https tanpa query dan fragmen (query biasanya berisi pelacak dan ampersand).
export function plainLink(value: string): string {
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? `${url.origin}${url.pathname}` : "";
  } catch {
    return "";
  }
}

// ---------- Mengenali arsip ----------

export type ExportKind =
  | { kind: "instagram"; files: string[] }
  | { kind: "facebook"; files: string[] }
  | { kind: "linkedin"; file: string };

const IG_POSTS = /(^|\/)(your_instagram_activity\/media|content|media)\/posts(_\d+)?\.json$/;
const FB_POSTS = /(^|\/)(your_facebook_activity\/)?posts\/your_posts(__check_ins__photos_and_videos)?(_\d+)?\.json$/;
const LI_SHARES = /(^|\/)Shares\.csv$/i;

// Menentukan jenis arsip dari daftar nama berkas di dalam ZIP. Melempar Error dengan pesan yang
// bisa langsung ditampilkan bila arsip tidak dikenali.
export function detectExport(paths: string[]): ExportKind {
  const ig = paths.filter((p) => IG_POSTS.test(p));
  const fb = paths.filter((p) => FB_POSTS.test(p));
  const li = paths.find((p) => LI_SHARES.test(p));
  if (ig.length > 0) return { kind: "instagram", files: ig.sort() };
  if (fb.length > 0) return { kind: "facebook", files: fb.sort() };
  if (li !== undefined) return { kind: "linkedin", file: li };
  const html = paths.some((p) => /(your_instagram_activity|your_facebook_activity|posts)\/.*\.html$/.test(p));
  if (html) throw new Error("Ekspor ini berformat HTML. Minta ekspor ulang di Pusat Akun Meta dan pilih format JSON.");
  // LinkedIn mengirim arsip "Basic" lebih dulu (profil, koneksi, sertifikat), lalu arsip lengkap
  // "Complete" yang memuat Shares.csv 24 sampai 48 jam kemudian. Pilihan per berkas tidak memuat postingan.
  if (paths.some((p) => /(^|\/)Profile\.csv$/i.test(p))) {
    throw new Error(
      "Arsip LinkedIn ini belum memuat postingan (Shares.csv). Ini biasanya arsip Basic yang dikirim lebih dulu. Di LinkedIn (Settings, Data privacy, Get a copy of your data) pilih Download larger data archive, lalu tunggu email kedua berisi arsip Complete (24 sampai 48 jam; tautannya berlaku 72 jam) dan unggah arsip itu.",
    );
  }
  if (paths.some((p) => /your_(instagram|facebook)_activity\//.test(p))) {
    throw new Error("Arsip Meta ini tidak memuat postingan. Saat membuat ekspor, pilih jenis informasi Postingan (Posts) atau Media.");
  }
  throw new Error("Arsip tidak dikenali. Unggah ZIP ekspor data Instagram atau Facebook (format JSON), atau arsip LinkedIn yang memuat Shares.csv.");
}

function parseJson(name: string, text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Berkas ${name} di dalam arsip rusak atau bukan JSON.`);
  }
}

// ---------- Instagram ----------

type IgCandidate = { fbid: string; timestamp: number; text: string; media: ExportMedia[]; published: boolean };

function labeled(entry: Record<string, unknown>, label: string): Record<string, unknown> | undefined {
  return list(entry.label_values).find((x): x is Record<string, unknown> => (isObj(x) ? x.label === label : false));
}

function igMediaList(items: unknown[]): ExportMedia[] {
  return items
    .map((m) => (isObj(m) ? mediaOf(str(m.uri)) : null))
    .filter((m): m is ExportMedia => m !== null);
}

// Satu entri, format berlabel (posts.json) atau format lama (posts_1.json).
function igEntry(entry: unknown): IgCandidate | null {
  if (!isObj(entry)) return null;
  if (Array.isArray(entry.label_values)) {
    const media = igMediaList(list(labeled(entry, "Media")?.media));
    const first = list(labeled(entry, "Media")?.media)[0];
    const caption = str(labeled(entry, "Caption")?.value) || (isObj(first) ? str(first.title) : "");
    const published = str(labeled(entry, "Published")?.value) !== "False";
    const draft = str(labeled(entry, "Draft")?.value) === "True";
    const fbid = str(entry.fbid);
    return { fbid: /^\d{5,30}$/.test(fbid) ? fbid : "", timestamp: num(entry.timestamp), text: caption, media, published: draft ? false : published };
  }
  if (Array.isArray(entry.media)) {
    const items = list(entry.media);
    const first = items[0];
    const text = str(entry.title) || (isObj(first) ? str(first.title) : "");
    const timestamp = num(entry.creation_timestamp) || (isObj(first) ? num(first.creation_timestamp) : 0);
    return { fbid: "", timestamp, text, media: igMediaList(items), published: true };
  }
  return null;
}

// Waktu posting di dua format berbeda sampai beberapa detik untuk postingan yang sama.
const SAME_POST_SECONDS = 5;

export function parseInstagramExport(files: Record<string, string>): ExportParse {
  const candidates: IgCandidate[] = [];
  for (const [name, text] of Object.entries(files)) {
    const data = parseJson(name, text);
    const entries = Array.isArray(data) ? data : isObj(data) ? [data] : [];
    for (const e of entries) {
      const c = igEntry(e);
      if (c !== null) candidates.push(c);
    }
  }
  if (candidates.length === 0) throw new Error("Berkas postingan Instagram ditemukan, tetapi isinya tidak dikenali.");

  const skipped: ExportParse["skipped"] = {};
  const bump = (r: SkipReason) => (skipped[r] = (skipped[r] ?? 0) + 1);
  // Entri berlabel (punya fbid) didahulukan; entri format lama untuk postingan yang sama hanya
  // menyumbang daftar gambar carousel yang lengkap.
  const withId = candidates.filter((c) => c.fbid !== "");
  const legacy = candidates.filter((c) => c.fbid === "");
  const used = new Set<IgCandidate>();
  const posts: ExportPost[] = [];
  for (const c of withId) {
    const twin = legacy.find((l) => (used.has(l) ? false : Math.abs(l.timestamp - c.timestamp) <= SAME_POST_SECONDS));
    if (twin) used.add(twin);
    if (!c.published) {
      bump("draft");
      continue;
    }
    const media = twin ? (twin.media.length > c.media.length ? twin.media : c.media) : c.media;
    posts.push({ sourceId: c.fbid, timestamp: c.timestamp, text: c.text || (twin?.text ?? ""), media, notes: [] });
  }
  for (const l of legacy) {
    if (used.has(l)) continue;
    posts.push({ sourceId: derivedSourceId(l.timestamp, l.media, l.text), timestamp: l.timestamp, text: l.text, media: l.media, notes: [] });
  }
  return finish("instagram", posts, skipped);
}

// ---------- Facebook ----------

// Nama pemilik akun: awalan kata terpanjang yang dimiliki sebagian besar judul
// ("Ahmad Ngiliyun membagikan tautan.").
export function ownerName(titles: string[]): string {
  const words = titles.filter((t) => t.trim() !== "").map((t) => t.trim().split(/\s+/));
  if (words.length === 0) return "";
  const need = Math.ceil(words.length * 0.6);
  let prefix: string[] = [];
  for (let n = 1; n <= 5; n++) {
    const counts = new Map<string, number>();
    for (const w of words) {
      if (w.length <= n) continue;
      const key = w.slice(0, n).join(" ");
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    const best = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    if (best === undefined) break;
    if (best[1] < need) break;
    prefix = best[0].split(" ");
  }
  return prefix.join(" ");
}

// Postingan di profil orang lain: "X menulis di profil Y." atau "X wrote on Y's timeline."
const OTHER_PROFILE = /^(?:menulis di|wrote on|posted on|posted to|posted in)\s+(?:profil\s+)?(.+)$/i;
// Dibagikan ke grup, halaman, atau profil lain: "membagikan tautan ke Grup X", "shared a post to".
const SHARED_TO = /\s(?:ke|to)\s+\S/i;

export function parseFacebookExport(files: Record<string, string>): ExportParse {
  const entries: Record<string, unknown>[] = [];
  for (const [name, text] of Object.entries(files)) {
    const data = parseJson(name, text);
    for (const e of list(data)) if (isObj(e)) entries.push(e);
  }
  if (entries.length === 0) throw new Error("Berkas postingan Facebook ditemukan, tetapi isinya kosong atau tidak dikenali.");

  const owner = ownerName(entries.map((e) => str(e.title)));
  const skipped: ExportParse["skipped"] = {};
  const bump = (r: SkipReason) => (skipped[r] = (skipped[r] ?? 0) + 1);
  const posts: ExportPost[] = [];
  for (const e of entries) {
    const title = str(e.title).trim();
    const rest = owner !== "" ? (title.startsWith(owner) ? title.slice(owner.length).trim() : null) : title;
    if (title !== "") {
      if (rest === null) {
        bump("not-owner");
        continue;
      }
      const other = rest.match(OTHER_PROFILE);
      if (other) {
        if (owner === "" || !other[1].startsWith(owner)) {
          bump("other-profile");
          continue;
        }
      }
    }
    const text = list(e.data)
      .map((d) => (isObj(d) ? str(d.post) : ""))
      .find((t) => t.trim() !== "") ?? "";
    const attached = list(e.attachments).flatMap((a) => (isObj(a) ? list(a.data) : [])).filter(isObj);
    const media = attached
      .map((d) => (isObj(d.media) ? mediaOf(str(d.media.uri)) : null))
      .filter((m): m is ExportMedia => m !== null);
    if (text.trim() === "" ? media.length === 0 : false) {
      bump("empty");
      continue;
    }
    const notes = ["Ekspor Facebook tidak mencatat audiens postingan. Pastikan postingan ini publik dan milik Anda sebelum dijadikan public."];
    if (rest !== null ? SHARED_TO.test(rest) : false) notes.push("Dibagikan ke grup, halaman, atau profil lain.");
    if (/instagram/i.test(rest ?? "")) notes.push("Dibagikan dari Instagram; kemungkinan sama dengan postingan Instagram yang sudah diimpor.");
    const link = attached.map((d) => (isObj(d.external_context) ? plainLink(str(d.external_context.url)) : "")).find((u) => u !== "");
    if (link) notes.push(`Tautan yang dibagikan: ${link}`);
    const timestamp = num(e.timestamp);
    posts.push({ sourceId: derivedSourceId(timestamp, media, text), timestamp, text, media, notes });
  }
  return finish("facebook", posts, skipped);
}

// Buang entri tanpa waktu yang sah dan ID ganda di dalam satu arsip, lalu urutkan terbaru di atas.
function finish(platform: ExportPlatform, posts: ExportPost[], skipped: ExportParse["skipped"]): ExportParse {
  const seen = new Set<string>();
  const out: ExportPost[] = [];
  for (const p of posts) {
    if (p.timestamp <= 0) {
      skipped.empty = (skipped.empty ?? 0) + 1;
      continue;
    }
    if (seen.has(p.sourceId)) {
      skipped.duplicate = (skipped.duplicate ?? 0) + 1;
      continue;
    }
    seen.add(p.sourceId);
    if (p.media.length > 1) {
      const images = p.media.filter((m) => m.kind === "image").length;
      p.notes.push(`Postingan berisi ${p.media.length} media; hanya gambar pertama yang disalin${images === 0 ? " (tidak ada gambar)" : ""}.`);
    } else if (p.media[0]?.kind === "video") {
      p.notes.push("Postingan berupa video; video tidak disalin. Unggah gambar sampul manual bila perlu.");
    }
    out.push(p);
  }
  return { platform, posts: out.sort((a, b) => b.timestamp - a.timestamp), skipped };
}

// Gambar sampul: gambar pertama di postingan, bila ada.
export function coverImage(post: Pick<ExportPost, "media">): ExportMedia | undefined {
  return post.media.find((m) => m.kind === "image");
}
