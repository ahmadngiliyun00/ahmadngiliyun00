// Membuat atau memperbarui akun admin CMS (login email dan kata sandi).
// Jalankan: npm run admin:create -- --email ahmad@contoh.id --name "Ahmad Ngiliyun"
// Kata sandi diminta tanpa ditampilkan di layar. Untuk otomasi, isi lewat variabel ADMIN_PASSWORD.
// Bila email sudah ada, kata sandinya diganti (berguna untuk reset kata sandi).

import { randomBytes, scrypt as scryptCb } from "node:crypto";
import { promisify } from "node:util";
import mysql from "mysql2/promise";
import { loadEnv } from "./env.mjs";

const scrypt = promisify(scryptCb);
loadEnv();

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? "" : (process.argv[i + 1] ?? "");
}

function askHidden(question) {
  return new Promise((resolve) => {
    const { stdin, stdout } = process;
    stdout.write(question);
    let value = "";
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    const onData = (ch) => {
      if (ch === "\r" || ch === "\n") {
        stdin.setRawMode(false);
        stdin.pause();
        stdin.off("data", onData);
        stdout.write("\n");
        resolve(value);
      } else if (ch === "\u0003") {
        process.exit(1);
      } else if (ch === "\u007f") {
        value = value.slice(0, -1);
      } else {
        value += ch;
      }
    };
    stdin.on("data", onData);
  });
}

// Format sama dengan src/server/auth/password.ts: scrypt$N$r$p$salt$hash
async function hashPassword(password) {
  const N = 16384;
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, 64, { N, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  return ["scrypt", N, 8, 1, salt.toString("base64"), key.toString("base64")].join("$");
}

const email = arg("email").trim().toLowerCase();
const name = arg("name").trim() || "Admin";
if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
  console.error('Pakai: npm run admin:create -- --email nama@domain --name "Nama"');
  process.exit(1);
}

let password = process.env.ADMIN_PASSWORD ?? "";
if (password === "") {
  password = await askHidden("Kata sandi (minimal 12 karakter): ");
  const again = await askHidden("Ulangi kata sandi: ");
  if (password !== again) {
    console.error("Kata sandi tidak sama.");
    process.exit(1);
  }
}
if (password.length < 12) {
  console.error("Kata sandi minimal 12 karakter.");
  process.exit(1);
}

const hash = await hashPassword(password);
const conn = await mysql.createConnection({ uri: process.env.DATABASE_URL, timezone: "Z" });
try {
  const [rows] = await conn.query("SELECT id FROM admins WHERE email = ?", [email]);
  if (rows.length > 0) {
    await conn.query("UPDATE admins SET password_hash = ?, name = ?, active = 1 WHERE id = ?", [hash, name, rows[0].id]);
    await conn.query("DELETE FROM sessions WHERE admin_id = ?", [rows[0].id]);
    console.log(`[admin] kata sandi ${email} diperbarui, semua sesi lamanya dikeluarkan`);
  } else {
    await conn.query("INSERT INTO admins (name, email, password_hash, active, created_at) VALUES (?, ?, ?, 1, ?)", [
      name,
      email,
      hash,
      new Date(),
    ]);
    console.log(`[admin] akun ${email} dibuat`);
  }
} finally {
  await conn.end();
}
