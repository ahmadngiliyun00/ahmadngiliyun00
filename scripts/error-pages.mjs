// Membuat halaman error statis untuk Nginx: public/errors/500.html, 502.html, 503.html, 504.html.
// Halaman ini tampil saat aplikasi Next.js tidak bisa menjawab (mati, dimulai ulang, atau terlalu lama),
// jadi tidak boleh bergantung pada Next.js: gaya dan skrip ditulis di dalam berkas, font disalin ke
// public/errors/fonts/. Dua bahasa dalam satu berkas; bahasa dipilih dari alamat (/en/ berarti Inggris).
// Jalankan: npm run errors (lalu commit hasilnya). Pemasangan di Nginx: docs/DEPLOY.md langkah 5.

import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";

const ROOT = new URL("../", import.meta.url);
const OUT = new URL("public/errors/", ROOT);
const FONTS = new URL("fonts/", OUT);

const PAGES = {
  500: {
    status: "500 Internal Server Error",
    retry: false,
    id: {
      title: "Terjadi kesalahan di server",
      lead: "Ini halaman error. Server situs mengalami kesalahan sehingga halaman tidak bisa disiapkan. Masalahnya ada di sisi situs, bukan di perangkat Anda.",
      causes: ["Aplikasi situs mengalami galat yang tidak tertangani.", "Database sedang tidak bisa dihubungi.", "Konfigurasi server sedang diubah."],
    },
    en: {
      title: "Something went wrong on the server",
      lead: "This is an error page. The site's server ran into an error and could not prepare the page. The problem is on the site's side, not on your device.",
      causes: ["The site application hit an unhandled error.", "The database cannot be reached right now.", "The server configuration is being changed."],
    },
  },
  502: {
    status: "502 Bad Gateway",
    retry: true,
    id: {
      title: "Server situs sedang tidak menjawab",
      lead: "Ini halaman error. Server web sudah menerima permintaan Anda, tetapi aplikasi situs di belakangnya tidak memberi jawaban.",
      causes: ["Situs sedang dimulai ulang setelah pembaruan.", "Aplikasi situs berhenti dan sedang dinyalakan lagi.", "Server kehabisan memori sesaat."],
    },
    en: {
      title: "The site's server is not responding",
      lead: "This is an error page. The web server received your request, but the site application behind it did not answer.",
      causes: ["The site is restarting after an update.", "The site application stopped and is starting again.", "The server briefly ran out of memory."],
    },
  },
  503: {
    status: "503 Service Unavailable",
    retry: true,
    id: {
      title: "Situs sedang dalam pemeliharaan",
      lead: "Ini halaman error. Situs untuk sementara tidak bisa melayani permintaan, biasanya karena sedang dipelihara atau diperbarui.",
      causes: ["Pemeliharaan atau pembaruan terjadwal.", "Server sedang menerima terlalu banyak permintaan.", "Layanan pendukung, misalnya database, sedang dipindahkan."],
    },
    en: {
      title: "The site is under maintenance",
      lead: "This is an error page. The site cannot serve requests for now, usually because it is being maintained or updated.",
      causes: ["Scheduled maintenance or an update.", "The server is receiving too many requests.", "A supporting service, such as the database, is being moved."],
    },
  },
  504: {
    status: "504 Gateway Timeout",
    retry: true,
    id: {
      title: "Server terlalu lama menjawab",
      lead: "Ini halaman error. Aplikasi situs tidak menyelesaikan halaman ini dalam batas waktu, jadi permintaan dihentikan.",
      causes: ["Database sedang lambat atau sibuk.", "Server sedang menjalankan proses berat, misalnya build.", "Koneksi antara server web dan aplikasi terganggu."],
    },
    en: {
      title: "The server took too long to answer",
      lead: "This is an error page. The site application did not finish this page within the time limit, so the request was stopped.",
      causes: ["The database is slow or busy.", "The server is running a heavy task, such as a build.", "The connection between the web server and the app was interrupted."],
    },
  },
};

const LABELS = {
  id: {
    badge: "Halaman error {code}",
    details: "Rincian error",
    code: "Kode error",
    path: "Alamat yang dibuka",
    causes: "Kemungkinan penyebab",
    retry: "Coba lagi",
    back: "Kembali",
    home: "Ke beranda",
    auto: "Halaman ini mencoba memuat ulang sendiri dalam {s} detik.",
    hint: "Bila masalah berlanjut, kabari lewat ahmad@ngiliyun.my.id.",
  },
  en: {
    badge: "Error page {code}",
    details: "Error details",
    code: "Error code",
    path: "Requested address",
    causes: "Possible causes",
    retry: "Try again",
    back: "Go back",
    home: "Go to home",
    auto: "This page will try to reload by itself in {s} seconds.",
    hint: "If the problem continues, let me know at ahmad@ngiliyun.my.id.",
  },
};

