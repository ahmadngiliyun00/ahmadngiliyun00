import Monogram from "@/components/Monogram";
import WordmarkSpotlight from "@/components/WordmarkSpotlight";
import { copy, site, type Lang } from "@/data/profile";
import { footerLinks } from "@/lib/nav";

// Footer yang sama untuk beranda dan semua halaman dalam.
// Atas: monogram, nama, peran, dan tautan ke semua halaman. Dasar: wordmark "ngiliyun" bergaris tepi yang terisi
// gradasi hijau ke biru di sekitar kursor (versi 3, "Sorot", di docs/logo-options/v2/).
export default function SiteFooter({ lang }: { lang: Lang }) {
  const t = copy[lang];
  return (
    <footer className="footer">
      <div className="footer-inner mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div className="flex items-center gap-4">
            <Monogram className="h-14 w-14" />
            <div>
              <p className="font-display text-2xl font-extrabold tracking-tight">{site.fullName}</p>
              <p className="max-w-[44ch] text-sm text-muted">{t.footer.jobTitle}</p>
            </div>
          </div>
          <a href="#main" className="btn btn-line btn-small">
            {t.footer.top}
          </a>
        </div>
        <nav aria-label={t.nav.footerLabel} className="footer-nav">
          <ul>
            {footerLinks(lang).map((l) => (
              <li key={l.href}>
                <a href={l.href} className="nav-link">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="footer-legal">
          <p>
            © {new Date().getFullYear()} {site.name} | ngiliyun.my.id
          </p>
          <p>{t.footer.built}</p>
        </div>
        <WordmarkSpotlight />
      </div>
    </footer>
  );
}
