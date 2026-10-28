"use client";

import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/instrument-sans";
import "@/app/globals.css";
import { useEffect, useState } from "react";
import BackButton from "@/components/BackButton";
import ErrorView from "@/components/ErrorView";
import Monogram from "@/components/Monogram";
import { errorDigest } from "@/components/ServerErrorPage";
import { copy, site, type Lang } from "@/data/profile";

// Galat di root layout (misalnya layout gagal dirender). Menggantikan seluruh dokumen, jadi memasang
// <html>, <body>, gaya, dan font sendiri. Bahasa ditebak dari alamat: /en/ berarti Inggris.
export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  const [lang, setLang] = useState<Lang>("id");
  useEffect(() => {
    if (window.location.pathname.startsWith("/en/")) setLang("en");
    console.error(error);
  }, [error]);
  const e = copy[lang].errors;
  const home = lang === "id" ? "/" : "/en/";

  return (
    <html lang={lang} data-scroll-behavior="smooth">
      <body>
        <title>{`${e.server.title} | ${site.name}`}</title>
        <main id="main">
          <header className="error-bar mx-auto max-w-6xl px-5 sm:px-8">
            <a href={home} className="flex items-center gap-2.5 font-display font-bold tracking-tight">
              <Monogram className="h-8 w-8" />
              {site.name}
            </a>
          </header>
          <ErrorView
            code={500}
            page={e.server}
            labels={e}
            reference={errorDigest(error)}
            actions={
              <>
                <button type="button" className="btn btn-solid" onClick={() => retry()}>
                  <span aria-hidden="true">↻</span>
                  {e.retry}
                </button>
                <BackButton fallback={home} className="btn btn-line">
                  <span aria-hidden="true">←</span>
                  {e.back}
                </BackButton>
                <a href={home} className="btn btn-line">
                  {e.home}
                </a>
              </>
            }
          />
        </main>
      </body>
    </html>
  );
}
