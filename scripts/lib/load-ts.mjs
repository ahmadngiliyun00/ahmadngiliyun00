// Memuat berkas TypeScript data (misalnya src/data/achievements.ts) dari skrip Node biasa.
// Berkas ditranspilasi dengan paket "typescript" yang sudah ada di devDependencies,
// jadi skrip tetap jalan di Node 20 maupun 22 tanpa dependensi tambahan.
//
// Batasan: berkas yang dimuat hanya boleh berisi impor tipe (import type ...),
// karena hasil transpilasi dimuat sebagai modul data: URL tanpa akses ke berkas lain.

import { readFile } from "node:fs/promises";
import ts from "typescript";

const cache = new Map();

export async function importTs(fileUrl) {
  const key = String(fileUrl);
  const hit = cache.get(key);
  if (hit) return hit;

  const source = await readFile(fileUrl, "utf8");
  const out = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      verbatimModuleSyntax: false,
    },
    fileName: key,
  });

  if (/^\s*import\s+(?!type\b)/m.test(out.outputText)) {
    throw new Error(`${key} memuat impor nilai. Pakai "import type" saja agar bisa dibaca skrip.`);
  }

  const url = `data:text/javascript;base64,${Buffer.from(out.outputText).toString("base64")}`;
  const mod = await import(url);
  cache.set(key, mod);
  return mod;
}
