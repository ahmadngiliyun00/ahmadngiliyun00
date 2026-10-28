import { defineConfig } from "drizzle-kit";

// drizzle-kit tidak membaca .env.local sendiri.
try {
  process.loadEnvFile(".env.local");
} catch {
  // Di server produksi, DATABASE_URL biasanya sudah ada di environment.
}

export default defineConfig({
  dialect: "mysql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
});
