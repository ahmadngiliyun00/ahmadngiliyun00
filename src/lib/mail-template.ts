// Template email HTML untuk notifikasi form kontak dan email uji SMTP.
// Ditulis dengan tabel dan gaya inline karena Gmail, Outlook, dan aplikasi email lain
// tidak mendukung CSS modern, berkas CSS luar, maupun gambar SVG.
// Berkas ini tanpa impor supaya bisa diuji dari tests/mail.test.mjs.

const AMP = String.fromCharCode(38);
const ESCAPES: Record<string, string> = {
  [AMP]: `${AMP}amp;`,
  "<": `${AMP}lt;`,
  ">": `${AMP}gt;`,
  '"': `${AMP}quot;`,
  "'": `${AMP}#39;`,
};
const ESCAPE_RE = new RegExp(`[${AMP}<>"']`, "g");

// Semua isian dari pengunjung wajib lewat fungsi ini sebelum masuk ke HTML.
export function escapeHtml(value: string): string {
  return value.replace(ESCAPE_RE, (c) => ESCAPES[c]);
}

// Teks bebas: di-escape lalu baris baru menjadi <br>.
function paragraphs(value: string): string {
  return escapeHtml(value.replace(/\r\n?/g, "\n")).split("\n").join("<br>");
}

const C = {
  page: "#eef1f7",
  card: "#ffffff",
  ink: "#0a1633",
  text: "#1f2a44",
  muted: "#5b6b8c",
  line: "#e3e8f2",
  soft: "#f5f7fb",
  leaf: "#3fd35a",
  leafDeep: "#17692a",
  leafSoft: "#e6f8ea",
  sky: "#6b97ff",
  link: "#2f5fd0", // biru logo yang digelapkan supaya kontras AA di atas putih
};
const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export type MailRow = { label: string; value: string; href?: string; chip?: boolean };
export type MailAction = { label: string; href: string; primary?: boolean };

export type MailLayout = {
  preheader: string; // cuplikan yang tampil di daftar kotak masuk
  badge: string; // label kecil di kepala email
  title: string;
  intro: string;
  rows: MailRow[];
  message?: { label: string; body: string };
  actions: MailAction[];
  footer: string;
};

function row(r: MailRow, first: boolean): string {
  const border = first ? "" : `border-top:1px solid ${C.line};`;
  const value = escapeHtml(r.value);
  const content = r.chip
    ? `<span style="display:inline-block;padding:3px 12px;border-radius:12px;background:${C.leafSoft};color:${C.leafDeep};font-weight:600;font-size:13px;">${value}</span>`
    : r.href
      ? `<a href="${escapeHtml(r.href)}" style="color:${C.link};text-decoration:underline;">${value}</a>`
      : value;
  return `<tr>
<td valign="top" style="${border}padding:12px 14px 12px 0;width:92px;color:${C.muted};font-size:14px;">${escapeHtml(r.label)}</td>
<td valign="top" style="${border}padding:12px 0;color:${C.text};font-size:15px;font-weight:600;word-break:break-word;">${content}</td>
</tr>`;
}

function button(a: MailAction): string {
  const style = a.primary
    ? `background:${C.leaf};color:${C.ink};border:1px solid ${C.leaf};`
    : `background:${C.card};color:${C.ink};border:1px solid #c9d2e3;`;
  // Tombol inline-block tanpa tabel, supaya di layar sempit turun ke baris baru alih-alih menyempit.
  return `<a href="${escapeHtml(a.href)}" style="${style}display:inline-block;margin:0 8px 10px 0;padding:12px 22px;border-radius:999px;font-size:15px;font-weight:700;white-space:nowrap;text-decoration:none;">${escapeHtml(a.label)}</a>`;
}

export function renderMail(m: MailLayout): string {
  const rows = m.rows.map((r, i) => row(r, i === 0)).join("\n");
  const message = m.message
    ? `<tr><td style="padding:8px 32px 0;">
<p style="margin:0 0 10px;color:${C.muted};font-size:14px;">${escapeHtml(m.message.label)}</p>
<div style="padding:18px 20px;border-left:4px solid ${C.leaf};border-radius:0 12px 12px 0;background:${C.soft};color:${C.text};font-size:15px;line-height:1.65;word-break:break-word;">${paragraphs(m.message.body)}</div>
</td></tr>`
    : "";
  const actions = m.actions.length
    ? `<tr><td style="padding:24px 32px 14px;">${m.actions.map(button).join("\n")}</td></tr>`
    : "";

  return `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${escapeHtml(m.title)}</title>
</head>
<body style="margin:0;padding:0;background:${C.page};font-family:${FONT};-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.page};">${escapeHtml(m.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.page};">
<tr><td align="center" style="padding:32px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:${C.card};border-radius:18px;overflow:hidden;border:1px solid ${C.line};">

<tr><td style="background:${C.ink};padding:22px 32px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="font-family:${FONT};font-size:22px;font-weight:800;letter-spacing:-0.5px;color:#ffffff;">
ngiliyun<span style="color:${C.leaf};">.</span><span style="color:${C.sky};">my.id</span>
</td>
<td align="right" style="font-size:13px;color:#a3b3d1;white-space:nowrap;">${escapeHtml(m.badge)}</td>
</tr></table>
</td></tr>
<tr><td style="padding:0;font-size:0;line-height:0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td height="4" style="background:${C.leaf};width:50%;font-size:0;line-height:0;"></td>
<td height="4" style="background:${C.sky};width:50%;font-size:0;line-height:0;"></td>
</tr></table>
</td></tr>

<tr><td style="padding:32px 32px 8px;">
<h1 style="margin:0;color:${C.ink};font-size:24px;line-height:1.3;font-weight:800;letter-spacing:-0.3px;">${escapeHtml(m.title)}</h1>
<p style="margin:10px 0 0;color:${C.muted};font-size:15px;line-height:1.6;">${escapeHtml(m.intro)}</p>
</td></tr>

<tr><td style="padding:16px 32px 8px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
${rows}
</table>
</td></tr>

${message}
${actions}

<tr><td style="padding:18px 32px 26px;border-top:1px solid ${C.line};color:${C.muted};font-size:13px;line-height:1.6;">${escapeHtml(m.footer)}</td></tr>
</table>
<p style="margin:18px 0 0;color:#8a97b3;font-size:12px;">Ahmad Ngiliyun, M.Kom. - ngiliyun.my.id</p>
</td></tr>
</table>
</body>
</html>`;
}
