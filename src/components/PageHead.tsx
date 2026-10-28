import Reveal from "@/components/Reveal";
import { copy, site, type Lang } from "@/data/profile";
import { jsonForScript } from "@/lib/json-script";
import { homePath } from "@/lib/nav";

// Kepala halaman dalam: breadcrumb kecil "Beranda / Judul", satu h1, satu kalimat pembuka,
// dan data terstruktur BreadcrumbList untuk mesin pencari.
export default function PageHead({
  lang,
  id,
  title,
  intro,
  path,
}: {
  lang: Lang;
  id: string; // id h1, dipakai aria-labelledby
  title: string;
  intro: string;
  path: string;
}) {
  const t = copy[lang];
  const crumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: t.nav.home, item: `${site.url}${homePath(lang)}` },
      { "@type": "ListItem", position: 2, name: title, item: `${site.url}${path}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonForScript(crumbsJsonLd) }} />
      <nav aria-label={t.archive.crumbs} className="crumbs">
        <ol>
          <li>
            <a href={homePath(lang)} className="link">
              {t.nav.home}
            </a>
          </li>
          <li aria-current="page">{title}</li>
        </ol>
      </nav>
      <Reveal className="section-head max-w-3xl">
        <h1 id={id} className="section-title">
          {title}
        </h1>
        <p className="section-intro">{intro}</p>
      </Reveal>
    </>
  );
}
