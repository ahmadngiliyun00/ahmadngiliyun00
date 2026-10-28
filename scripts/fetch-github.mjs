// Mengambil data publik GitHub untuk situs: profil, repositori, dan grafik kontribusi.
// Dijalankan otomatis sebelum build (script "prebuild"), atau manual: npm run data
//
// Jika ada bagian yang gagal diambil (offline, rate limit, struktur HTML GitHub berubah),
// bagian itu memakai data lama di src/data/github.json, jadi build tidak pernah gagal karena skrip ini.
// Opsional: set GITHUB_TOKEN agar batas rate limit API lebih longgar.

import { readFile, writeFile } from "node:fs/promises";
import { renderReadmeAssets } from "./readme-assets.mjs";

const USER = "ahmadngiliyun00";
const OUT = new URL("../src/data/github.json", import.meta.url);
const TIMEOUT_MS = 15000;

async function request(url, { accept, useToken }) {
  const headers = { "User-Agent": "ngiliyun-portfolio-build", Accept: accept };
  const token = process.env.GITHUB_TOKEN;
  if (useToken) {
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(url, { headers, signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} pada ${url}`);
  return res;
}

async function fetchUser() {
  const res = await request(`https://api.github.com/users/${USER}`, {
    accept: "application/vnd.github+json",
    useToken: true,
  });
  const u = await res.json();
  return {
    login: u.login,
    publicRepos: u.public_repos,
    followers: u.followers,
    createdAt: u.created_at,
  };
}

async function fetchRepos() {
  const url = new URL(`https://api.github.com/users/${USER}/repos`);
  url.searchParams.set("per_page", "100");
  url.searchParams.set("sort", "pushed");
  const res = await request(url, { accept: "application/vnd.github+json", useToken: true });
  const list = await res.json();
  if (!Array.isArray(list)) throw new Error("Respons repositori bukan array");
  return list
    .filter((r) => (r.fork ? false : !r.archived))
    .map((r) => ({
      name: r.name,
      description: r.description ?? "",
      language: r.language ?? "",
      stars: r.stargazers_count,
      pushedAt: r.pushed_at,
      url: r.html_url,
      homepage: r.homepage ?? "",
      topics: r.topics ?? [],
    }))
    .sort((a, b) => (a.pushedAt < b.pushedAt ? 1 : -1));
}

function attr(tag, name) {
  const m = tag.match(new RegExp(`${name}="([^"]*)"`));
  return m ? m[1] : "";
}

async function fetchContributions() {
  const res = await request(`https://github.com/users/${USER}/contributions`, {
    accept: "text/html",
    useToken: false,
  });
  const html = await res.text();

  const byId = new Map();
  for (const m of html.matchAll(/<td[^>]*data-date="[^"]*"[^>]*>/g)) {
    const tag = m[0];
    const id = attr(tag, "id");
    const date = attr(tag, "data-date");
    if (id) byId.set(id, { date, count: 0 });
  }

  for (const m of html.matchAll(/<tool-tip[^>]*for="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
    const day = byId.get(m[1]);
    if (!day) continue;
    const n = m[2].trim().match(/^([0-9,]+) contributions?/);
    day.count = n ? Number(n[1].replace(/,/g, "")) : 0;
  }

  const days = [...byId.values()]
    .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d.date))
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .map((d) => [d.date, d.count]);

  if (days.length < 300) throw new Error(`Hanya ${days.length} hari terbaca, struktur HTML mungkin berubah`);
  const total = days.reduce((sum, d) => sum + d[1], 0);
  return { total, days };
}

async function readOld() {
  try {
    return JSON.parse(await readFile(OUT, "utf8"));
  } catch {
    return null;
  }
}

async function attempt(label, fn, fallback) {
  try {
    const value = await fn();
    console.log(`[github] ${label}: diperbarui`);
    return { value, fresh: true };
  } catch (err) {
    console.warn(`[github] ${label}: gagal (${err.message}), memakai data lama`);
    return { value: fallback, fresh: false };
  }
}

const old = await readOld();
const [user, repos, contributions] = await Promise.all([
  attempt("profil", fetchUser, old ? old.user : null),
  attempt("repositori", fetchRepos, old ? old.repos : []),
  attempt("kontribusi", fetchContributions, old ? old.contributions : null),
]);

const anyFresh = [user, repos, contributions].some((r) => r.fresh);
if (!anyFresh) {
  console.warn("[github] tidak ada data baru, file tidak diubah");
} else if (user.value === null) {
  console.warn("[github] data profil belum pernah ada, file tidak ditulis");
} else if (contributions.value === null) {
  console.warn("[github] data kontribusi belum pernah ada, file tidak ditulis");
} else {
  const data = {
    fetchedAt: new Date().toISOString(),
    user: user.value,
    repos: repos.value,
    contributions: contributions.value,
  };
  await writeFile(OUT, JSON.stringify(data, null, 1) + "\n");
  console.log(`[github] tersimpan: ${data.contributions.total} kontribusi, ${data.repos.length} repositori`);
}

// Gambar README profil ikut diperbarui dari data terbaru. Kegagalan di sini tidak menghentikan build.
try {
  await renderReadmeAssets();
} catch (err) {
  console.warn(`[readme] gagal membuat gambar README (${err.message})`);
}
