import ExternalLink from "@/components/ExternalLink";
import Monogram from "@/components/Monogram";
import WordmarkSpotlight from "@/components/WordmarkSpotlight";
import { copy, site, type Lang } from "@/data/profile";
import { archivePath } from "@/lib/achievements";
import { homePath } from "@/lib/nav";
import { loadSite } from "@/server/content";

// Profil yang tampil di kolom Profil, diambil dari kanal kontak dan profil riset di CMS.
const PROFILE_LABELS = ["GitHub", "LinkedIn", "Google Scholar", "SINTA"];

// Footer yang sama untuk beranda, arsip capaian, dan halaman detail (versi 3, "Sorot").
// Atas: monogram, nama, peran, dan tiga kolom tautan. Dasar: wordmark "ngiliyun" bergaris tepi
// yang terisi gradasi hijau ke biru di sekitar kursor. Rasional ada di docs/logo-options/v2/.
// otherHref adalah halaman yang sama dalam bahasa lain.
export default async function SiteFooter({ lang, otherHref }: { lang: Lang; otherHref?: string }) {
  const t = copy[lang];
  const home = homePath(lang);
  const other: Lang = lang === "id" ? "en" : "id";
  const content = await loadSite();
  const known = [
    ...content.channel.map((c) => ({ label: c.data.label, href: c.data.href })),
    ...content.profile.researchProfiles,
  ];
  const profiles = PROFILE_LABELS.map((label) => known.find((k) => k.label === label)).filter((k) => k !== undefined);

  const explore = [
    { label: t.archive.home, href: home },
    { label: t.nav.projects, href: `${home}#projects` },
    { label: t.archive.title, href: archivePath(lang) },
    { label: t.nav.research, href: `${home}#research` },
    { label: t.nav.teaching, href: `${home}#teaching` },
  ];
  const own = [
    { label: t.footer.otherLang, href: otherHref ?? homePath(other), lang: other },
    { label: t.nav.contact, href: `${home}#contact` },
    { label: t.footer.top, href: "#main" },
  ];

  return (
    <footer className="footer">
      <div className="footer-inner mx-auto max-w-6xl px-5 sm:px-8">
        <div className="footer-top">
          <div>
            <div className="flex items-center gap-4">
              <Monogram className="h-14 w-14" />
              <p className="font-display text-2xl font-extrabold tracking-tight">{site.fullName}</p>
            </div>
            <p className="mt-4 max-w-[40ch] text-muted">{t.footer.jobTitle}</p>
          </div>
          <nav className="footer-cols" aria-label={t.footer.linksLabel}>
            <div>
              <h2 className="footer-col-title">{t.footer.explore}</h2>
              <ul>
                {explore.map((l) => (
                  <li key={l.href}>
                    <a href={l.href} className="footer-link">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="footer-col-title">{t.footer.profiles}</h2>
              <ul>
                {profiles.map((l) => (
                  <li key={l.href}>
                    <ExternalLink href={l.href} newTab={t.newTab} className="footer-link">
                      {l.label}
                    </ExternalLink>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="footer-col-title">{t.footer.site}</h2>
              <ul>
                {own.map((l) => (
                  <li key={l.href}>
                    <a href={l.href} className="footer-link" hrefLang={l.lang} lang={l.lang}>
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>
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
