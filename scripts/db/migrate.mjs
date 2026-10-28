// Menerapkan migrasi di folder drizzle/ ke database.
// Jalankan: npm run db:migrate  (aman diulang, migrasi yang sudah diterapkan dilewati)

import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import mysql from "mysql2/promise";
import { loadEnv } from "./env.mjs";

loadEnv();
const conn = await mysql.createConnection({ uri: process.env.DATABASE_URL, multipleStatements: true });
try {
  await migrate(drizzle(conn), { migrationsFolder: "./drizzle" });
  console.log("[db] migrasi selesai");
} finally {
  await conn.end();
}
