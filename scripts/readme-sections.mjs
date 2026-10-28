// Membangkitkan bagian README.md dari konten PUBLIC di database CMS, supaya data cukup ditulis sekali:
//   proyek      dari koleksi project dan system
//   capaian     dari koleksi achievement dan pengaturan metrics
//   mengajar    dari koleksi institution, course, term, dan focus
//   perjalanan  dari koleksi milestone
//
// Setiap bagian berada di antara penanda komentar di README.md, misalnya
//   <!-- capaian:mulai --> ... <!-- capaian:selesai -->
// Teks di luar penanda ditulis manual dan tidak disentuh skrip ini.
// Jalankan: npm run readme  (otomatis juga dijalankan oleh npm run data dan prebuild)
// Butuh DATABASE_URL. Tanpa database, README dibiarkan apa adanya.

import { readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { loadPublicContent } from "./db/content.mjs";
import { importTs } from "./lib/load-ts.mjs";

const ROOT = new URL("../", import.meta.url);
const README = new URL("README.md", ROOT);
const SITE = "https://ngiliyun.my.id";
const LIMIT_FEATURED = 6;
const LIMIT_HKI = 5;

const monthYear = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric", timeZone: "UTC" });
const fullDate = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

function partial(d) {
  if (d === null || d === undefined) return "";
  if (d.month === undefined) return String(d.year);
  return monthYear.format(new Date(Date.UTC(d.year, d.month - 1, 1)));
}

function dateKey(d) {
  if (d === null || d === undefined) return 0;
  return d.year * 10000 + (d.month ?? 0) * 100 + (d.day ?? 0);
}

// Teks tabel Markdown tidak boleh memuat garis tegak.
function cell(text) {
  return String(text).replace(/\|/g, "/").replace(/\s+/g, " ").trim();
}

function firstSentence(text) {
  const m = text.match(/^(.+?\.)(\s|$)/);
  return m ? m[1] : text;
}

function verifyLabel(url) {
  const host = new URL(url).hostname.replace(/^www\./, "");
  if (host.endsWith("dicoding.com")) return "Dicoding";
  if (host.endsWith("credly.com")) return "Credly";
  if (host.endsWith("coursera.org")) return "Coursera";
  if (host.endsWith("microsoft.com")) return "Microsoft Learn";
  return host;
}

function proyek(c, copy) {
  const rows = c.projects.map((p) => {
    const notes = [p.stack];
    if (p.copyright) notes.push("hak cipta terdaftar");
    if (p.badge) notes.push(p.badge.id);
    const links = [];
    if (p.demo) links.push(`[Demo](${p.demo})`);
    links.push(`[Kode](${p.repo})`);
    return `| **[${p.name}](${p.repo})**<br><sub>${cell(notes.join(", "))}</sub> | ${cell(p.summary.id)} | ${links.join("<br>")} |`;
  });

  const systems = c.systems.map((s) => {
      const name = s.full ? `**${s.name}** (${s.full})` : `**${s.name}**`;
      const code = s.repo ? `, [kode](${s.repo})` : "";
      return `- ${name}, ${s.period.id}. ${firstSentence(s.summary.id)} <sub>${s.stack.join(", ")}${code}</sub>`;
    });

  return [
    "### Proyek unggulan",
    "",
    "| Proyek | Tentang | Tautan |",
    "| :-- | :-- | :-- |",
    ...rows,
    "",
    `**${copy.id.projects.systemsTitle}** <sub>(${copy.id.projects.privateRepo.toLowerCase()})</sub>`,
    "",
    ...systems,
  ].join("\n");
}

function capaian(pub, metrics) {
  const newest = (a, b) => dateKey(b.issued) - dateKey(a.issued);
  const featured = pub.filter((a) => a.featured === true).sort(newest).slice(0, LIMIT_FEATURED);
  const hki = pub.filter((a) => a.kind === "hki");
  const hkiHome = hki.filter((a) => a.showOnHome === true).sort(newest).slice(0, LIMIT_HKI);
  const pubs = pub.filter((a) => a.kind === "publikasi");
  const creds = pub.filter((a) => a.kind === "sertifikat" || a.kind === "pelatihan");
  const { scholar, sinta } = metrics;
  const asOf = fullDate.format(new Date(`${scholar.source.asOf}T00:00:00Z`));

  const rows = featured.map((a) => {
    const verify = a.verifyUrl
      ? `[${verifyLabel(a.verifyUrl)}](${a.verifyUrl})`
      : `[Detail](${SITE}/sertifikat/${a.id}/)`;
    return `| **${cell(a.title.id)}** | ${cell(a.issuer)} | ${partial(a.issued)} | ${verify} |`;
  });

  const hkiLine = hkiHome
    .map((a) => `${a.title.id.replace(/^Hak cipta program komputer:\s*/, "")} (${partial(a.issued)})`)
    .join(", ");

  return [
    "### Sertifikat dan capaian",
    "",
    `**${hki.length} hak cipta** program komputer terdaftar di DJKI, **${pubs.length} publikasi** ilmiah, dan **${creds.length} sertifikat serta pelatihan** yang bisa diverifikasi. Per ${asOf}: ${scholar.citations} sitasi dan h-index ${scholar.hIndex} di [Google Scholar](${scholar.source.url}), skor [SINTA](${sinta.source.url}) ${sinta.scoreOverall}.`,
    "",
    "| Sorotan | Penerbit | Terbit | Verifikasi |",
    "| :-- | :-- | :-- | :-- |",
    ...rows,
    "",
    `**Hak cipta terbaru:** ${hkiLine}.`,
    "",
    `Arsip lengkap dengan tautan verifikasi resmi ada di [ngiliyun.my.id/sertifikat](${SITE}/sertifikat/).`,
  ].join("\n");
}

function mengajar(c, copy, programs) {
  const { teaching, terms, currentTerm, teachingFocus } = c;
  const t = copy.id.teaching;
  const cols = teaching.map((inst, i) => {
    const now = inst.courses.filter((c) => c.terms.includes(currentTerm));
    const past = inst.courses.filter((c) => !c.terms.includes(currentTerm));
    const li = now.map((c) => {
      const prog = c.programs.map((p) => programs[p].id).join(", ");
      const repo = c.repo ? `, <a href="${c.repo}">materi</a>` : "";
      return `        <li>${c.name.id} <sub>${prog}</sub>${repo}</li>`;
    });
    const width = i === 0 ? ` width="50%"` : "";
    return [
      `    <td valign="top"${width}>`,
      `      <b>${inst.name}</b><br>`,
      `      <sub>${inst.role.id}</sub>`,
      `      <p><b>${t.current}</b> <sub>${terms[currentTerm].id}</sub></p>`,
      "      <ul>",
      ...li,
      "      </ul>",
      past.length === 0 ? "" : `      <p><b>${t.past}</b><br><sub>${past.map((c) => c.name.id).join(", ")}</sub></p>`,
      `      <sub>${inst.note.id}</sub>`,
      "    </td>",
    ]
      .filter((line) => line !== "")
      .join("\n");
  });

  const focus = teachingFocus.map((f) => f.title.id).join("; ");
  return [
    "### Mengajar",
    "",
    "<table>",
    "  <tr>",
    ...cols,
    "  </tr>",
    "</table>",
    "",
    `**${t.focusTitle}:** ${focus}.`,
  ].join("\n");
}

function perjalanan(c) {
  const rows = c.journey.map((m) => `| **${m.when.id}** | ${cell(m.title.id)}. ${cell(m.body.id)} |`);
  return ["### Perjalanan", "", "| Waktu | Peristiwa |", "| :-- | :-- |", ...rows].join("\n");
}

function replaceBlock(text, name, body) {
  const start = `<!-- ${name}:mulai -->`;
  const end = `<!-- ${name}:selesai -->`;
  const a = text.indexOf(start);
  const b = text.indexOf(end);
  if (a === -1 || b === -1 || b < a) {
    throw new Error(`Penanda ${start} atau ${end} tidak ditemukan di README.md`);
  }
  return `${text.slice(0, a + start.length)}\n${body}\n${text.slice(b)}`;
}

export async function renderReadmeSections() {
  if (!process.env.DATABASE_URL) {
    console.warn("[readme] DATABASE_URL belum diatur, bagian teks README dilewati");
    return;
  }
  const { copy } = await importTs(new URL("src/data/profile.ts", ROOT));
  const { programLabels } = await importTs(new URL("src/content/types.ts", ROOT));
  const { by, metrics } = await loadPublicContent();
  const data = (k) => (by[k] ?? []).map((e) => e.data);
  const terms = Object.fromEntries(data("term").map((t) => [t.code, t.label]));
  const c = {
    projects: data("project"),
    systems: data("system"),
    achievements: (by.achievement ?? []).map((e) => ({ ...e.data, id: e.slug })),
    teaching: (by.institution ?? []).map((i) => ({
      ...i.data,
      courses: data("course").filter((x) => x.institution === i.slug),
    })),
    terms,
    currentTerm: data("term").find((t) => t.current)?.code ?? "",
    teachingFocus: data("focus"),
    journey: data("milestone"),
  };

  let text = await readFile(README, "utf8");
  text = replaceBlock(text, "proyek", proyek(c, copy));
  text = replaceBlock(text, "capaian", capaian(c.achievements, metrics));
  text = replaceBlock(text, "mengajar", mengajar(c, copy, programLabels));
  text = replaceBlock(text, "perjalanan", perjalanan(c));

  const emDash = String.fromCharCode(0x2014);
  if (text.includes(emDash)) throw new Error("README.md memuat em dash setelah dibangkitkan");

  await writeFile(README, text);
  console.log("[readme] bagian proyek, capaian, mengajar, dan perjalanan di README.md diperbarui");
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { loadEnvQuiet } = await import("./db/env.mjs");
  loadEnvQuiet();
  await renderReadmeSections();
}
