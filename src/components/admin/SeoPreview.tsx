"use client";

import { useEffect, useState } from "react";

type Lang = "id" | "en";
type Page = "home" | "archive";
type Text = { title: string; description: string };

export type SeoPreviewLabels = {
  title: string;
  intro: string;
  page: string;
  pages: Record<Page, string>;
  lang: string;
  langs: Record<Lang, string>;
  titleCount: string;
  descriptionCount: string;
  ideal: string;
  short: string;
  long: string;
  fallback: string;
  note: string;
};

// Batas perkiraan tampilan Google desktop. Google memotong berdasarkan lebar piksel,
// jadi angka ini hanya panduan; pratinjau memotong dengan CSS di lebar yang sama.
const RANGE = { title: [30, 60], description: [120, 160] } as const;

function fieldName(page: Page, part: keyof Text, lang: Lang) {
  return `f.${page}.${part}.${lang}`;
}

// Isi isian di formulir saat ini (kosong bila belum diisi).
function readForm(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const page of ["home", "archive"] as const) {
    for (const part of ["title", "description"] as const) {
      for (const lang of ["id", "en"] as const) {
        const name = fieldName(page, part, lang);
        const el = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${name}"]`);
        out[name] = el ? el.value.trim() : "";
      }
    }
  }
  return out;
}

// Pratinjau hasil pencarian Google untuk beranda dan arsip, diperbarui saat mengetik.
export default function SeoPreview({
  siteUrl,
  siteName,
  paths,
  defaults,
  labels,
}: {
  siteUrl: string;
  siteName: string;
  paths: Record<Page, Record<Lang, string>>;
  defaults: Record<Page, Record<Lang, Text>>;
  labels: SeoPreviewLabels;
}) {
  const [page, setPage] = useState<Page>("home");
  const [lang, setLang] = useState<Lang>("id");
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const update = () => setValues(readForm());
    // Setelah simpan, React mengosongkan formulir ke nilai baru; baca setelah reset selesai.
    const afterReset = () => window.setTimeout(update, 0);
    update();
    document.addEventListener("input", update);
    document.addEventListener("reset", afterReset, true);
    return () => {
      document.removeEventListener("input", update);
      document.removeEventListener("reset", afterReset, true);
    };
  }, []);

  const own = (part: keyof Text) => values[fieldName(page, part, lang)] ?? "";
  const title = own("title") || defaults[page][lang].title;
  const description = own("description") || defaults[page][lang].description;
  const crumbs = paths[page][lang].split("/").filter((p) => p !== "");
  const host = siteUrl.replace(/\/+$/, "");

  const count = (part: keyof Text, text: string, label: string) => {
    const [min, max] = RANGE[part];
    const n = text.length;
    const status = n < min ? "short" : n > max ? "long" : "ok";
    const hint = status === "short" ? labels.short : status === "long" ? labels.long : labels.ideal;
    return (
      <div className="seo-count" data-status={status}>
        <dt>{label}</dt>
        <dd>
          {hint.replace("{n}", String(n)).replace("{min}", String(min)).replace("{max}", String(max))}
          {own(part) === "" ? <span className="seo-fallback">{labels.fallback}</span> : null}
        </dd>
      </div>
    );
  };

  return (
    <section className="admin-card mt-6" aria-labelledby="seo-preview">
      <h2 id="seo-preview" className="font-display text-lg font-bold">
        {labels.title}
      </h2>
      <p className="mt-1 text-sm text-muted">{labels.intro}</p>

      <div className="seo-toggles mt-4">
        <div className="seo-toggle" role="group" aria-label={labels.page}>
          {(["home", "archive"] as const).map((p) => (
            <button key={p} type="button" aria-pressed={page === p} onClick={() => setPage(p)}>
              {labels.pages[p]}
            </button>
          ))}
        </div>
        <div className="seo-toggle" role="group" aria-label={labels.lang}>
          {(["id", "en"] as const).map((l) => (
            <button key={l} type="button" aria-pressed={lang === l} onClick={() => setLang(l)}>
              {labels.langs[l]}
            </button>
          ))}
        </div>
      </div>

      <div className="serp mt-4" lang={lang}>
        <div className="serp-site">
          <span className="serp-icon">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/favicon.svg" alt="" width={18} height={18} />
          </span>
          <span className="serp-meta">
            <span className="serp-name">{siteName}</span>
            <span className="serp-url">
              {host}
              {crumbs.map((c) => (
                <span key={c}> › {c}</span>
              ))}
            </span>
          </span>
        </div>
        <p className="serp-title">{title}</p>
        <p className="serp-desc">{description}</p>
      </div>

      <dl className="seo-counts mt-4">
        {count("title", title, labels.titleCount)}
        {count("description", description, labels.descriptionCount)}
      </dl>
      <p className="mt-3 text-sm text-muted">{labels.note}</p>
    </section>
  );
}
