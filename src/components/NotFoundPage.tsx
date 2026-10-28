import BackButton from "@/components/BackButton";
import ErrorView from "@/components/ErrorView";
import SubpageShell from "@/components/SubpageShell";
import { copy, site, type Lang } from "@/data/profile";
import { footerLinks, homePath } from "@/lib/nav";

// Halaman 404 situs ID dan EN, lengkap dengan header dan footer situs.
export default function NotFoundPage({ lang }: { lang: Lang }) {
  const t = copy[lang];
  const e = t.errors;
  const home = homePath(lang);
  // Beranda dan Kontak sudah ada di tombol; sisanya menjadi saran halaman.
  const suggestions = footerLinks(lang).filter((l) => l.href !== home).filter((l) => !l.href.includes("#"));

  return (
    <SubpageShell lang={lang} otherHref={homePath(lang === "id" ? "en" : "id")}>
      <title>{`${e.notFound.title} | ${site.name}`}</title>
      <meta name="robots" content="noindex" />
      <ErrorView
        code={404}
        page={e.notFound}
        labels={e}
        actions={
          <>
            <BackButton fallback={home} className="btn btn-solid">
              <span aria-hidden="true">←</span>
              {e.back}
            </BackButton>
            <a href={home} className="btn btn-line">
              {e.home}
            </a>
          </>
        }
      >
        <nav aria-labelledby="error-suggestions" className="error-suggestions mx-auto max-w-6xl px-5 sm:px-8">
          <h2 id="error-suggestions" className="error-suggestions-title">
            {e.suggestions}
          </h2>
          <ul>
            {suggestions.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="error-suggestion">
                  {l.label}
                  <span aria-hidden="true">→</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </ErrorView>
    </SubpageShell>
  );
}
