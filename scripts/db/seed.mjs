// Mengisi database dari data awal di folder seed/ (dipakai sekali saat pertama kali memasang CMS).
// Jalankan: npm run db:seed
// Bila tabel entries sudah berisi, skrip berhenti supaya isian dari CMS tidak tertimpa.
// Tambahkan --force untuk MENGHAPUS semua konten dan pengaturan lalu mengisi ulang dari seed/.

import mysql from "mysql2/promise";
import { importTs } from "../lib/load-ts.mjs";
import { loadEnv } from "./env.mjs";

loadEnv();
const force = process.argv.includes("--force");
const root = new URL("../../", import.meta.url);
const { achievements } = await importTs(new URL("seed/achievements.ts", root));
const { metrics } = await importTs(new URL("seed/metrics.ts", root));
const p = await importTs(new URL("seed/profile.ts", root));

function slugify(text) {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

const rows = [];
const add = (collection, slug, data, visibility = "public") => {
  rows.push({ collection, slug, data, visibility, position: rows.filter((r) => r.collection === collection).length * 10 });
};

for (const a of achievements) {
  const { id, visibility, ...data } = a;
  add("achievement", id, data, visibility);
}
for (const f of p.featured) add("project", slugify(f.name), f);
for (const s of p.systems) {
  const { visibility, ...data } = s;
  add("system", slugify(s.name), data, visibility);
}
for (const inst of p.teaching) {
  const { slug, courses, ...data } = inst;
  add("institution", slug, data);
  for (const c of courses) add("course", slugify(`${slug}-${c.name.id}`), { institution: slug, ...c });
}
for (const [code, label] of Object.entries(p.terms)) add("term", code, { code, label, current: code === p.currentTerm });
for (const f of p.teachingFocus) add("focus", slugify(f.title.id), f);
for (const m of p.journey) add("milestone", slugify(`${m.when.id}-${m.title.id}`), m);
for (const a of p.areas) add("area", a.icon, a);
for (const c of p.contributions) add("contribution", slugify(c.title.id), c);
for (const c of p.collabs) add("collab", slugify(c.title.id), c);
for (const c of p.channels) add("channel", slugify(c.label), c);

const conn = await mysql.createConnection({ uri: process.env.DATABASE_URL, timezone: "Z", charset: "utf8mb4" });
try {
  const [[{ n }]] = await conn.query("SELECT COUNT(*) AS n FROM entries");
  if (n > 0) {
    if (!force) {
      console.error(`[seed] tabel entries sudah berisi ${n} baris. Tidak ada yang diubah.`);
      console.error("[seed] Pakai --force untuk menghapus semua konten dan mengisi ulang dari seed/.");
      process.exit(1);
    }
  }
  await conn.beginTransaction();
  if (force) {
    await conn.query("DELETE FROM entries");
    await conn.query("DELETE FROM settings");
  }
  const now = new Date();
  for (const r of rows) {
    await conn.query(
      "INSERT INTO entries (collection, slug, visibility, position, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [r.collection, r.slug, r.visibility, r.position, JSON.stringify(r.data), now, now],
    );
  }
  for (const [key, value] of [["profile", p.profile], ["metrics", metrics]]) {
    await conn.query("INSERT INTO settings (`key`, value, updated_at) VALUES (?, ?, ?)", [key, JSON.stringify(value), now]);
  }
  await conn.commit();
  const counts = {};
  for (const r of rows) counts[r.collection] = (counts[r.collection] ?? 0) + 1;
  console.log(`[seed] ${rows.length} baris konten dan 2 pengaturan dimasukkan:`, counts);
} catch (err) {
  await conn.rollback();
  throw err;
} finally {
  await conn.end();
}
