// Memeriksa bahwa semua paket di package.json sudah terpasang di node_modules dengan versi yang
// sama seperti package-lock.json. Dijalankan paling awal di prebuild, supaya build tidak gagal di
// tengah jalan dengan pesan "Module not found" ketika `git pull` membawa paket baru tetapi
// `npm ci` lupa dijalankan. Skrip ini hanya membaca, tidak memasang apa pun.

import { readFileSync } from "node:fs";

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

// Daftar masalah: paket yang belum terpasang atau versinya berbeda dari package-lock.json.
export function dependencyProblems(root = ".") {
  const pkg = readJson(`${root}/package.json`);
  if (pkg === null) return [];
  const lock = readJson(`${root}/package-lock.json`);
  const names = [...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.devDependencies ?? {})];
  const problems = [];
  for (const name of names) {
    const installed = readJson(`${root}/node_modules/${name}/package.json`);
    const wanted = lock?.packages?.[`node_modules/${name}`]?.version;
    if (installed === null) problems.push(`${name} belum terpasang`);
    else if (wanted !== undefined) {
      if (installed.version !== wanted) problems.push(`${name} terpasang ${installed.version}, seharusnya ${wanted}`);
    }
  }
  return problems;
}

export function checkDependencies() {
  const problems = dependencyProblems();
  if (problems.length === 0) return;
  console.error("[deps] Paket di node_modules tidak sesuai package-lock.json:");
  for (const p of problems) console.error(`[deps]   - ${p}`);
  console.error("[deps] Jalankan `npm ci` lalu ulangi `npm run build`. Build dihentikan sebelum mengubah apa pun.");
  process.exit(1);
}
