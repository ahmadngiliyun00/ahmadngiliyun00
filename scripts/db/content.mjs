// Membaca konten PUBLIC dari database untuk skrip Node (misalnya pembangkit README).
// Item private tidak pernah dibaca di sini.

import mysql from "mysql2/promise";

export async function loadPublicContent() {
  const conn = await mysql.createConnection({ uri: process.env.DATABASE_URL, timezone: "Z", charset: "utf8mb4" });
  try {
    const [rows] = await conn.query(
      "SELECT collection, slug, data FROM entries WHERE visibility = 'public' ORDER BY position, id",
    );
    const [sets] = await conn.query("SELECT `key`, value FROM settings WHERE `key` IN ('profile', 'metrics')");
    const parse = (v) => (typeof v === "string" ? JSON.parse(v) : v);
    const by = {};
    for (const r of rows) {
      (by[r.collection] ??= []).push({ slug: r.slug, data: parse(r.data) });
    }
    const settings = Object.fromEntries(sets.map((s) => [s.key, parse(s.value)]));
    return { by, profile: settings.profile, metrics: settings.metrics };
  } finally {
    await conn.end();
  }
}
