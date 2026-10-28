import "server-only";
import nodemailer from "nodemailer";

// Pengiriman email lewat SMTP (misalnya Gmail dengan sandi aplikasi, Zoho, atau SMTP Resend).
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

function config(): MailConfig | null {
  const host = process.env.SMTP_HOST ?? "";
  const user = process.env.SMTP_USER ?? "";
  const pass = process.env.SMTP_PASS ?? "";
  const to = process.env.CONTACT_TO ?? "";
  if (host === "" || user === "" || pass === "" || to === "") return null;
  const port = Number(process.env.SMTP_PORT ?? "465");
  return {
    host,
    port: Number.isInteger(port) ? port : 465,
    // Port 465 memakai TLS langsung; port 587 memakai STARTTLS (secure false).
    secure: (process.env.SMTP_SECURE ?? (port === 465 ? "true" : "false")) === "true",
    user,
    pass,
    from: process.env.MAIL_FROM ?? user,
    to,
  };
}

export function mailConfigured(): boolean {
  return config() !== null;
}

type Transport = ReturnType<typeof nodemailer.createTransport>;
const globalForMail = globalThis as unknown as { transport?: Transport };

function transport(cfg: MailConfig): Transport {
  if (globalForMail.transport) return globalForMail.transport;
  const t = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: { user: cfg.user, pass: cfg.pass },
  });
  globalForMail.transport = t;
  return t;
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
  const cfg = config();
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
