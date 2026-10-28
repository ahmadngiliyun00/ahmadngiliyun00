// Memuat .env.local (pengembangan) atau .env.production.local (server) untuk skrip Node.
// Variabel yang sudah ada di environment tidak ditimpa.
export function loadEnv() {
  for (const file of [".env.production.local", ".env.local"]) {
    try {
      process.loadEnvFile(file);
    } catch {
      // berkas tidak ada, lanjut
    }
  }
  if (!process.env.DATABASE_URL) {
    console.error("[db] DATABASE_URL belum diatur. Salin .env.example ke .env.local lalu isi.");
    process.exit(1);
  }
}

// Seperti loadEnv, tetapi tidak menghentikan proses bila DATABASE_URL kosong.
export function loadEnvQuiet() {
  for (const file of [".env.production.local", ".env.local"]) {
    try {
      process.loadEnvFile(file);
    } catch {
      // berkas tidak ada, lanjut
    }
  }
}
