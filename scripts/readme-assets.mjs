// Membuat gambar SVG untuk README profil GitHub:
//   profile/banner.svg   banner nama dengan plot K-Means beranimasi
//   profile/marquee.svg  running text teknologi dan topik
//   profile/stats.svg    statistik kontribusi dan grafik per bulan dari src/data/github.json
//
// Font (subset statis Bricolage Grotesque dan Instrument Sans, lisensi OFL) disematkan
// langsung ke SVG, karena GitHub tidak memuat font eksternal di dalam gambar.
// Bagian teks README (proyek, capaian, mengajar, perjalanan) dibangkitkan oleh readme-sections.mjs.
// Jalankan: npm run readme  (otomatis juga dijalankan oleh npm run data dan prebuild)

import { readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { renderReadmeSections } from "./readme-sections.mjs";

const OUT = new URL("../profile/", import.meta.url);
const FONTS = new URL("../profile/fonts/", import.meta.url);
const DATA = new URL("../src/data/github.json", import.meta.url);

const C = {
  ink: "#0A1633",
  surface: "#0F1E43",
  line: "#22376B",
  fg: "#EAF0FB",
  muted: "#A3B3D1",
  idle: "#6C7EA6",
  leaf: "#3FD35A",
  sky: "#6B97FF",
  paper: "#F2EFE6",
};

const EASE = "cubic-bezier(.2,.7,.2,1)";

// ---------- Teks yang tampil di gambar ----------

const BANNER = {
  pill: "Dosen Informatika, Cirebon",
  first: "Ahmad",
  last: "Ngiliyun",
  tagline: "Membangun sistem AI, web, dan seluler.",
  site: "ngiliyun.my.id",
  place: "Universitas Insan Mahardika",
  plotTitle: "k-means, k = 3",
  plotState: "stabil",
};

const SKILLS = [
  "Next.js", "React", "TypeScript", "Tailwind CSS", "Laravel", "Expo", "React Native",
  "Python", "PyTorch", "FastAPI", "Jupyter", "Docker", "AlmaLinux", "Ubuntu", "Nginx", "Cloudflare", "Moodle",
];

const TOPICS = [
  "Klasifikasi", "Clustering K-Means", "Analisis sentimen", "Deep learning", "Computer vision",
  "Sistem rekomendasi", "AI agent",
  "REST API", "Aplikasi seluler", "Keamanan server", "LMS", "Data warehouse",
];

const STATS_TEXT = {
  title: "Kontribusi setahun terakhir",
  updated: "Data GitHub, diperbarui",
  labels: ["kontribusi dalam setahun", "hari aktif", "hari beruntun terpanjang", "repositori publik"],
};

// ---------- Utilitas ----------

const metrics = JSON.parse(await readFile(new URL("metrics.json", FONTS), "utf8"));

const FAMILY = {
  "bricolage-800": "Bricolage",
  "instrument-400": "Instrument",
  "instrument-600": "InstrumentSemi",
};

async function fontFaces(names) {
  const rules = await Promise.all(
    names.map(async (name) => {
      const b64 = (await readFile(new URL(`${name}.woff2`, FONTS))).toString("base64");
      return `@font-face{font-family:"${FAMILY[name]}";src:url(data:font/woff2;base64,${b64}) format("woff2");}`;
    }),
  );
  return rules.join("\n");
}

function measure(text, font, size, tracking = 0) {
  const m = metrics[font];
  let units = 0;
  for (const ch of text) units += m.widths[ch] ?? m.unitsPerEm * 0.55;
  return (units / m.unitsPerEm) * size + tracking * text.length;
}

// Teks dimasukkan apa adanya ke XML, jadi tolak karakter yang perlu di-escape.
function safe(text) {
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    if (code === 0x26 || code === 0x3c || code === 0x3e) {
      throw new Error(`Karakter tidak diizinkan di teks SVG: ${text}`);
    }
  }
  return text;
}

