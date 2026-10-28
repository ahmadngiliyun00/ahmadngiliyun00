import "server-only";
import { createHash } from "node:crypto";
import nodemailer from "nodemailer";
import type { MailSettings } from "@/content/types";
import { getSetting } from "@/server/content";

// Pengiriman email lewat SMTP (misalnya Gmail dengan sandi aplikasi, Zoho, atau SMTP Resend).
// Pengaturannya diisi di CMS (Pengaturan, Email dan SMTP) dan disimpan di database.
// Bila SMTP belum diatur, pengiriman dilewati dan pesan tetap tersimpan di kotak masuk CMS.

type MailConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
  to: string;
};

async function config(): Promise<MailConfig | null> {
  let saved: MailSettings | undefined;
  try {
    saved = await getSetting<MailSettings>("mail");
  } catch (err) {
    console.error("[mail] Gagal membaca pengaturan SMTP", err instanceof Error ? err.message : err);
    return null;
  }
  const smtp = saved?.smtp ?? {};
  const host = smtp.host ?? "";
  const user = smtp.user ?? "";
  const pass = smtp.pass ?? "";
  const to = saved?.contactTo ?? "";
  if (host === "" || user === "" || pass === "" || to === "") return null;
  // Port 465 memakai TLS langsung; port 587 memakai STARTTLS (secure false).
  const security = smtp.security ?? (smtp.port === 587 ? "starttls" : "ssl");
  const port = smtp.port ?? (security === "starttls" ? 587 : 465);
  return { host, port, secure: security === "ssl", user, pass, from: smtp.from || user, to };
}

export async function mailConfigured(): Promise<boolean> {
  return (await config()) !== null;
}

type Transport = ReturnType<typeof nodemailer.createTransport>;
const globalForMail = globalThis as unknown as { transport?: { key: string; t: Transport } };

// Transport dipakai ulang selama pengaturan SMTP sama; dibuat baru setelah diubah di CMS.
function transport(cfg: MailConfig): Transport {
  const key = createHash("sha256").update(JSON.stringify([cfg.host, cfg.port, cfg.secure, cfg.user, cfg.pass])).digest("hex");
  const cached = globalForMail.transport;
  if (cached) {
    if (cached.key === key) return cached.t;
    cached.t.close();
  }
  const t = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: { user: cfg.user, pass: cfg.pass },
  });
  globalForMail.transport = { key, t };
  return t;
}

// Kirim email uji ke penerima notifikasi. Dipanggil dari tombol di halaman pengaturan.
export async function sendTestMail(): Promise<{ ok: boolean; message: string }> {
  const cfg = await config();
  if (cfg === null) return { ok: false, message: "SMTP belum lengkap. Isi server, pengguna, sandi, dan penerima, lalu simpan." };
  try {
    await transport(cfg).sendMail({
      from: cfg.from,
      to: cfg.to,
      subject: "[ngiliyun.my.id] Email uji dari CMS",
      text: "Pengaturan SMTP berfungsi. Pesan baru dari form kontak akan diteruskan ke alamat ini.",
    });
    return { ok: true, message: `Email uji terkirim ke ${cfg.to}. Periksa kotak masuk (dan folder spam).` };
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return { ok: false, message: `Gagal mengirim: ${detail}` };
  }
}

export type ContactMail = {
  id: number;
  name: string;
  email: string;
  topic: string;
  body: string;
  lang: "id" | "en";
};

// Kirim notifikasi pesan baru ke Mas Ilyun. Reply-To diisi email pengunjung,
// jadi tombol Balas di aplikasi email langsung menuju pengirim.
export async function sendContactNotification(msg: ContactMail): Promise<boolean> {
  const cfg = await config();
  if (cfg === null) return false;
  const site = process.env.SITE_URL ?? "";
  const inbox = site === "" ? "" : `${site.replace(/\/$/, "")}/admin/pesan/`;
  const text = [
    `Pesan baru dari form kontak ngiliyun.my.id (${msg.lang === "en" ? "versi Inggris" : "versi Indonesia"}).`,
    "",
    `Nama  : ${msg.name}`,
    `Email : ${msg.email}`,
    `Topik : ${msg.topic}`,
    "",
    msg.body,
    "",
    "--",
    "Balas email ini untuk menjawab langsung ke pengirim.",
    inbox === "" ? "" : `Kotak masuk CMS: ${inbox}`,
  ].join("\n");
  try {
    await transport(cfg).sendMail({
      from: cfg.from,
      to: cfg.to,
      replyTo: { name: msg.name, address: msg.email },
      subject: `[ngiliyun.my.id] ${msg.topic} - ${msg.name}`,
      text,
    });
    return true;
  } catch (err) {
    console.error("[mail] Gagal mengirim notifikasi pesan", msg.id, err instanceof Error ? err.message : err);
    return false;
  }
}
