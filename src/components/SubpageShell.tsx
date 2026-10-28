import type { ReactNode } from "react";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import { copy, site, type Lang } from "@/data/profile";
import { homePath, navItems } from "@/lib/nav";

// Kerangka halaman selain beranda: header dengan tautan ke bagian beranda, konten, footer.
// otherHref adalah halaman yang sama dalam bahasa lain.
export default function SubpageShell({
  lang,
  otherHref,
  children,
}: {
  lang: Lang;
  otherHref: string;
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
        items={navItems(lang, false)}
        labels={t.nav}
        homeHref={homePath(lang)}
        otherHref={otherHref}
        name={site.name}
      />
      <main id="main" className="subpage">
        {children}
      </main>
      <SiteFooter lang={lang} />
    </>
  );
}