function mulberry32(seed) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gauss(rand) {
  const u = 1 - rand();
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

const r1 = (n) => Math.round(n * 10) / 10;

const REDUCED = "@media (prefers-reduced-motion: reduce){*{animation:none!important}}";

function frame(width, height, title, desc, style, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-labelledby="title desc">
<title id="title">${safe(title)}</title>
<desc id="desc">${safe(desc)}</desc>
<defs>
<style>
${style}
${REDUCED}
</style>
<clipPath id="card"><rect width="${width}" height="${height}" rx="24"/></clipPath>
</defs>
<g clip-path="url(#card)">
<rect width="${width}" height="${height}" fill="${C.ink}"/>
${body}
</g>
<rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="23.5" fill="none" stroke="${C.line}"/>
</svg>
`;
}

// ---------- Banner ----------

async function banner() {
  const W = 1200;
  const H = 460;
  const nameSize = 116;
  const tracking = -nameSize * 0.045;

  // Plot K-Means
  const plot = { x: 772, y: 58, w: 372, h: 344 };
  const area = { x: plot.x + 20, y: plot.y + 50, w: plot.w - 40, h: 222 };
  const rand = mulberry32(11);
  const centers = [
    [0.24, 0.3],
    [0.76, 0.28],
    [0.52, 0.74],
  ];
  const starts = [
    [0.62, 0.62],
    [0.32, 0.7],
    [0.82, 0.58],
  ];
  const colors = [C.paper, C.sky, C.leaf];
  const points = [];
  centers.forEach(([cx, cy], k) => {
    for (let i = 0; i < 22; i++) {
      const x = Math.min(0.97, Math.max(0.03, cx + gauss(rand) * 0.075));
      const y = Math.min(0.95, Math.max(0.05, cy + gauss(rand) * 0.09));
      points.push({ x: area.x + x * area.w, y: area.y + y * area.h, k });
    }
  });
  const cpos = centers.map(([cx, cy]) => [area.x + cx * area.w, area.y + cy * area.h]);

  const gridLines = [];
  for (let i = 1; i < 8; i++) {
    const gx = r1(area.x + (area.w / 8) * i);
    gridLines.push(`<line x1="${gx}" y1="${area.y}" x2="${gx}" y2="${area.y + area.h}"/>`);
  }
  for (let i = 1; i < 5; i++) {
    const gy = r1(area.y + (area.h / 5) * i);
    gridLines.push(`<line x1="${area.x}" y1="${gy}" x2="${area.x + area.w}" y2="${gy}"/>`);
  }

  const links = points
    .map(
      (p, i) =>
        `<line class="ln" style="animation-delay:${(1.9 + (i % 22) * 0.02).toFixed(2)}s" x1="${r1(p.x)}" y1="${r1(p.y)}" x2="${r1(cpos[p.k][0])}" y2="${r1(cpos[p.k][1])}" stroke="${colors[p.k]}"/>`,
    )
    .join("\n");

  const dots = points
    .map(
      (p, i) =>
        `<circle class="pt k${p.k}" style="animation-delay:${(1.2 + (i % 22) * 0.03).toFixed(2)}s" cx="${r1(p.x)}" cy="${r1(p.y)}" r="3.6"/>`,
    )
    .join("\n");

  const cents = cpos
    .map(([x, y], k) => {
      const [sx, sy] = starts[k];
      const dx = r1(area.x + sx * area.w - x);
      const dy = r1(area.y + sy * area.h - y);
      return `<g class="cg" style="--dx:${dx}px;--dy:${dy}px">
<circle cx="${r1(x)}" cy="${r1(y)}" r="13" fill="${colors[k]}" fill-opacity="0.16" stroke="${colors[k]}" stroke-width="2"/>
<circle cx="${r1(x)}" cy="${r1(y)}" r="5" fill="${colors[k]}" stroke="${C.ink}" stroke-width="2"/>
</g>`;
    })
    .join("\n");

  const counts = [0, 0, 0];
  points.forEach((p) => {
    counts[p.k] += 1;
  });
  let lx = area.x;
  const legend = counts
    .map((n, k) => {
      const label = `K${k + 1}: ${n} titik`;
      const item = `<circle cx="${r1(lx + 5)}" cy="${area.y + area.h + 31}" r="5" fill="${colors[k]}"/><text x="${r1(lx + 16)}" y="${area.y + area.h + 36}" class="s" font-size="14" fill="${C.muted}">${safe(label)}</text>`;
      lx += measure(label, "instrument-400", 14) + 34;
      return item;
    })
    .join("\n");

  const pillW = measure(BANNER.pill, "instrument-400", 15) + 52;
  const stateW = measure(BANNER.plotState, "instrument-400", 13);
  const siteW = measure(BANNER.site, "instrument-600", 18);

  const style = `${await fontFaces(["bricolage-800", "instrument-400", "instrument-600"])}
.d{font-family:"Bricolage",sans-serif;font-weight:800}
.s{font-family:"Instrument",sans-serif}
.s6{font-family:"InstrumentSemi",sans-serif}
.k0{fill:${colors[0]}}.k1{fill:${colors[1]}}.k2{fill:${colors[2]}}
.up{animation:up .9s ${EASE} both}
.pt{animation:tint .5s ease both}
.ln{stroke-opacity:.2;animation:fade .6s ease both}
.cg{animation:move 1.6s ${EASE} .5s both}
@keyframes up{from{transform:translateY(14px)}}
@keyframes tint{from{fill:${C.idle}}}
@keyframes fade{from{stroke-opacity:.05}}
@keyframes move{from{transform:translate(var(--dx),var(--dy))}}`;

  const body = `<radialGradient id="glow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${C.sky}" stop-opacity="0.28"/><stop offset="1" stop-color="${C.sky}" stop-opacity="0"/></radialGradient>
<circle cx="1010" cy="70" r="430" fill="url(#glow)"/>

<g class="up" style="animation-delay:.05s">
<rect x="56" y="54" width="${r1(pillW)}" height="36" rx="18" fill="${C.surface}" stroke="${C.line}"/>
<circle cx="78" cy="72" r="5" fill="${C.leaf}"/>
<text x="92" y="77" class="s" font-size="15" fill="${C.muted}">${safe(BANNER.pill)}</text>
</g>
<text x="50" y="212" class="d up" style="animation-delay:.15s" font-size="${nameSize}" letter-spacing="${r1(tracking)}" fill="${C.leaf}">${safe(BANNER.first)}</text>
<text x="${r1(50 + nameSize * 0.3)}" y="310" class="d up" style="animation-delay:.3s" font-size="${nameSize}" letter-spacing="${r1(tracking)}" fill="${C.sky}">${safe(BANNER.last)}</text>
<text x="56" y="366" class="s6 up" style="animation-delay:.5s" font-size="26" fill="${C.fg}">${safe(BANNER.tagline)}</text>
<g class="up" style="animation-delay:.65s">
<text x="56" y="406" class="s6" font-size="18" fill="${C.leaf}">${safe(BANNER.site)}</text>
<text x="${r1(56 + siteW + 14)}" y="406" class="s" font-size="18" fill="${C.muted}">${safe(BANNER.place)}</text>
</g>

<g class="up" style="animation-delay:.4s">
<rect x="${plot.x}" y="${plot.y}" width="${plot.w}" height="${plot.h}" rx="20" fill="${C.surface}" stroke="${C.line}"/>
<text x="${plot.x + 20}" y="${plot.y + 32}" class="s6" font-size="14" fill="${C.fg}">${safe(BANNER.plotTitle)}</text>
<circle cx="${r1(plot.x + plot.w - 20 - stateW - 12)}" cy="${plot.y + 27}" r="4" fill="${C.leaf}"/>
<text x="${plot.x + plot.w - 20}" y="${plot.y + 32}" class="s" font-size="13" fill="${C.muted}" text-anchor="end">${safe(BANNER.plotState)}</text>
<rect x="${area.x}" y="${area.y}" width="${area.w}" height="${area.h}" rx="12" fill="${C.ink}"/>
<g stroke="${C.line}" stroke-opacity="0.6">${gridLines.join("")}</g>
${links}
${dots}
${cents}
${legend}
</g>`;

  return frame(
    W,
    H,
    "Ahmad Ngiliyun",
    `Ahmad Ngiliyun, dosen informatika di Cirebon. ${BANNER.tagline} Di sampingnya plot K-Means dengan tiga kluster.`,
    style,
    body,
  );
}

// ---------- Running text ----------

async function marquee() {
  const W = 1200;
  const H = 128;

  function row(items, font, size, tracking, gap, sep) {
    const parts = [];
    let x = 0;
    for (const item of items) {
      parts.push({ type: "text", x, text: item });
      x += measure(item, font, size, tracking) + gap;
      parts.push({ type: "sep", x: x - gap / 2 });
    }
    return { parts, width: x, font, size, tracking, sep };
  }

  const top = row(SKILLS, "bricolage-800", 30, -0.4, 52, "dot");
  const bottom = row(TOPICS, "instrument-400", 22, 0, 46, "diamond");

  function render(r, baseline, cls, fill, sepColor, dir, speed) {
    const copies = Math.ceil(W / r.width) + 1;
    const items = [];
    for (let c = 0; c < copies; c++) {
      const off = c * r.width;
      for (const p of r.parts) {
        if (p.type === "text") {
          items.push(
            `<text x="${r1(off + p.x)}" y="${baseline}" class="${cls}" font-size="${r.size}" letter-spacing="${r.tracking}" fill="${fill}">${safe(p.text)}</text>`,
          );
        } else if (r.sep === "dot") {
          items.push(`<circle cx="${r1(off + p.x)}" cy="${baseline - r.size * 0.33}" r="4.5" fill="${sepColor}"/>`);
        } else {
          const cx = r1(off + p.x);
          const cy = r1(baseline - r.size * 0.32);
          items.push(
            `<rect x="${r1(cx - 4)}" y="${r1(cy - 4)}" width="8" height="8" fill="none" stroke="${sepColor}" stroke-width="1.6" transform="rotate(45 ${cx} ${cy})"/>`,
          );
        }
      }
    }
    const seconds = r1(r.width / speed);
    const name = dir === "left" ? "toLeft" : "toRight";
    return {
      keyframe: `@keyframes ${name}${cls}{${dir === "left" ? `from{transform:translateX(0)}to{transform:translateX(-${r1(r.width)}px)}` : `from{transform:translateX(-${r1(r.width)}px)}to{transform:translateX(0)}`}}`,
      group: `<g style="animation:${name}${cls} ${seconds}s linear infinite">${items.join("")}</g>`,
    };
  }

  const a = render(top, 58, "d", C.fg, C.leaf, "left", 42);
  const b = render(bottom, 100, "s", C.muted, C.sky, "right", 34);

  const style = `${await fontFaces(["bricolage-800", "instrument-400"])}
.d{font-family:"Bricolage",sans-serif;font-weight:800}
.s{font-family:"Instrument",sans-serif}
${a.keyframe}
${b.keyframe}`;

  const body = `<linearGradient id="edge" x1="0" x2="1" y1="0" y2="0">
<stop offset="0" stop-color="${C.ink}"/><stop offset="0.07" stop-color="${C.ink}" stop-opacity="0"/>
<stop offset="0.93" stop-color="${C.ink}" stop-opacity="0"/><stop offset="1" stop-color="${C.ink}"/>
</linearGradient>
<rect width="${W}" height="${H}" fill="${C.surface}" fill-opacity="0.6"/>
${a.group}
${b.group}
<rect width="${W}" height="${H}" fill="url(#edge)"/>`;

  return frame(
    W,
    H,
    "Teknologi dan topik",
    `Teknologi: ${SKILLS.join(", ")}. Topik: ${TOPICS.join(", ")}.`,
    style,
    body,
  );
}

// ---------- Statistik ----------

async function stats(data) {
  const W = 1200;
  const H = 340;
  const days = data.contributions.days;
  const nf = new Intl.NumberFormat("id-ID");

  let longest = 0;
  let run = 0;
  let active = 0;
  for (const [, n] of days) {
    if (n > 0) {
      active += 1;
      run += 1;
      longest = Math.max(longest, run);
    } else {
      run = 0;
    }
  }

  const values = [data.contributions.total, active, longest, data.user.publicRepos];

  const byMonth = new Map();
  for (const [date, n] of days) {
    const key = date.slice(0, 7);
    byMonth.set(key, (byMonth.get(key) ?? 0) + n);
  }
  const months = [...byMonth.entries()].slice(-12);
  const max = Math.max(1, ...months.map((m) => m[1]));
  const monthFmt = new Intl.DateTimeFormat("id-ID", { month: "short", timeZone: "UTC" });
  const updated = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(data.fetchedAt));

  const colW = (W - 112) / 4;
  const statBlocks = values
    .map((v, i) => {
      const x = r1(56 + colW * i);
      return `<g class="up" style="animation-delay:${(0.1 + i * 0.1).toFixed(2)}s">
<text x="${x}" y="150" class="d" font-size="64" letter-spacing="-2.6" fill="${i === 0 ? C.leaf : C.fg}">${safe(nf.format(v))}</text>
<text x="${x}" y="182" class="s" font-size="17" fill="${C.muted}">${safe(STATS_TEXT.labels[i])}</text>
</g>`;
    })
    .join("\n");

  const barTop = 214;
  const barBottom = 288;
  const slot = (W - 112) / months.length;
  const busiest = months.reduce((a, b) => (b[1] > a[1] ? b : a));
  const bars = months
    .map(([key, n], i) => {
      const h = Math.max(3, ((barBottom - barTop) * n) / max);
      const x = r1(56 + slot * i + 4);
      const w = r1(slot - 12);
      const label = monthFmt.format(new Date(`${key}-01T00:00:00Z`));
      const fill = key === busiest[0] ? C.leaf : C.sky;
      return `<rect class="bar" style="animation-delay:${(0.5 + i * 0.05).toFixed(2)}s" x="${x}" y="${r1(barBottom - h)}" width="${w}" height="${r1(h)}" rx="4" fill="${fill}" fill-opacity="${key === busiest[0] ? 1 : 0.75}"/>
<text x="${r1(x + w / 2)}" y="${barBottom + 24}" class="s" font-size="13" fill="${C.muted}" text-anchor="middle">${safe(label)}</text>`;
    })
    .join("\n");

  const style = `${await fontFaces(["bricolage-800", "instrument-400"])}
.d{font-family:"Bricolage",sans-serif;font-weight:800}
.s{font-family:"Instrument",sans-serif}
.up{animation:up .8s ${EASE} both}
.bar{transform-box:fill-box;transform-origin:bottom;animation:grow .9s ${EASE} both}
@keyframes up{from{transform:translateY(10px)}}
@keyframes grow{from{transform:scaleY(.25)}}`;

  const body = `<text x="56" y="62" class="d" font-size="24" letter-spacing="-0.5" fill="${C.fg}">${safe(STATS_TEXT.title)}</text>
<text x="${W - 56}" y="62" class="s" font-size="14" fill="${C.muted}" text-anchor="end">${safe(`${STATS_TEXT.updated} ${updated}`)}</text>
<line x1="56" y1="84" x2="${W - 56}" y2="84" stroke="${C.line}"/>
${statBlocks}
<line x1="56" y1="${barBottom}" x2="${W - 56}" y2="${barBottom}" stroke="${C.line}"/>
${bars}`;

  return frame(
    W,
    H,
    STATS_TEXT.title,
    `${nf.format(values[0])} kontribusi, ${values[1]} hari aktif, ${values[2]} hari beruntun terpanjang, ${values[3]} repositori publik.`,
    style,
    body,
  );
}

export async function renderReadmeAssets(data) {
  const github = data ?? JSON.parse(await readFile(DATA, "utf8"));
  const files = [
    ["banner.svg", await banner()],
    ["marquee.svg", await marquee()],
    ["stats.svg", await stats(github)],
  ];
  for (const [name, svg] of files) {
    await writeFile(new URL(name, OUT), svg);
  }
  console.log(`[readme] ${files.map((f) => f[0]).join(", ")} diperbarui`);
  await renderReadmeSections();
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await renderReadmeAssets();
}
