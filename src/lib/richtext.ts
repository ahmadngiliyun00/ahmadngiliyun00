// Utilitas isi rich text (HTML dari editor CMS). Hanya impor tipe supaya bisa dipakai di client,
// server, dan tests/richtext.test.mjs. Aturan pembersihan HTML juga ada di sini; paket
// sanitize-html dipanggil dari src/server/richtext.ts.

import type sanitize from "sanitize-html";

const AMP = String.fromCharCode(38);
const ENTITIES: Record<string, string> = {
  amp: AMP,
  lt: "<",
  gt: ">",
  quot: '"',
  "#39": "'",
  apos: "'",
  nbsp: " ",
};
const ENTITY_RE = new RegExp(`${AMP}(amp|lt|gt|quot|#39|apos|nbsp);`, "g");
const ESCAPE_RE = new RegExp(`[${AMP}<>"]`, "g");
const ESCAPES: Record<string, string> = { [AMP]: `${AMP}amp;`, "<": `${AMP}lt;`, ">": `${AMP}gt;`, '"': `${AMP}quot;` };

// Isi lama berupa teks biasa; isi dari editor selalu diawali tag.
export function isHtml(value: string): boolean {
  return value.trimStart().startsWith("<");
}

// Teks polos dari HTML: tag dibuang, blok dipisah spasi, entitas umum diurai.
export function htmlToText(html: string): string {
  return html
    .replace(/<(br|\/p|\/h[1-6]|\/li|\/blockquote|\/pre|hr)[^>]*>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(ENTITY_RE, (_m, name: string) => ENTITIES[name] ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

// Isi lama (teks biasa: paragraf dipisah baris kosong, "## " untuk subjudul) menjadi HTML.
export function textToHtml(text: string): string {
  const esc = (s: string) => s.replace(ESCAPE_RE, (c) => ESCAPES[c]);
  return text
    .replace(/\r\n?/g, "\n")
    .split(/\n\s*\n/)
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk !== "")
    .map((chunk) =>
      chunk.startsWith("## ")
        ? `<h2>${esc(chunk.slice(3).trim())}</h2>`
        : `<p>${chunk.split("\n").map((l) => esc(l.trim())).join("<br>")}</p>`,
    )
    .join("");
}

// Isi dalam bentuk HTML, apa pun format simpanannya.
export function asHtml(value: string): string {
  return isHtml(value) ? value : textToHtml(value);
}

// ID berkas unggahan yang dipakai di isi, dari alamat /files/<id>/.
export function fileIdsIn(html: string): string[] {
  const ids = new Set<string>();
  for (const m of html.matchAll(/\/files\/([a-f0-9]{24})\//g)) ids.add(m[1]);
  return [...ids];
}

// Perkiraan waktu baca: 200 kata per menit, minimal 1 menit.
export function readingMinutes(text: string): number {
  const words = text.split(/\s+/).filter((w) => w !== "").length;
  return Math.max(1, Math.round(words / 200));
}

// ---------- Aturan pembersihan HTML ----------
// Gambar hanya boleh dari unggahan sendiri (/files/<id>/): gambar dari situs lain akan
// membocorkan IP pembaca ke pihak ketiga dan bisa hilang sewaktu-waktu.

const FILE_SRC = /^\/files\/[a-f0-9]{24}\/$/;

const BASE_POLICY: sanitize.IOptions = {
  allowedTags: ["p", "h2", "h3", "strong", "em", "u", "s", "a", "ul", "ol", "li", "blockquote", "pre", "code", "hr", "br", "img"],
  allowedAttributes: { a: ["href"], img: ["src", "alt"] },
  allowedSchemes: ["https", "mailto"],
  allowedSchemesAppliedToAttributes: ["href", "src"],
  allowProtocolRelative: false,
  exclusiveFilter: (frame) => (frame.tag === "img" ? !FILE_SRC.test(frame.attribs.src ?? "") : false),
};

// Untuk disimpan: hanya struktur, tanpa atribut tambahan.
export const STORE_POLICY: sanitize.IOptions = BASE_POLICY;

// Untuk dirender di situs: tautan keluar dibuka di tab baru, gambar dimuat malas.
export const RENDER_POLICY: sanitize.IOptions = {
  ...BASE_POLICY,
  allowedAttributes: { a: ["href", "target", "rel"], img: ["src", "alt", "loading", "decoding"] },
  transformTags: {
    a: (tagName, attribs) => {
      const external = (attribs.href ?? "").startsWith("https://");
      return { tagName, attribs: external ? { ...attribs, target: "_blank", rel: "noopener noreferrer" } : attribs };
    },
    img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: "lazy", decoding: "async" } }),
  },
};
