import "server-only";
import { createHash } from "node:crypto";
import nodemailer from "nodemailer";
import type { MailSettings } from "@/content/types";
import { renderMail } from "@/lib/mail-template";
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
  bcc: string[]; // salinan tersembunyi, misalnya email pribadi
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
  const bcc = (saved?.contactCopy ?? []).filter((a) => a.toLowerCase() !== to.toLowerCase());
  return { host, port, secure: security === "ssl", user, pass, from: smtp.from || user, to, bcc };
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

function siteBase(): string {
  return (process.env.SITE_URL ?? "https://ngiliyun.my.id").replace(/\/+$/, "");
}

// Waktu dalam WIB, misalnya "29 Oktober 2026, 03.15 WIB".
function wib(date: Date): string {
  const text = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
  return `${text} WIB`;
}

function recipients(cfg: MailConfig): string {
  return cfg.bcc.length === 0 ? cfg.to : `${cfg.to} (salinan ke ${cfg.bcc.join(", ")})`;
}

// Kirim email uji ke penerima notifikasi dan semua salinannya. Dipanggil dari tombol di halaman pengaturan.
export async function sendTestMail(): Promise<{ ok: boolean; message: string }> {
  const cfg = await config();
  if (cfg === null) return { ok: false, message: "SMTP belum lengkap. Isi server, pengguna, sandi, dan penerima, lalu simpan." };
  const now = wib(new Date());
  const intro = "Pengaturan SMTP di CMS sudah benar. Pesan baru dari form kontak akan dikirim ke alamat di bawah.";
  const rows = [
    { label: "Server", value: `${cfg.host}:${cfg.port}` },
    { label: "Pengirim", value: cfg.from },
    { label: "Penerima", value: cfg.to },
    ...cfg.bcc.map((a) => ({ label: "Salinan (BCC)", value: a })),
    { label: "Waktu", value: now },
  ];
  try {
    await transport(cfg).sendMail({
      from: cfg.from,
      to: cfg.to,
      bcc: cfg.bcc.length === 0 ? undefined : cfg.bcc,
      subject: "[ngiliyun.my.id] Email uji dari CMS",
      text: [intro, "", ...rows.map((r) => `${r.label}: ${r.value}`)].join("\n"),
      html: renderMail({
        preheader: "Pengaturan SMTP berfungsi. Pesan dari form kontak akan diteruskan ke alamat ini.",
        badge: "Email uji",
        title: "Pengaturan SMTP berfungsi",
        intro,
        rows,
        actions: [{ label: "Buka pengaturan email", href: `${siteBase()}/admin/settings/mail/`, primary: true }],
        footer: "Email ini dikirim dari tombol Kirim email uji di CMS ngiliyun.my.id. Salinan BCC tidak terlihat oleh penerima lain.",
      }),
    });
    return { ok: true, message: `Email uji terkirim ke ${recipients(cfg)}. Periksa kotak masuk (dan folder spam).` };
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

// Kirim notifikasi pesan baru ke Mas Ilyun (penerima utama dan salinan BCC). Reply-To diisi
// email pengunjung, jadi tombol Balas di aplikasi email langsung menuju pengirim.
export async function sendContactNotification(msg: ContactMail): Promise<boolean> {
  const cfg = await config();
  if (cfg === null) return false;
  const inbox = `${siteBase()}/admin/pesan/`;
  const page = msg.lang === "en" ? "Inggris (/en/)" : "Indonesia (/)";
  const now = wib(new Date());
  const reply = `mailto:${msg.email}?subject=${encodeURIComponent(`Re: ${msg.topic}`)}`;
  const text = [
    `Pesan baru dari form kontak ngiliyun.my.id, ${now}.`,
    "",
    `Nama    : ${msg.name}`,
    `Email   : ${msg.email}`,
    `Topik   : ${msg.topic}`,
    `Halaman : ${page}`,
    "",
    msg.body,
    "",
    "--",
    "Balas email ini untuk menjawab langsung ke pengirim.",
    `Kotak masuk CMS: ${inbox}`,
  ].join("\n");
  try {
    await transport(cfg).sendMail({
      from: cfg.from,
      to: cfg.to,
      bcc: cfg.bcc.length === 0 ? undefined : cfg.bcc,
      replyTo: { name: msg.name, address: msg.email },
      subject: `[ngiliyun.my.id] ${msg.topic} - ${msg.name}`,
      text,
      html: renderMail({
        preheader: msg.body.slice(0, 120),
        badge: "Form kontak",
        title: `Pesan baru dari ${msg.name}`,
        intro: `Masuk lewat form kontak ngiliyun.my.id pada ${now}.`,
        rows: [
          { label: "Nama", value: msg.name },
          { label: "Email", value: msg.email, href: `mailto:${msg.email}` },
          { label: "Topik", value: msg.topic, chip: true },
          { label: "Halaman", value: page },
        ],
        message: { label: "Isi pesan", body: msg.body },
        actions: [
          { label: `Balas ke ${msg.name}`, href: reply, primary: true },
          { label: "Buka di kotak masuk CMS", href: inbox },
        ],
        footer: "Email otomatis dari form kontak ngiliyun.my.id. Tekan Balas di aplikasi email untuk menjawab langsung ke pengirim. Pesan ini juga tersimpan di kotak masuk CMS.",
      }),
    });
    return true;
  } catch (err) {
    console.error("[mail] Gagal mengirim notifikasi pesan", msg.id, err instanceof Error ? err.message : err);
    return false;
  }
}
