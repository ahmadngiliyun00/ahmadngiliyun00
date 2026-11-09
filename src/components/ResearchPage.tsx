import Analytics from "@/components/Analytics";
import CountUp from "@/components/CountUp";
import ExternalLink from "@/components/ExternalLink";
import PageHead from "@/components/PageHead";
import Reveal from "@/components/Reveal";
import Section from "@/components/Section";
import SubpageShell from "@/components/SubpageShell";
import { authorshipLabels, kindLabels } from "@/content/types";
import { copy, type Lang } from "@/data/profile";
import { countKind, detailPath, publicItems, publicationsByYear } from "@/lib/achievements";
import { formatDate } from "@/lib/github";
import { pagePath } from "@/lib/nav";
import { loadSite } from "@/server/content";

// Halaman Riset dan Publikasi (/riset/, /en/research/): angka sitasi bertanggal, tema riset,
// hibah, reviewer jurnal, profil riset, daftar publikasi per tahun, serta buku dan hak cipta.
// Halaman detailnya beralamat per kategori, misalnya /buku/<slug>/ dan /hak-cipta/<slug>/.
export default async function ResearchPage({ lang }: { lang: Lang }) {
  const t = copy[lang];
  const other: Lang = lang === "id" ? "en" : "id";
  const content = await loadSite();
  const profile = content.profile;
  const { scholar, sinta, garuda } = content.metrics;
  const achievements = publicItems(content.achievement);
  const grants = achievements.filter((a) => a.kind === "hibah");
  const reviewing = achievements.filter((a) => a.kind === "reviewer");
  const pubYears = publicationsByYear(achievements);
  const pubCount = countKind(achievements, "publikasi");
  // Keluaran riset selain artikel jurnal. Kelompok kosong tidak ditampilkan.
  const outputs = (["buku", "hki"] as const)
    .map((kind) => ({ kind, label: kindLabels[kind][lang], items: achievements.filter((a) => a.kind === kind) }))
    .filter((g) => g.items.length > 0);

  const indicators = [
    { value: scholar.citations, label: t.achievements.citations },
    { value: scholar.hIndex, label: t.achievements.hIndex },
    { value: scholar.i10Index, label: t.research.i10Index },
    { value: sinta.scoreOverall, label: t.achievements.sinta },
    { value: garuda.documents, label: t.research.garudaDocs },
  ];
  const sources = [scholar.source, sinta.source, garuda.source];

  return (
    <SubpageShell lang={lang} current="research" backHome otherHref={pagePath(other, "research")}>
      <Analytics />
      <div className="page-head mx-auto max-w-6xl px-5 sm:px-8">
        <PageHead
          lang={lang}
          id="page-title"
          title={t.pages.research.title}
          intro={t.pages.research.intro}
          path={pagePath(lang, "research")}
        />
      </div>

      <Section id="metrics" title={t.research.metricsTitle} intro={t.research.metricsIntro}>
        <Reveal>
          <div className="stats stats-5">
            {indicators.map((s) => (
              <div key={s.label} className="stat">
                <CountUp value={s.value} lang={lang} className="stat-value" />
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
          <p className="indicator-foot">
            <span className="flex flex-wrap gap-x-4 gap-y-1">
              {sources.map((src) => (
                <ExternalLink key={src.name} href={src.url} newTab={t.newTab} className="link">
                  {t.research.sourceAsOf.replace("{source}", src.name).replace("{date}", formatDate(src.asOf, lang))}
                </ExternalLink>
              ))}
            </span>
            <span>
              {t.research.sintaThreeYears}: {sinta.score3Years}
            </span>
          </p>
        </Reveal>
      </Section>

      <Section id="themes" title={t.research.focusTitle} intro={t.research.focusIntro}>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="grid content-start gap-10">
            <Reveal>
              <h3 className="sub-title">{t.research.themesTitle}</h3>
              <ul className="tags mt-5">
                {profile.researchThemes[lang].map((theme) => (
                  <li key={theme}>{theme}</li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={80}>
              <h3 className="sub-title">{t.research.profilesTitle}</h3>
              <ul className="profile-links mt-5">
                {profile.researchProfiles.map((p) => (
                  <li key={p.label}>
                    <ExternalLink href={p.href} newTab={t.newTab} className="btn btn-line btn-small">
                      {p.label}
                    </ExternalLink>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <div className="grid content-start gap-10">
            {grants.length === 0 ? null : (
              <Reveal delay={80}>
                <h3 className="sub-title">{t.research.grantTitle}</h3>
                {grants.map((g) => (
                  <div key={g.id} className="grant mt-5" data-spot>
                    <p className="cred-meta">
                      <span>{g.issuer}</span>
                      <span>{g.issued ? g.issued.year : ""}</span>
                    </p>
                    <h4 className="mt-3 font-display text-xl font-bold tracking-tight">
                      <a href={detailPath(lang, g)} className="cred-link">
                        {g.title[lang]}
                      </a>
                    </h4>
                    {g.summary ? <p className="mt-3 text-sm text-muted">{g.summary[lang]}</p> : null}
                  </div>
                ))}
              </Reveal>
            )}
            {reviewing.length === 0 ? null : (
              <Reveal delay={120}>
                <h3 className="sub-title">{t.research.reviewerTitle}</h3>
                {reviewing.map((r) => (
                  <div key={r.id} className="grant mt-5" data-spot>
                    <p className="cred-meta">
                      <span>{r.issuer}</span>
                      <span>{r.ongoing ? t.detail.ongoing : r.issued ? r.issued.year : ""}</span>
                    </p>
                    <h4 className="mt-3 font-display text-xl font-bold tracking-tight">
                      <a href={detailPath(lang, r)} className="cred-link">
                        {r.title[lang]}
                      </a>
                    </h4>
                    {r.summary ? <p className="mt-3 text-sm text-muted">{r.summary[lang]}</p> : null}
                  </div>
                ))}
              </Reveal>
            )}
          </div>
        </div>
      </Section>

      <Section
        id="publications"
        title={t.research.publicationsTitle}
        intro={t.research.publicationsIntro}
        action={<p className="text-sm text-muted">{t.research.publicationCount.replace("{n}", String(pubCount))}</p>}
      >
        <div className="pubs">
          {pubYears.map((group) => (
            <Reveal key={group.year} className="pub-year">
              <h3 className="pub-year-label">{group.year}</h3>
              <ul className="pub-list">
                {group.items.map((pub) => (
                  <li key={pub.id} className="pub">
                    <a href={detailPath(lang, pub)} className="pub-title">
                      {pub.title[lang]}
                    </a>
                    <p className="pub-meta">
                      <span>{pub.issuer}</span>
                      {pub.authorship ? (
                        <span className="pub-badge" data-pos={pub.authorship}>
                          {authorshipLabels[pub.authorship][lang]}
                        </span>
                      ) : null}
                    </p>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
        <p className="mt-8 text-sm text-muted">{t.research.noLink}</p>
      </Section>

      {outputs.length === 0 ? null : (
        <Section id="outputs" title={t.research.outputsTitle} intro={t.research.outputsIntro}>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {outputs.map((group, i) => (
              <Reveal key={group.kind} delay={i * 80}>
                <h3 className="sub-title">{group.label}</h3>
                <ul className="pub-list mt-5">
                  {group.items.map((item) => (
                    <li key={item.id} className="pub">
                      <a href={detailPath(lang, item)} className="pub-title">
                        {item.title[lang]}
                      </a>
                      <p className="pub-meta">
                        <span>{item.issuer}</span>
                        {item.issued ? <span>{item.issued.year}</span> : null}
                      </p>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </Section>
      )}
    </SubpageShell>
  );
}