// Titik hiasan bergaya plot K-Means di hero, sama dengan ErrorPlot.tsx varian "broken".
const CLUSTERS = [
  { cx: 78, cy: 70, color: "#3fd35a" },
  { cx: 214, cy: 58, color: "#6b97ff" },
  { cx: 150, cy: 158, color: "#f2efe6" },
];

function plot() {
  let seed = 11;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const lines = [];
  const dots = [];
  CLUSTERS.forEach((c) => {
    for (let i = 0; i < 13; i++) {
      const angle = rand() * Math.PI * 2;
      const radius = 7 + rand() * 30;
      const x = Math.round(c.cx + Math.cos(angle) * radius);
      const y = Math.round(c.cy + Math.sin(angle) * radius * 0.8);
      const delay = Math.round(rand() * 2400);
      lines.push(`<line x1="${c.cx}" y1="${c.cy}" x2="${x}" y2="${y}" class="link"/>`);
      dots.push(`<circle cx="${x}" cy="${y}" r="3" fill="${c.color}" class="dot" style="animation-delay:${delay}ms"/>`);
    }
  });
  const centers = CLUSTERS.map(
    (c, k) =>
      `<g class="center" style="animation-delay:${k * 400}ms"><circle cx="${c.cx}" cy="${c.cy}" r="9" fill="none" stroke="${c.color}" stroke-width="2"/><circle cx="${c.cx}" cy="${c.cy}" r="3" fill="${c.color}"/></g>`,
  );
  return `<svg viewBox="0 0 300 220" class="plot" aria-hidden="true">${lines.join("")}${dots.join("")}${centers.join("")}</svg>`;
}

// Escape teks untuk HTML. Karakter ampersand ditulis lewat fromCharCode (aturan gaya repo).
const AMP = String.fromCharCode(38);
const esc = (s) => s.replace(/</g, `${AMP}lt;`).replace(/>/g, `${AMP}gt;`);

function block(lang, code, page) {
  const t = LABELS[lang];
  const p = page[lang];
  const digits = String(code)
    .split("")
    .map((d, i) => `<span class="digit" style="--d:${120 + i * 110}ms">${d}</span>`)
    .join("");
  return `
<div class="lang" data-lang="${lang}"${lang === "en" ? " hidden" : ""}>
  <div class="layout">
    <div>
      <p class="badge"><span class="dot-status" aria-hidden="true"></span>${t.badge.replace("{code}", String(code))}</p>
      <p class="code" aria-hidden="true">${digits}</p>
      <h1 class="title">${esc(p.title)}</h1>
      <p class="lead">${esc(p.lead)}</p>
      <div class="actions">
        <button type="button" class="btn btn-solid" data-action="retry"><span aria-hidden="true">↻</span>${t.retry}</button>
        <button type="button" class="btn btn-line" data-action="back"><span aria-hidden="true">←</span>${t.back}</button>
        <a class="btn btn-line" href="${lang === "id" ? "/" : "/en/"}">${t.home}</a>
      </div>
      ${page.retry ? `<p class="auto" aria-live="polite" data-auto="${esc(t.auto)}"></p>` : ""}
    </div>
    <div class="side">
      <div class="plot-wrap">${plot()}</div>
      <div class="details">
        <h2>${t.details}</h2>
        <dl>
          <div><dt>${t.code}</dt><dd><code>${page.status}</code></dd></div>
          <div><dt>${t.path}</dt><dd><code class="path">/</code></dd></div>
        </dl>
        <h3>${t.causes}</h3>
        <ul>${p.causes.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>
        <p class="hint">${t.hint}</p>
      </div>
    </div>
  </div>
</div>`;
}

