"use client";

import { useEffect } from "react";
import BackButton from "@/components/BackButton";
import ErrorView from "@/components/ErrorView";
import SubpageShell from "@/components/SubpageShell";
import { copy, site, type Lang } from "@/data/profile";
import { homePath } from "@/lib/nav";

interface ErrorWithDigest extends Error {
  digest?: string;
}

// Kode referensi dari Next.js (error.digest) untuk dicocokkan dengan log server (pm2 logs).
export function errorDigest(error: unknown): string | undefined {
  if (error instanceof Error) {
    const digest = (error as ErrorWithDigest).digest;
    return typeof digest === "string" ? digest : undefined;
  }
  return undefined;
}

// Halaman 500 situs ID dan EN (dipakai error.tsx), lengkap dengan header dan footer situs.
export default function ServerErrorPage({ lang, error, retry }: { lang: Lang; error: unknown; retry: () => void }) {
  const e = copy[lang].errors;
  const home = homePath(lang);
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <SubpageShell lang={lang} otherHref={homePath(lang === "id" ? "en" : "id")}>
      <title>{`${e.server.title} | ${site.name}`}</title>
      <meta name="robots" content="noindex" />
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
    </SubpageShell>
  );
}
