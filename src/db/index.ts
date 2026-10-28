import "server-only";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "@/db/schema";

// Satu pool koneksi per proses. Di mode dev, pool disimpan di globalThis supaya
// hot reload tidak membuka koneksi baru setiap kali berkas berubah.
const globalForDb = globalThis as unknown as { pool?: mysql.Pool };

function createPool() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL belum diatur. Salin .env.example ke .env.local lalu isi.");
  return mysql.createPool({ uri: url, connectionLimit: 8, timezone: "Z", charset: "utf8mb4" });
}

const pool = globalForDb.pool ?? createPool();
if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;

export const db = drizzle(pool, { schema, mode: "default" });
