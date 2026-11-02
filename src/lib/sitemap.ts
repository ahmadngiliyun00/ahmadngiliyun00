// Aturan murni sitemap.xml, dipakai src/app/sitemap.ts dan diuji tests/sitemap.test.mjs.
// Format disamakan dengan sitemap yang sudah terbukti dibaca Search Console: lastmod W3C
// Datetime tanpa milidetik dengan zona waktu WIB (misalnya 2026-11-02T23:21:28+07:00), serta
// changefreq dan priority (diabaikan Google, dipakai Bing dan mesin pencari lain).

export type ChangeFrequency = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

// Tanggal W3C Datetime dalam WIB, tanpa milidetik. Tanggal tidak sah menjadi undefined
// (elemen lastmod dihilangkan, lebih baik daripada tanggal salah).
export function w3cDate(value: Date | string | number | undefined): string | undefined {
  if (value === undefined) return undefined;
  const ms = value instanceof Date ? value.getTime() : typeof value === "number" ? value : Date.parse(value);
  if (!Number.isFinite(ms)) return undefined;
  const d = new Date(ms + WIB_OFFSET_MS);
  return (
    `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}+07:00`
  );
}

// Bobot per jenis halaman, relatif di dalam situs ini saja.
export const SITEMAP_RULES = {
  home: { changeFrequency: "weekly", priority: 1.0 },
  inner: { changeFrequency: "weekly", priority: 0.8 },
  archive: { changeFrequency: "weekly", priority: 0.7 },
  post: { changeFrequency: "monthly", priority: 0.6 },
  detail: { changeFrequency: "monthly", priority: 0.5 },
} as const satisfies Record<string, { changeFrequency: ChangeFrequency; priority: number }>;