const CSS = `
@font-face{font-family:"Bricolage";src:url("/errors/fonts/bricolage.woff2") format("woff2");font-weight:200 800;font-display:swap}
@font-face{font-family:"Instrument";src:url("/errors/fonts/instrument.woff2") format("woff2");font-weight:400 700;font-display:swap}
:root{--ink:#0a1633;--surface:#0f1e43;--line:#22376b;--fg:#eaf0fb;--muted:#a3b3d1;--leaf:#3fd35a;--sky:#6b97ff;--amber:#f5c451;color-scheme:dark}
*{box-sizing:border-box;margin:0;padding:0}
html{background:var(--ink)}
body{min-height:100dvh;background:var(--ink);color:var(--fg);font-family:"Instrument",ui-sans-serif,system-ui,sans-serif;line-height:1.65;-webkit-font-smoothing:antialiased;overflow-x:hidden;position:relative}
body::before{content:"";position:fixed;inset:0;z-index:-1;background-image:linear-gradient(var(--line) 1px,transparent 1px),linear-gradient(90deg,var(--line) 1px,transparent 1px);background-size:64px 64px;opacity:.3;-webkit-mask-image:radial-gradient(ellipse 70% 60% at 70% 30%,#000 10%,transparent 75%);mask-image:radial-gradient(ellipse 70% 60% at 70% 30%,#000 10%,transparent 75%)}
body::after{content:"";position:fixed;z-index:-1;top:-15%;right:-12%;width:55vw;height:55vw;max-width:760px;max-height:760px;border-radius:999px;background:radial-gradient(closest-side,rgba(107,151,255,.2),transparent);pointer-events:none}
ul{list-style:none}
a{color:inherit;text-decoration:none}
:focus-visible{outline:2px solid var(--sky);outline-offset:3px;border-radius:6px}
.bar{max-width:72rem;margin:0 auto;padding:1.1rem 1.25rem;display:flex;align-items:center;gap:.6rem;font-family:"Bricolage",sans-serif;font-weight:700}
.bar svg{width:2rem;height:2rem}
main{max-width:72rem;margin:0 auto;padding:clamp(1.5rem,6vw,4.5rem) 1.25rem 4rem}
.layout{display:grid;gap:3rem}
@media(min-width:1024px){.layout{grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);align-items:center;gap:4rem}.bar,main{padding-inline:2rem}}
.badge{display:inline-flex;align-items:center;gap:.65rem;padding:.4rem .95rem .4rem .8rem;border:1px solid var(--line);border-radius:999px;background:rgba(15,30,67,.7);font-size:.875rem}
.dot-status{position:relative;width:.55rem;height:.55rem;border-radius:999px;background:var(--amber)}
.dot-status::after{content:"";position:absolute;inset:0;border-radius:inherit;background:var(--amber);animation:pulse 2.2s ease-out infinite}
.code{display:flex;margin-top:1.25rem;overflow:hidden;padding-bottom:.08em;font-family:"Bricolage",sans-serif;font-weight:800;font-size:clamp(6rem,24vw,12rem);line-height:.85;letter-spacing:-.06em}
.digit{display:inline-block;animation:up .95s cubic-bezier(.2,.7,.2,1) both,float 5s ease-in-out infinite;animation-delay:var(--d),calc(var(--d) + 1.1s)}
.digit:nth-child(odd){color:var(--leaf)}.digit:nth-child(even){color:var(--sky)}
.title{margin-top:1.25rem;font-family:"Bricolage",sans-serif;font-weight:800;font-size:clamp(1.9rem,4.5vw,3rem);line-height:1;letter-spacing:-.035em}
.lead{margin-top:1rem;max-width:52ch;font-size:1.1rem;color:var(--muted)}
.actions{display:flex;flex-wrap:wrap;gap:.75rem;margin-top:2rem}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;min-height:2.875rem;padding:0 1.3rem;border-radius:999px;font:600 .95rem/1 "Instrument",sans-serif;cursor:pointer;border:1px solid transparent;transition:background-color .2s,border-color .2s}
.btn-solid{background:var(--leaf);color:#06210e}.btn-solid:hover{background:#5fe077}
.btn-line{background:transparent;color:var(--fg);border-color:var(--line)}.btn-line:hover{border-color:var(--muted)}
.auto{margin-top:1rem;font-size:.9rem;color:var(--muted)}
.side{display:grid;gap:1.25rem}
.plot-wrap{padding:1rem;border:1px solid var(--line);border-radius:1.25rem;background-color:rgba(15,30,67,.85);background-image:linear-gradient(rgba(34,55,107,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(34,55,107,.5) 1px,transparent 1px);background-size:10% 12.5%}
.plot{display:block;width:100%;height:auto;max-height:15rem;overflow:visible}
.link{stroke:rgba(163,179,209,.28);stroke-width:1;stroke-dasharray:2 4}
.dot,.center{transform-box:fill-box;transform-origin:center}
.dot{animation:jitter .9s steps(2,jump-none) infinite}
.center{animation:flicker 2.6s linear infinite}
.details{padding:1.4rem 1.5rem;border:1px solid var(--line);border-radius:1.25rem;background:var(--surface)}
.details h2{font-family:"Bricolage",sans-serif;font-size:1.15rem;letter-spacing:-.015em}
.details dl{margin-top:.75rem}
.details dl>div{display:grid;gap:.2rem;padding:.6rem 0;border-top:1px solid var(--line)}
@media(min-width:640px){.details dl>div{grid-template-columns:10rem minmax(0,1fr);gap:1rem}}
.details dt{font-size:.85rem;color:var(--muted)}
.details code{font-size:.9rem;overflow-wrap:anywhere}
.details h3{margin-top:1.1rem;font-size:1rem}
.details ul{display:grid;gap:.35rem;margin-top:.5rem;font-size:.925rem;color:var(--muted)}
.details li{position:relative;padding-left:1rem}
.details li::before{content:"";position:absolute;left:0;top:.65em;width:.35rem;height:.35rem;border-radius:999px;background:var(--sky)}
.hint{margin-top:1rem;padding-top:.9rem;border-top:1px solid var(--line);font-size:.9rem}
@keyframes pulse{0%{transform:scale(1);opacity:.7}80%,100%{transform:scale(2.8);opacity:0}}
@keyframes up{from{transform:translateY(105%) rotate(6deg)}to{transform:none}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-.05em)}}
@keyframes jitter{0%{transform:translate(0,0)}50%{transform:translate(1.5px,-1px)}100%{transform:translate(-1px,1.5px)}}
@keyframes flicker{0%,42%,48%,100%{opacity:1}44%,46%{opacity:.15}}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}}
`;

