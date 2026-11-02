// Langkah sebelum build (script "prebuild"): ambil data GitHub, lalu buat ulang gambar README
// dan, bila DATABASE_URL tersedia, bagian teks README dari konten public di database.
// Validasi konten kini terjadi di formulir CMS saat menyimpan.

import { checkDependencies } from "./check-deps.mjs";
import { loadEnvQuiet } from "./db/env.mjs";

// Paling awal: paket baru dari git pull wajib sudah dipasang (npm ci), kalau tidak build berhenti
// di sini dengan pesan jelas, sebelum README, data GitHub, atau folder .next disentuh.
checkDependencies();
loadEnvQuiet();
await import("./fetch-github.mjs");
