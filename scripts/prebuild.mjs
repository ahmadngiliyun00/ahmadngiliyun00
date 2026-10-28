// Langkah sebelum build, dijalankan berurutan oleh "npm run build" (script "prebuild"):
//   1. Validasi data capaian. Build berhenti bila ada galat.
//   2. Ambil data GitHub, lalu buat ulang gambar dan bagian teks README.
//   3. Thumbnail sertifikat dari PDF (opsional, dilewati bila alat tidak tersedia).
// Satu skrip Node dipakai sebagai pengganti rangkaian perintah shell, sesuai aturan gaya proyek.

import { checkAchievements } from "./check-achievements.mjs";

const { errors, warnings } = await checkAchievements();
for (const w of warnings) console.warn(`[capaian] peringatan: ${w}`);
if (errors.length > 0) {
  for (const e of errors) console.error(`[capaian] galat: ${e}`);
  console.error(`[capaian] ${errors.length} galat. Build dihentikan. Jalankan npm run check:achievements untuk detail.`);
  process.exit(1);
}
console.log("[capaian] data capaian lulus validasi");

await import("./fetch-github.mjs");

try {
  const { renderThumbnails } = await import("./thumbnails.mjs");
  await renderThumbnails();
} catch (err) {
  console.warn(`[thumbnail] dilewati (${err.message})`);
}
