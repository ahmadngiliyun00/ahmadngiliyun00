// Langkah sebelum build (script "prebuild"): ambil data GitHub, lalu buat ulang gambar README
// dan, bila DATABASE_URL tersedia, bagian teks README dari konten public di database.
// Validasi konten kini terjadi di formulir CMS saat menyimpan.

import { loadEnvQuiet } from "./db/env.mjs";

loadEnvQuiet();
await import("./fetch-github.mjs");
