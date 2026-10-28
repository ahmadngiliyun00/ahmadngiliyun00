// Membuat thumbnail WebP dari halaman pertama setiap PDF di public/sertifikat/.
// Hasil: public/sertifikat/thumbs/<nama>.webp, dipakai halaman detail sebagai pratinjau.
// Opsional: butuh pdftoppm (poppler) dan ImageMagick (magick) atau cwebp.
// Bila alat tidak ada atau folder kosong, skrip berhenti dengan tenang dan situs tetap jalan tanpa thumbnail.
// Jalankan manual: npm run thumbs

import { execFile } from "node:child_process";
import { mkdir, readdir, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";

const run = promisify(execFile);
const DIR = fileURLToPath(new URL("../public/sertifikat/", import.meta.url));
const THUMBS = join(DIR, "thumbs");

async function has(cmd) {
  try {
    await run("which", [cmd]);
    return true;
  } catch {
    return false;
  }
}

async function mtime(path) {
  try {
    return (await stat(path)).mtimeMs;
  } catch {
    return 0;
  }
}

export async function renderThumbnails() {
  let files = [];
  try {
    files = (await readdir(DIR)).filter((f) => f.toLowerCase().endsWith(".pdf"));
  } catch {
    console.log("[thumbnail] folder public/sertifikat belum ada, dilewati");
    return;
  }
  if (files.length === 0) {
    console.log("[thumbnail] tidak ada PDF, dilewati");
    return;
  }
  if (!(await has("pdftoppm"))) {
    console.log("[thumbnail] pdftoppm tidak tersedia, dilewati");
    return;
  }
  const magick = await has("magick");
  const cwebp = magick ? false : await has("cwebp");
  if (!magick) {
    if (!cwebp) {
      console.log("[thumbnail] magick atau cwebp tidak tersedia, dilewati");
      return;
    }
  }

  await mkdir(THUMBS, { recursive: true });
  let made = 0;
  for (const file of files) {
    const base = file.replace(/\.pdf$/i, "");
    const src = join(DIR, file);
    const out = join(THUMBS, `${base}.webp`);
    if ((await mtime(out)) >= (await mtime(src))) continue;
    const prefix = join(tmpdir(), `thumb-${base}-${process.pid}`);
    await run("pdftoppm", ["-png", "-f", "1", "-l", "1", "-singlefile", "-scale-to", "1200", src, prefix]);
    const png = `${prefix}.png`;
    if (magick) await run("magick", [png, "-quality", "80", out]);
    else await run("cwebp", ["-q", "80", png, "-o", out]);
    await rm(png, { force: true });
    made += 1;
  }
  console.log(`[thumbnail] ${made} thumbnail dibuat, ${files.length - made} sudah terbaru`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await renderThumbnails();
}
