import type { CSSProperties, ReactNode } from "react";
import AchievementHighlights from "@/components/AchievementHighlights";
import Analytics from "@/components/Analytics";
import AreaIcon from "@/components/AreaIcon";
import ContactPanel from "@/components/ContactPanel";
import ContributionGraph from "@/components/ContributionGraph";
import CountUp from "@/components/CountUp";
import ExternalLink from "@/components/ExternalLink";
import Header from "@/components/Header";
import KMeans from "@/components/KMeans";
import LiveClock from "@/components/LiveClock";
import Marquee from "@/components/Marquee";
import NewsCard from "@/components/NewsCard";
import ProjectVisual from "@/components/ProjectVisual";
import Reveal from "@/components/Reveal";
import SiteFooter from "@/components/SiteFooter";
import Spotlight from "@/components/Spotlight";
import Timeline from "@/components/Timeline";
import { authorshipLabels, programLabels, type Course, type Lang } from "@/content/types";
import { copy, site } from "@/data/profile";
import {
  archivePath,
  countKind,
  detailPath,
  homeCopyrights,
  homeFeatured,
  publicItems,
  publicationsByYear,
  toCards,
} from "@/lib/achievements";
import {
  formatDate,
  formatMonthYear,
  formatNumber,
  getContributionModel,
  getGithubMeta,
  getRecentRepos,
  languageColors,
} from "@/lib/github";
import { jsonForScript } from "@/lib/json-script";
import { navItems } from "@/lib/nav";
import { isoPartialDate, postsPath, publicPosts } from "@/lib/posts";
import { loadSite } from "@/server/content";

function d(ms: number): CSSProperties {
  return { "--d": `${ms}ms` } as CSSProperties;
}

function Section({
  id,
  title,
  intro,
  children,
  wide = false,
}: {
  id: string;
  title: string;
  intro?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="section">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className={wide ? "section-head" : "section-head max-w-3xl"}>
          <h2 id={`${id}-title`} className="section-title">
            {title}
          </h2>
          {intro ? <p className="section-intro">{intro}</p> : null}
        </Reveal>
        {children}
      </div>
    </section>
  );
}

function Letters({ text, start, className }: { text: string; start: number; className: string }) {
  return (
    <span className={`name-line ${className}`} aria-hidden="true">
      {[...text].map((ch, i) => (
        <span key={`${ch}-${i}`} className="name-char" style={d(start + i * 45)}>
          {ch}
        </span>
      ))}
    </span>
  );
}

// Tahun akademik unik dari daftar kode semester, misalnya "2024/2025, 2025/2026".
function termYears(course: Course, lang: Lang, currentTerm: string, terms: Map<string, { id: string; en: string }>): string {
  const labels = course.terms
    .filter((code) => code !== currentTerm)
    .map((code) => terms.get(code)?.[lang] ?? code);
  return [...new Set(labels)].sort().join(", ");
}

function programNames(course: Course, lang: Lang): string {
  return course.programs.map((p) => programLabels[p][lang]).join(", ");
}

