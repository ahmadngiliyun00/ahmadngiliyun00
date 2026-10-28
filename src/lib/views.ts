// Aturan hitungan pembaca tulisan yang dipakai bersama oleh server dan tests/views.test.mjs.
// Tanpa impor nilai supaya bisa dimuat skrip Node.

// Sumber dari tombol bagikan (?src=...) dan dari Referer yang dikenali.
export const SHARE_SOURCES = ["whatsapp", "facebook", "x", "linkedin", "telegram"] as const;
export type ShareSource = (typeof SHARE_SOURCES)[number];

const REFERRER_SOURCES: [RegExp, string][] = [
  [/(^|\.)google\./, "google"],
  [/(^|\.)bing\.com$/, "bing"],
  [/(^|\.)duckduckgo\.com$/, "duckduckgo"],
  [/(^|\.)(facebook\.com|fb\.com|fb\.me)$/, "facebook"],
  [/(^|\.)(x\.com|twitter\.com|t\.co)$/, "x"],
  [/(^|\.)(linkedin\.com|lnkd\.in)$/, "linkedin"],
  [/(^|\.)(whatsapp\.com|wa\.me)$/, "whatsapp"],
  [/(^|\.)(t\.me|telegram\.org)$/, "telegram"],
  [/(^|\.)instagram\.com$/, "instagram"],
];

// Asal kunjungan: parameter ?src= dari tombol bagikan lebih dulu, lalu host Referer,
// lalu "direct". Referer dari situs sendiri dianggap langsung.
export function viewSource(src: string, referrer: string, ownHost: string): string {
  const s = src.trim().toLowerCase();
  if ((SHARE_SOURCES as readonly string[]).includes(s)) return s;
  let host = "";
  try {
    host = referrer === "" ? "" : new URL(referrer).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    host = "";
  }
  if (host === "") return "direct";
  if (host === ownHost.replace(/^www\./, "")) return "direct";
  for (const [re, name] of REFERRER_SOURCES) {
    if (re.test(host)) return name;
  }
  return host.slice(0, 60);
}

// Robot, pratinjau tautan, dan alat baris perintah tidak dihitung sebagai pembaca.
const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|discord|skype|embedly|headless|lighthouse|curl|wget|python|httpclient|axios|node-fetch|go-http|java\//i;

export function isBot(userAgent: string): boolean {
  if (userAgent.trim() === "") return true;
  return BOT.test(userAgent);
}

export function deviceOf(userAgent: string): "mobile" | "desktop" {
  return /mobi|android|iphone|ipod|ipad/i.test(userAgent) ? "mobile" : "desktop";
}

// Tanggal hari ini di WIB (YYYY-MM-DD). Satu pengunjung dihitung sekali per tulisan per hari ini.
export function wibDay(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}
