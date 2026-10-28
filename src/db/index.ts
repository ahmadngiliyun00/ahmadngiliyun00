import "server-only";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "@/db/schema";

// Satu pool koneksi per proses. Di mode dev, pool disimpan di globalThis supaya
// hot reload tidak membuka koneksi baru setiap kali berkas berubah.
// Bila DATABASE_URL berubah (misalnya .env.local diedit saat dev berjalan), pool lama ditutup dan dibuat ulang.
const globalForDb = globalThis as unknown as { pool?: mysql.Pool; poolUrl?: string };

function createPool(url: string) {
  return mysql.createPool({ uri: url, connectionLimit: 8, timezone: "Z", charset: "utf8mb4" });
}

function getPool(): mysql.Pool {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL belum diatur. Salin .env.example ke .env.local lalu isi.");
  if (globalForDb.pool) {
    if (globalForDb.poolUrl === url) return globalForDb.pool;
    void globalForDb.pool.end().catch(() => undefined);
  }
  const fresh = createPool(url);
  if (process.env.NODE_ENV !== "production") {
    globalForDb.pool = fresh;
    globalForDb.poolUrl = url;
  }
  return fresh;
}

const pool = getPool();

export const db = drizzle(pool, { schema, mode: "default" });