// Monogram "A di dalam N", sama dengan src/components/Monogram.tsx.
const LOGO = `<svg viewBox="96 96 320 320" aria-hidden="true"><path d="M120 400 L120 112 L176 112 L336 312 L336 135.5 L392 205.5 L392 400 L336 400 L176 200 L176 400 Z" fill="#eaf0fb"/><path d="M176 268 L336 268 L336 300 L176 300 Z" fill="#3fd35a"/><path d="M336 112 L392 112 L392 182 Z" fill="#6b97ff"/></svg>`;

// Bahasa dari alamat, isi alamat yang dibuka, tombol, dan muat ulang otomatis (hanya 502, 503, 504).
const SCRIPT = `
(function(){
  var en = location.pathname.indexOf("/en/") === 0;
  var lang = en ? "en" : "id";
  document.documentElement.lang = lang;
  document.querySelectorAll(".lang").forEach(function(el){ el.hidden = el.getAttribute("data-lang") !== lang; });
  document.title = document.querySelector('.lang[data-lang="' + lang + '"] .title').textContent + " | Ahmad Ngiliyun";
  document.querySelectorAll(".path").forEach(function(el){ el.textContent = decodeURI(location.pathname + location.search); });
  document.addEventListener("click", function(e){
    var b = e.target.closest("[data-action]");
    if (!b) return;
    if (b.getAttribute("data-action") === "retry") location.reload();
    else if (history.length > 1) history.back();
    else location.href = en ? "/en/" : "/";
  });
  var auto = document.querySelector('.lang[data-lang="' + lang + '"] .auto');
  if (!auto) return;
  var s = 20;
  var tick = function(){
    auto.textContent = auto.getAttribute("data-auto").replace("{s}", s);
    if (s === 0) location.reload(); else { s -= 1; setTimeout(tick, 1000); }
  };
  tick();
})();
`;

function html(code) {
  const page = PAGES[code];
  return `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<meta name="theme-color" content="#0A1633">
<title>${esc(page.id.title)} | Ahmad Ngiliyun</title>
<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(LOGO)}">
<style>${CSS.trim()}</style>
</head>
<body>
<header class="bar">${LOGO}Ahmad Ngiliyun</header>
<main>${block("id", code, page)}${block("en", code, page)}
</main>
<script>${SCRIPT.trim()}</script>
</body>
</html>
`;
}

mkdirSync(FONTS, { recursive: true });
copyFileSync(
  new URL("node_modules/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2", ROOT),
  new URL("bricolage.woff2", FONTS),
);
copyFileSync(
  new URL("node_modules/@fontsource-variable/instrument-sans/files/instrument-sans-latin-wght-normal.woff2", ROOT),
  new URL("instrument.woff2", FONTS),
);
for (const code of Object.keys(PAGES)) {
  writeFileSync(new URL(`${code}.html`, OUT), html(Number(code)));
  console.log(`[errors] public/errors/${code}.html`);
}