export default async function PortfolioPage({ lang }: { lang: Lang }) {
  const t = copy[lang];
  const content = await loadSite();
  const profile = content.profile;
  const { scholar, sinta } = content.metrics;
  const areas = content.area.map((e) => e.data);
  const channels = content.channel.map((e) => e.data);
  const collabs = content.collab.map((e) => e.data);
  const contributions = content.contribution.map((e) => e.data);
  const featured = content.project.map((e) => e.data);
  const journey = content.milestone.map((e) => e.data);
  const plans = content.plan.map((e) => e.data);
  const principles = content.principle.map((e) => e.data);
  const learning = profile.learning ? profile.learning[lang] : [];
  const teachingFocus = content.focus.map((e) => e.data);
  const termMap = new Map(content.term.map((e) => [e.data.code, e.data.label]));
  const currentTerm = content.term.find((e) => e.data.current)?.data.code ?? "";
  const teaching = content.institution.map((inst) => ({
    ...inst.data,
    courses: content.course.filter((c) => c.data.institution === inst.slug).map((c) => c.data),
  }));
  const achievements = publicItems(content.achievement);
  const home = lang === "id" ? "/" : "/en/";
  const otherHome = lang === "id" ? "/en/" : "/";
  const contrib = getContributionModel(lang);
  const gh = getGithubMeta();
  const recent = getRecentRepos(featured.map((p) => p.repo));
  const dateLocale = lang === "id" ? "id-ID" : "en-GB";
  const cardLabels = { verify: t.achievements.verify, details: t.achievements.details, newTab: t.newTab };
  const shownSystems = content.system.map((e) => e.data);
  const grants = achievements.filter((a) => a.kind === "hibah");
  const pubYears = publicationsByYear(achievements);
  const totalPublic = achievements.length;
  const posts = publicPosts(content.post);
  const latestPosts = posts.slice(0, 3);

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    honorificSuffix: "M.Kom.",
    url: site.url,
    jobTitle: t.meta.jobTitle,
    worksFor: { "@type": "CollegeOrUniversity", name: "Universitas Insan Mahardika" },
    address: { "@type": "PostalAddress", addressLocality: "Cirebon", addressCountry: "ID" },
    sameAs: profile.sameAs,
    // Liputan media tentang Mas Ilyun, supaya mesin pencari mengaitkan artikelnya dengan orang ini.
    subjectOf: posts
      .filter((p) => p.kind === "liputan")
      .map((p) => ({
        "@type": "NewsArticle",
        headline: p.title[p.sourceLang ?? "id"],
        url: p.url,
        datePublished: p.date ? isoPartialDate(p.date) : undefined,
        publisher: p.outlet ? { "@type": "Organization", name: p.outlet } : undefined,
      })),
  };

  const stats = [
    { value: contrib.total, label: t.activity.total },
    { value: contrib.activeDays, label: t.activity.activeDays },
    { value: contrib.longestStreak, label: t.activity.longestStreak },
    { value: contrib.busiest.count, label: t.activity.busiestDay },
  ];

  const indicators = [
    { value: scholar.citations, label: t.achievements.citations },
    { value: scholar.hIndex, label: t.achievements.hIndex },
    { value: sinta.scoreOverall, label: t.achievements.sinta },
    { value: countKind(achievements, "hki"), label: t.achievements.copyrights },
    { value: countKind(achievements, "publikasi"), label: t.achievements.publications },
  ];

  const highlightGroups = [
    { key: "sertifikat", label: t.achievements.certificatesTab, items: toCards(homeFeatured(achievements), lang) },
    { key: "hki", label: t.achievements.copyrightsTab, items: toCards(homeCopyrights(achievements), lang) },
  ].filter((g) => g.items.length > 0);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonForScript(personJsonLd) }}
      />
      <a href="#main" className="skip-link">
        {t.nav.skip}
      </a>

      <Header
        lang={lang}
        items={navItems(lang, true)}
        labels={t.nav}
        homeHref={home}
        otherHref={otherHome}
        name={site.name}
      />

      <main id="main">
        {/* Hero */}
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-layout mx-auto max-w-6xl px-5 pb-16 pt-10 sm:px-8 lg:pb-24 lg:pt-14">
            <div className="hero-copy">
              <p className="status rise" style={d(0)}>
                <span className="pulse-dot" aria-hidden="true" />
                {profile.status[lang]}
              </p>

              <h1 id="hero-title" className="name">
                <span className="sr-only">{site.name}</span>
                <Letters text="Ahmad" start={80} className="text-leaf" />
                <Letters text="Ngiliyun" start={260} className="text-sky" />
              </h1>

              <p className="hero-statement rise" style={d(620)}>
                {profile.heroStatement[lang]}
              </p>
              <p className="rise mt-5 max-w-[50ch] text-lg text-muted" style={d(720)}>
                {profile.heroLead[lang]}
              </p>
              <div className="rise mt-8 flex flex-wrap gap-3" style={d(820)}>
                <a href="#projects" className="btn btn-solid">
                  {t.hero.primary}
                </a>
                <a href="#contact" className="btn btn-line">
                  {t.hero.secondary}
                </a>
              </div>
              <dl className="rise hero-meta" style={d(920)}>
                <div>
                  <dt>{t.hero.localTime}</dt>
                  <dd>
                    <LiveClock lang={lang} timeZone={site.timeZone} zoneLabel={site.timeZoneLabel} />
                  </dd>
                </div>
                <div>
                  <dt>GitHub</dt>
                  <dd>
                    <span className="tabular-nums">{gh.publicRepos}</span> {t.activity.publicRepos}
                  </dd>
                </div>
                <div>
                  <dt>{t.activity.title}</dt>
                  <dd>
                    <span className="tabular-nums">{formatNumber(contrib.total, lang)}</span> / {t.hero.year}
                  </dd>
                </div>
              </dl>
            </div>
            <div className="hero-plot rise" style={d(500)}>
              <KMeans labels={t.kmeans} />
            </div>
          </div>
        </section>

        {/* Running text */}
        <div className="marquee-band">
          <Marquee items={profile.skills} label={t.marqueeLabel.skills} seconds={46} />
          <Marquee items={profile.topics[lang]} label={t.marqueeLabel.topics} reverse variant="outline" seconds={58} />
        </div>

        {/* Tentang */}
        <Section id="about" title={t.about.title}>
          <div className="grid gap-12 lg:grid-cols-[1.35fr_1fr] lg:gap-16">
            <Reveal>
              <p className="about-statement">{profile.aboutStatement[lang]}</p>
            </Reveal>
            <Reveal delay={120}>
              <dl className="facts">
                {profile.facts[lang].map((fact) => (
                  <div key={fact.label}>
                    <dt>{fact.label}</dt>
                    <dd>{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          <Reveal className="mt-20">
            <h3 className="sub-title">{t.about.areasTitle}</h3>
          </Reveal>
          <Spotlight className="areas mt-8">
            {areas.map((area, i) => (
              <Reveal key={area.icon} delay={i * 80} className="h-full">
                <article className="area" data-spot>
                  <span className="area-icon">
                    <AreaIcon kind={area.icon} />
                  </span>
                  <h4 className="font-display text-xl font-bold tracking-tight">{area.title[lang]}</h4>
                  <p className="mt-3 text-muted">{area.body[lang]}</p>
                  <ul className="tags mt-5">
                    {area.tools.map((tool) => (
                      <li key={tool}>{tool}</li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            ))}
          </Spotlight>
        </Section>

        {/* Proyek */}
        <Section id="projects" title={t.projects.title} intro={t.projects.intro}>
          <Spotlight className="mt-12 grid gap-6">
            {featured.map((project, i) => (
              <Reveal key={project.name} delay={i * 100}>
                <article className="feature" data-spot data-flip={i % 2 === 1 ? "true" : undefined}>
                  <div className="feature-visual">
                    <ProjectVisual
                      kind={project.visual}
                      label={
                        project.visual === "cluster"
                          ? t.projects.visualCluster
                          : project.visual === "vision"
                            ? t.projects.visualVision
                            : t.projects.visualSentiment
                      }
                      sentimentNames={t.projects.sentimentLabels}
                      visionOther={t.projects.visionOther}
                    />
                  </div>
                  <div className="feature-body">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                      <span className="lang-dot">
                        <span style={{ background: languageColors[project.stack] ?? "var(--color-muted)" }} />
                        {project.stack}
                      </span>
                      {project.copyright ? <span className="badge">{t.projects.copyright}</span> : null}
                      {project.badge ? <span className="badge badge-sky">{project.badge[lang]}</span> : null}
                    </div>
                    <h3 className="mt-4 font-display text-[clamp(2rem,4vw,2.9rem)] font-bold leading-none tracking-tight">
                      {project.name}
                    </h3>
                    <p className="mt-4 max-w-[52ch] text-muted">{project.summary[lang]}</p>
                    <ul className="tags mt-5">
                      {project.tags[lang].map((tag) => (
                        <li key={tag}>{tag}</li>
                      ))}
                    </ul>
                    <div className="mt-7 flex flex-wrap gap-3">
                      {project.demo ? (
                        <ExternalLink href={project.demo} newTab={t.newTab} className="btn btn-solid btn-small">
                          {t.projects.demo}
                        </ExternalLink>
                      ) : null}
                      <ExternalLink href={project.repo} newTab={t.newTab} className="btn btn-line btn-small">
                        {t.projects.code}
                      </ExternalLink>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </Spotlight>

          {shownSystems.length === 0 ? null : (
            <div className="mt-20">
              <Reveal>
                <h3 className="sub-title">{t.projects.systemsTitle}</h3>
                <p className="mt-2 max-w-[60ch] text-sm text-muted">{t.projects.systemsIntro}</p>
              </Reveal>
              <Spotlight className="systems mt-8">
                {shownSystems.map((sys, i) => (
                  <Reveal key={sys.name} delay={i * 80} className="h-full">
                    <article className="system" data-spot>
                      <p className="cred-meta">
                        <span>{sys.period[lang]}</span>
                        {sys.repo ? null : <span className="system-private">{t.projects.privateRepo}</span>}
                      </p>
                      <h4 className="mt-3 font-display text-2xl font-bold tracking-tight">{sys.name}</h4>
                      {sys.full ? <p className="text-sm text-muted">{sys.full}</p> : null}
                      <p className="mt-4 text-muted">{sys.summary[lang]}</p>
                      <p className="mt-4 text-sm">
                        <span className="text-muted">{sys.role[lang]}</span>
                      </p>
                      <ul className="tags mt-4">
                        {sys.stack.map((s) => (
                          <li key={s}>{s}</li>
                        ))}
                      </ul>
                      {sys.repo ? (
                        <p className="mt-5">
                          <ExternalLink href={sys.repo} newTab={t.newTab} className="link text-sm">
                            {t.projects.code}
                          </ExternalLink>
                        </p>
                      ) : null}
                    </article>
                  </Reveal>
                ))}
              </Spotlight>
            </div>
          )}

          {recent.length === 0 ? null : (
            <div className="mt-20">
              <Reveal className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h3 className="sub-title">{t.projects.recentTitle}</h3>
                  <p className="mt-2 text-sm text-muted">{t.projects.recentIntro}</p>
                </div>
                <ExternalLink href={gh.profileUrl} newTab={t.newTab} className="link text-sm">
                  {t.projects.all}
                </ExternalLink>
              </Reveal>
              <ul className="repo-list mt-6">
                {recent.map((repo, i) => (
                  <li key={repo.name}>
                    <Reveal delay={i * 60}>
                      <article className="repo">
                        <div className="min-w-0">
                          <h4 className="font-display text-lg font-bold tracking-tight">
                            <ExternalLink href={repo.url} newTab={t.newTab} className="repo-link">
                              {repo.name}
                            </ExternalLink>
                          </h4>
                          <p className="repo-desc">{repo.description}</p>
                        </div>
                        <div className="repo-meta">
                          {repo.language ? (
                            <span className="lang-dot">
                              <span style={{ background: languageColors[repo.language] ?? "var(--color-muted)" }} />
                              {repo.language}
                            </span>
                          ) : null}
                          <span>
                            {t.projects.updated} {formatMonthYear(repo.pushedAt, lang)}
                          </span>
                          {repo.homepage ? (
                            <ExternalLink href={repo.homepage} newTab={t.newTab} className="link">
                              {repo.homepageIsRelease ? t.projects.release : t.projects.demo}
                            </ExternalLink>
                          ) : null}
                        </div>
                      </article>
                    </Reveal>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Section>

        {/* Kontribusi */}
        <Section id="activity" title={t.activity.title} intro={t.activity.intro}>
          <Reveal className="mt-12">
            <div className="stats">
              {stats.map((s) => (
                <div key={s.label} className="stat">
                  <CountUp value={s.value} lang={lang} className="stat-value" />
                  <span className="stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal className="mt-8" delay={100}>
            <div className="graph-panel">
              <ContributionGraph
                weeks={contrib.weeks}
                months={contrib.months}
                weekdays={t.activity.weekdays}
                summary={t.activity.summary
                  .replace("{n}", String(contrib.total))
                  .replace("{d}", String(contrib.activeDays))}
                less={t.activity.less}
                more={t.activity.more}
                tooltip={{
                  none: t.activity.tooltipNone,
                  one: t.activity.tooltipOne,
                  many: t.activity.tooltipMany,
                }}
                dateLocale={dateLocale}
              />
              <p className="graph-foot">
                <span>
                  {t.activity.since} {gh.sinceYear}
                </span>
                <span>{t.activity.updatedAt.replace("{date}", formatDate(gh.fetchedAt, lang))}</span>
              </p>
            </div>
          </Reveal>

          <Reveal className="mt-16">
            <h3 className="sub-title">{t.activity.otherTitle}</h3>
          </Reveal>
          <ul className="beyond mt-6">
            {contributions.map((c, i) => (
              <li key={c.title.id}>
                <Reveal delay={i * 80} className="h-full">
                  <div className="beyond-item">
                    <h4 className="font-display text-lg font-bold tracking-tight">{c.title[lang]}</h4>
                    <p className="mt-2 text-muted">{c.body[lang]}</p>
                    {c.href ? (
                      <p className="mt-4">
                        {c.href.startsWith("#") ? (
                          <a href={c.href} className="link text-sm">
                            {c.linkLabel ? c.linkLabel[lang] : t.activity.open}
                          </a>
                        ) : (
                          <ExternalLink href={c.href} newTab={t.newTab} className="link text-sm">
                            {c.linkLabel ? c.linkLabel[lang] : t.activity.open}
                          </ExternalLink>
                        )}
                      </p>
                    ) : null}
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </Section>

        {/* Sertifikat dan capaian */}
        <Section id="achievements" title={t.achievements.title} intro={t.achievements.intro}>
          <Reveal className="mt-12">
            <div className="stats stats-5">
              {indicators.map((s) => (
                <div key={s.label} className="stat">
                  <CountUp value={s.value} lang={lang} className="stat-value" />
                  <span className="stat-label">{s.label}</span>
                </div>
              ))}
            </div>
            <p className="indicator-foot">
              <span>{t.achievements.asOf.replace("{date}", formatDate(scholar.source.asOf, lang))}</span>
              <span className="flex flex-wrap gap-x-4 gap-y-1">
                <ExternalLink href={scholar.source.url} newTab={t.newTab} className="link">
                  {scholar.source.name}
                </ExternalLink>
                <ExternalLink href={sinta.source.url} newTab={t.newTab} className="link">
                  {sinta.source.name}
                </ExternalLink>
              </span>
            </p>
          </Reveal>

          <Reveal className="mt-12" delay={80}>
            <AchievementHighlights groups={highlightGroups} filterLabel={t.achievements.filterLabel} labels={cardLabels} />
          </Reveal>

          <Reveal className="mt-10 flex flex-wrap items-center justify-between gap-4">
            <a href={archivePath(lang)} className="btn btn-solid">
              {t.achievements.viewAll.replace("{n}", String(totalPublic))}
            </a>
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
              <span>{t.achievements.allCredentials}</span>
              {profile.credentialProfiles.map((p) => (
                <ExternalLink key={p.label} href={p.href} newTab={t.newTab} className="link">
                  {p.label}
                </ExternalLink>
              ))}
            </p>
          </Reveal>
        </Section>

        {/* Kabar dan liputan */}
        {latestPosts.length === 0 ? null : (
          <Section id="news" title={t.news.title} intro={t.news.intro}>
            <Spotlight className="mt-12">
              <ul className="cred-grid">
                {latestPosts.map((post, i) => (
                  <li key={post.slug}>
                    <Reveal delay={i * 70} className="h-full">
                      <NewsCard post={post} lang={lang} />
                    </Reveal>
                  </li>
                ))}
              </ul>
            </Spotlight>
            <Reveal className="mt-10">
              <a href={postsPath(lang)} className="btn btn-line">
                {t.news.all}
              </a>
            </Reveal>
          </Section>
        )}

        {/* Riset */}
        <Section id="research" title={t.research.title} intro={t.research.intro}>
          <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_1.5fr] lg:gap-16">
            <div className="grid content-start gap-10">
              <Reveal>
                <h3 className="sub-title">{t.research.themesTitle}</h3>
                <ul className="tags mt-5">
                  {profile.researchThemes[lang].map((theme) => (
                    <li key={theme}>{theme}</li>
                  ))}
                </ul>
              </Reveal>

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
                        <a href={detailPath(lang, g.id)} className="cred-link">
                          {g.title[lang]}
                        </a>
                      </h4>
                      {g.summary ? <p className="mt-3 text-sm text-muted">{g.summary[lang]}</p> : null}
                    </div>
                  ))}
                </Reveal>
              )}

              <Reveal delay={120}>
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

            <div>
              <Reveal className="flex flex-wrap items-end justify-between gap-3">
                <h3 className="sub-title">{t.research.publicationsTitle}</h3>
                <p className="text-sm text-muted">
                  {t.research.publicationCount.replace("{n}", String(countKind(achievements, "publikasi")))}
                </p>
              </Reveal>
              <div className="pubs mt-6">
                {pubYears.map((group) => (
                  <Reveal key={group.year} className="pub-year">
                    <h4 className="pub-year-label">{group.year}</h4>
                    <ul className="pub-list">
                      {group.items.map((pub) => (
                        <li key={pub.id} className="pub">
                          <a href={detailPath(lang, pub.id)} className="pub-title">
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
            </div>
          </div>
        </Section>

        {/* Mengajar */}
        <Section id="teaching" title={t.teaching.title} intro={t.teaching.intro}>
          <div className="mt-12 grid gap-14 lg:grid-cols-2 lg:gap-16">
            {teaching.map((inst, i) => {
              const now = inst.courses.filter((c) => c.terms.includes(currentTerm));
              const past = inst.courses.filter((c) => !c.terms.includes(currentTerm));
              return (
                <Reveal key={inst.name} delay={i * 120}>
                  <div>
                    <h3 className="font-display text-2xl font-bold tracking-tight">{inst.name}</h3>
                    <p className="mt-1 text-muted">{inst.role[lang]}</p>
                    <p className="mt-3 max-w-[56ch] text-sm text-muted">{inst.note[lang]}</p>

                    <h4 className="term-title mt-8">
                      {t.teaching.current}
                      <span className="term-label">{termMap.get(currentTerm)?.[lang] ?? currentTerm}</span>
                    </h4>
                    {now.length === 0 ? (
                      <p className="mt-3 text-sm text-muted">{t.teaching.noneCurrent}</p>
                    ) : (
                      <ul className="courses mt-4">
                        {now.map((course) => (
                          <li key={course.name.id} className="course">
                            <span className="min-w-0">
                              <span className="course-name">{course.name[lang]}</span>
                              <span className="course-program">{programNames(course, lang)}</span>
                            </span>
                            {course.repo ? (
                              <ExternalLink href={course.repo} newTab={t.newTab} className="course-link">
                                {t.teaching.materials}
                              </ExternalLink>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    )}

                    {past.length === 0 ? null : (
                      <>
                        <h4 className="term-title mt-10">{t.teaching.past}</h4>
                        <ul className="past-courses mt-4">
                          {past.map((course) => (
                            <li key={course.name.id} className="past-course">
                              <span className="past-name">
                                {course.name[lang]}
                                {course.repo ? (
                                  <>
                                    {" "}
                                    <ExternalLink href={course.repo} newTab={t.newTab} className="course-link">
                                      {t.teaching.materials}
                                    </ExternalLink>
                                  </>
                                ) : null}
                              </span>
                              <span className="past-meta">
                                {programNames(course, lang)}, {termYears(course, lang, currentTerm, termMap)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </Reveal>
              );
            })}
          </div>

          <Reveal className="mt-20">
            <h3 className="sub-title">{t.teaching.focusTitle}</h3>
          </Reveal>
          <ul className="beyond focus-grid mt-6">
            {teachingFocus.map((f, i) => (
              <li key={f.title.id}>
                <Reveal delay={i * 70} className="h-full">
                  <div className="beyond-item">
                    <h4 className="font-display text-lg font-bold tracking-tight">{f.title[lang]}</h4>
                    <p className="mt-2 text-sm text-muted">{f.courses[lang]}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </Section>

        {/* Perjalanan */}
        <Section id="journey" title={t.journey.title} intro={t.journey.intro}>
          <div className="mt-12">
            <Timeline
              items={journey.map((m) => ({
                when: m.when[lang],
                title: m.title[lang],
                body: m.body[lang],
                current: m.current,
              }))}
            />
          </div>
        </Section>

        {/* Arah ke depan */}
        {plans.length + principles.length + learning.length === 0 ? null : (
          <Section id="next" title={t.next.title} intro={t.next.intro}>
            {plans.length === 0 ? null : (
              <div className="mt-12">
                <Reveal>
                  <h3 className="sub-title">{t.next.roadmapTitle}</h3>
                </Reveal>
                <ol className="roadmap mt-6">
                  {plans.map((plan, i) => (
                    <li key={plan.period} className="roadmap-step" data-current={plan.current ? "true" : undefined}>
                      <Reveal delay={i * 70}>
                        <p className="roadmap-period">
                          <span>{plan.period}</span>
                          {plan.current ? <span className="roadmap-now">{t.next.current}</span> : null}
                        </p>
                        <h4 className="roadmap-title">{plan.title[lang]}</h4>
                        <ul className="roadmap-points">
                          {plan.points[lang].map((point) => (
                            <li key={point}>{point}</li>
                          ))}
                        </ul>
                      </Reveal>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <div className="mt-16 grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
              {principles.length === 0 ? null : (
                <div>
                  <Reveal>
                    <h3 className="sub-title">{t.next.principlesTitle}</h3>
                  </Reveal>
                  <Spotlight className="principles mt-6">
                    {principles.map((pr, i) => (
                      <Reveal key={pr.title.id} delay={i * 70}>
                        <div className="collab" data-spot>
                          <h4 className="font-display text-lg font-bold tracking-tight">{pr.title[lang]}</h4>
                          <p className="mt-2 text-sm text-muted">{pr.body[lang]}</p>
                        </div>
                      </Reveal>
                    ))}
                  </Spotlight>
                </div>
              )}
              {learning.length === 0 ? null : (
                <Reveal delay={120}>
                  <h3 className="sub-title">{t.next.learningTitle}</h3>
                  <ul className="tags mt-6">
                    {learning.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </Reveal>
              )}
            </div>
          </Section>
        )}

        {/* Kolaborasi dan kontak */}
        <div className="giant-band">
          <Marquee
            items={[t.contact.marquee, t.contact.marquee, t.contact.marquee]}
            variant="giant"
            seconds={34}
            decorative
          />
        </div>

        <Section id="contact" title={t.contact.title} intro={t.contact.intro}>
          <Spotlight className="collabs mt-12">
            {collabs.map((c, i) => (
              <Reveal key={c.title.id} delay={i * 70} className="h-full">
                <div className="collab" data-spot>
                  <h3 className="font-display text-lg font-bold tracking-tight">{c.title[lang]}</h3>
                  <p className="mt-2 text-sm text-muted">{c.body[lang]}</p>
                </div>
              </Reveal>
            ))}
          </Spotlight>

          <div className="mt-14 grid gap-12 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
            {profile.email.user === "" ? null : (
              <Reveal>
                <ContactPanel
                  lang={lang}
                  user={profile.email.user}
                  domain={profile.email.domain}
                  topics={collabs.map((c) => c.title[lang])}
                  labels={t.contact}
                  timeZone={site.timeZone}
                  zoneLabel={site.timeZoneLabel}
                />
              </Reveal>
            )}
            <Reveal delay={120}>
              <div>
                <h3 className="sub-title">{t.contact.channelsTitle}</h3>
                <ul className="channels mt-6">
                  {channels.map((ch) => (
                    <li key={ch.label}>
                      <ExternalLink href={ch.href} newTab={t.newTab} className="channel">
                        <span className="channel-label">{ch.label}</span>
                        <span className="channel-note">{ch.note[lang]}</span>
                        <span className="channel-handle">{ch.handle}</span>
                      </ExternalLink>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </Section>
      </main>

      <SiteFooter lang={lang} />
      <Analytics />
    </>
  );
}
