import type { ReactNode } from "react";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import { copy, site, type Lang } from "@/data/profile";
import { type CurrentPage, homePath, navItems } from "@/lib/nav";

// Kerangka halaman selain beranda: header, konten, tautan kembali ke beranda (opsional), footer.
// otherHref adalah halaman yang sama dalam bahasa lain.
export default function SubpageShell({
  lang,
  otherHref,
  current,
  backHome = false,
  children,
}: {
  lang: Lang;
  otherHref: string;
  current?: CurrentPage;
  backHome?: boolean;
  children: ReactNode;
}) {
  const t = copy[lang];
  return (
    <>
      <a href="#main" className="skip-link">
        {t.nav.skip}
      </a>
      <Header
        lang={lang}
        items={navItems(lang, current)}
        labels={t.nav}
        homeHref={homePath(lang)}
        otherHref={otherHref}
        name={site.name}
      />
      <main id="main" className="subpage">
        {children}
        {backHome ? (
          <div className="back-home mx-auto max-w-6xl px-5 sm:px-8">
            <a href={homePath(lang)} className="btn btn-line">
              {t.nav.backHome}
            </a>
          </div>
        ) : null}
      </main>
      <SiteFooter lang={lang} />
    </>
  );
}
