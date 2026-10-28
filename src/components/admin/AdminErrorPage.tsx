"use client";

import { useEffect } from "react";
import BackButton from "@/components/BackButton";
import ErrorView from "@/components/ErrorView";
import Monogram from "@/components/Monogram";
import { errorDigest } from "@/components/ServerErrorPage";
import { adminCopy } from "@/data/admin";
import { copy } from "@/data/profile";

// Halaman 404 dan 500 CMS. Tanpa header situs; tombolnya kembali ke ringkasan CMS.
// Dipakai not-found.tsx (server) dan error.tsx (klien) di /admin, jadi komponen klien.
export default function AdminErrorPage({
  code,
  error,
  retry,
}: {
  code: 404 | 500;
  error?: unknown;
  retry?: () => void;
}) {
  const e = copy.id.errors;
  const a = adminCopy.errors;
  const page = code === 404 ? a.notFound : a.server;
  useEffect(() => {
    if (error !== undefined) console.error(error);
  }, [error]);

  return (
    <main id="main" className="admin-error">
      <title>{`${page.title} | ${adminCopy.meta.title}`}</title>
      <header className="error-bar mx-auto max-w-6xl px-5 sm:px-8">
        <a href="/admin/" className="admin-brand">
          <Monogram className="h-8 w-8" />
          CMS
        </a>
      </header>
      <ErrorView
        code={code}
        page={page}
        labels={e}
        reference={error === undefined ? undefined : errorDigest(error)}
        actions={
          <>
            {retry ? (
              <button type="button" className="btn btn-solid" onClick={() => retry()}>
                <span aria-hidden="true">↻</span>
                {e.retry}
              </button>
            ) : null}
            <BackButton fallback="/admin/" className={retry ? "btn btn-line" : "btn btn-solid"}>
              <span aria-hidden="true">←</span>
              {e.back}
            </BackButton>
            <a href="/admin/" className="btn btn-line">
              {a.dashboard}
            </a>
            <a href="/" className="btn btn-line">
              {a.site}
            </a>
          </>
        }
      />
    </main>
  );
}
