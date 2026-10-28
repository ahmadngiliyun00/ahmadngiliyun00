import raw from "@/data/github.json";
import { recentRepos, type Lang } from "@/data/profile";

type RawRepo = {
  name: string;
  description: string;
  language: string;
  stars: number;
  pushedAt: string;
  url: string;
  homepage: string;
  topics: string[];
};

type RawData = {
  fetchedAt: string;
  user: { login: string; publicRepos: number; followers: number; createdAt: string };
  repos: RawRepo[];
  contributions: { total: number; days: [string, number][] };
};

const data = raw as unknown as RawData;

export type Level = 0 | 1 | 2 | 3 | 4;
export type Cell = { date: string; count: number; level: Level } | null;

export type ContributionModel = {
  weeks: Cell[][];
  months: { col: number; label: string }[];
  total: number;
  activeDays: number;
  longestStreak: number;
  busiest: { date: string; count: number };
};

function quantile(sorted: number[], q: number) {
  if (sorted.length === 0) return 0;
  const i = Math.min(sorted.length - 1, Math.floor(q * sorted.length));
  return sorted[i];
}

function dayOfWeek(date: string) {
  return new Date(`${date}T00:00:00Z`).getUTCDay();
}

export function formatDate(date: string, lang: Lang, withYear = true) {
  return new Intl.DateTimeFormat(lang === "id" ? "id-ID" : "en-GB", {
    day: "numeric",
    month: "long",
    year: withYear ? "numeric" : undefined,
    timeZone: "UTC",
  }).format(new Date(`${date.slice(0, 10)}T00:00:00Z`));
}

export function formatMonthYear(date: string, lang: Lang) {
  return new Intl.DateTimeFormat(lang === "id" ? "id-ID" : "en-GB", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date.slice(0, 10)}T00:00:00Z`));
}

export function formatNumber(n: number, lang: Lang) {
  return new Intl.NumberFormat(lang === "id" ? "id-ID" : "en-US").format(n);
}

export function getContributionModel(lang: Lang): ContributionModel {
  const days = data.contributions.days;
  const nonZero = days
    .map((d) => d[1])
    .filter((c) => c > 0)
    .sort((a, b) => a - b);
  const q1 = quantile(nonZero, 0.25);
  const q2 = quantile(nonZero, 0.5);
  const q3 = quantile(nonZero, 0.75);

  const levelOf = (c: number): Level => {
    if (c <= 0) return 0;
    if (c <= q1) return 1;
    if (c <= q2) return 2;
    if (c <= q3) return 3;
    return 4;
  };

  // Kolom dimulai hari Minggu, seperti grafik GitHub.
  const weeks: Cell[][] = [];
  let week: Cell[] = new Array(dayOfWeek(days[0][0])).fill(null);
  for (const [date, count] of days) {
    week.push({ date, count, level: levelOf(count) });
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  const monthFmt = new Intl.DateTimeFormat(lang === "id" ? "id-ID" : "en-GB", {
    month: "short",
    timeZone: "UTC",
  });
  const months: { col: number; label: string }[] = [];
  let lastMonth = "";
  weeks.forEach((w, col) => {
    const first = w.find((c) => c !== null);
    if (!first) return;
    const m = first.date.slice(0, 7);
    if (m !== lastMonth) {
      lastMonth = m;
      // Lewati label pertama bila kolomnya terlalu dekat dengan label berikutnya.
      months.push({ col, label: monthFmt.format(new Date(`${first.date}T00:00:00Z`)) });
    }
  });
  const cleanedMonths = months.filter((m, i) => {
    const next = months[i + 1];
    return next ? next.col - m.col >= 3 : true;
  });

  let longest = 0;
  let run = 0;
  let busiest = { date: days[0][0], count: 0 };
  for (const [date, count] of days) {
    if (count > 0) {
      run += 1;
      longest = Math.max(longest, run);
    } else {
      run = 0;
    }
    if (count > busiest.count) busiest = { date, count };
  }

  return {
    weeks,
    months: cleanedMonths,
    total: data.contributions.total,
    activeDays: nonZero.length,
    longestStreak: longest,
    busiest,
  };
}

export function getGithubMeta() {
  return {
    fetchedAt: data.fetchedAt,
    publicRepos: data.user.publicRepos,
    sinceYear: Number(data.user.createdAt.slice(0, 4)),
    profileUrl: `https://github.com/${data.user.login}`,
  };
}

export type RecentRepo = {
  name: string;
  description: string;
  language: string;
  pushedAt: string;
  url: string;
  homepage: string;
  homepageIsRelease: boolean;
};

// Deskripsi repositori datang dari GitHub, jadi dirapikan agar sesuai aturan gaya situs:
// em dash (U+2014) menjadi tanda hubung, ampersand (U+0026) menjadi kata "dan".
const EM_DASH = new RegExp(`\\s*${String.fromCharCode(0x2014)}\\s*`, "g");
const AMPERSAND = new RegExp(`\\s*${String.fromCharCode(0x26)}\\s*`, "g");

function tidy(text: string) {
  return text.replace(EM_DASH, " - ").replace(AMPERSAND, " dan ").trim();
}

// featuredRepoUrls: repositori proyek unggulan, tidak diulang di daftar terbaru.
export function getRecentRepos(featuredRepoUrls: string[]): RecentRepo[] {
  const featuredRepos = new Set(featuredRepoUrls.map((u) => u.toLowerCase()));
  const excluded = new Set(recentRepos.exclude.map((n) => n.toLowerCase()));

  return data.repos
    .filter((r) => {
      if (r.description.trim() === "") return false;
      if (excluded.has(r.name.toLowerCase())) return false;
      return !featuredRepos.has(r.url.toLowerCase());
    })
    .slice(0, recentRepos.limit)
    .map((r) => ({
      name: r.name,
      description: tidy(r.description),
      language: r.language,
      pushedAt: r.pushedAt,
      url: r.url,
      homepage: r.homepage,
      homepageIsRelease: r.homepage.startsWith("https://github.com/"),
    }));
}

// Warna titik bahasa, mengikuti konvensi GitHub agar mudah dikenali.
export const languageColors: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  "Jupyter Notebook": "#DA5B0B",
  CSS: "#663399",
  HTML: "#e34c26",
  PHP: "#4F5D95",
  Dart: "#00B4AB",
};
