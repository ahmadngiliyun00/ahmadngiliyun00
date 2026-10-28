import type { CSSProperties } from "react";
import AchievementHighlights from "@/components/AchievementHighlights";
import Analytics from "@/components/Analytics";
import AreaIcon from "@/components/AreaIcon";
import ContactPanel from "@/components/ContactPanel";
import CountUp from "@/components/CountUp";
import ExternalLink from "@/components/ExternalLink";
import Header from "@/components/Header";
import KMeans from "@/components/KMeans";
import LegacyAnchors from "@/components/LegacyAnchors";
import LiveClock from "@/components/LiveClock";
import Marquee from "@/components/Marquee";
import NewsCard from "@/components/NewsCard";
import ProjectFeature from "@/components/ProjectFeature";
import Reveal from "@/components/Reveal";
import Section from "@/components/Section";
import SiteFooter from "@/components/SiteFooter";
import Spotlight from "@/components/Spotlight";
import type { Lang } from "@/content/types";
import { copy, site } from "@/data/profile";
import { archivePath, countKind, homeCopyrights, homeFeatured, publicItems, toCards } from "@/lib/achievements";
import { formatDate, formatNumber, getContributionModel, getGithubMeta } from "@/lib/github";
import { firstYear, mainTools } from "@/lib/home";
import { jsonForScript } from "@/lib/json-script";
import { navItems, pagePath } from "@/lib/nav";
import { isoPartialDate, postsPath, publicPosts } from "@/lib/posts";
import { loadSite } from "@/server/content";

// Batas item per bagian beranda. Isi lengkapnya ada di halaman dalam.
const HOME_PROJECTS = 3;
const HOME_HIGHLIGHTS = 3;
const HOME_POSTS = 2;

function d(ms: number): CSSProperties {
  return { "--d": `${ms}ms` } as CSSProperties;
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

// Beranda ringkas, tujuh bagian: hero, tentang, jelajahi, proyek unggulan, sorotan capaian,
// kabar terbaru, dan kontak. Isi lengkap ada di /proyek/, /riset/, /mengajar/, dan /perjalanan/.
export default async function PortfolioPage({ lang }: { lang: Lang }) {
  const t = copy[lang];
  const content = await loadSite();
  const profile = content.profile;
  const { scholar, sinta } = content.metrics;
  const areas = content.area.map((e) => e.data);
  const channels = content.channel.map((e) => e.data);
  const collabs = content.collab.map((e) => e.data);
  const featured = content.project.map((e) => e.data).slice(0, HOME_PROJECTS);
  const achievements = publicItems(content.achievement);
  const home = lang === "id" ? "/" : "/en/";
  const otherHome = lang === "id" ? "/en/" : "/";
  const contrib = getContributionModel(lang);
  const gh = getGithubMeta();
  const cardLabels = { verify: t.achievements.verify, details: t.achievements.details, newTab: t.newTab };
  const totalPublic = achievements.length;
  const posts = publicPosts(content.post);
  const latestPosts = posts.slice(0, HOME_POSTS);
  const tools = mainTools(profile.homeTools, areas.map((a) => a.tools));
  const since = firstYear(content.milestone.map((e) => e.data.when.id));

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

  const indicators = [
    { value: scholar.citations, label: t.achievements.citations },
    { value: scholar.hIndex, label: t.achievements.hIndex },
    { value: sinta.scoreOverall, label: t.achievements.sinta },
    { value: countKind(achievements, "hki"), label: t.achievements.copyrights },
    { value: countKind(achievements, "publikasi"), label: t.achievements.publications },
  ];

  const highlightGroups = [
    {
      key: "sertifikat",
      label: t.achievements.certificatesTab,
      items: toCards(homeFeatured(achievements).slice(0, HOME_HIGHLIGHTS), lang),
    },
    {
      key: "hki",
      label: t.achievements.copyrightsTab,
      items: toCards(homeCopyrights(achievements).slice(0, HOME_HIGHLIGHTS), lang),
    },
  ].filter((g) => g.items.length > 0);

  const explore = [
    {
      key: "research" as const,
      title: t.pages.research.title,
      body: t.explore.research.body,
      stat: t.explore.research.stat.replace("{n}", formatNumber(countKind(achievements, "publikasi"), lang)),
    },
    {
      key: "teaching" as const,
      title: t.pages.teaching.title,
      body: t.explore.teaching.body,
      stat: t.explore.teaching.stat.replace("{n}", formatNumber(content.institution.length, lang)),
    },
    {
      key: "journey" as const,
      title: t.pages.journey.title,
      body: t.explore.journey.body,
      stat: since === null ? "" : t.explore.journey.stat.replace("{year}", String(since)),
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonForScript(personJsonLd) }}
      />
      <a href="#main" className="skip-link">
        {t.nav.skip}
      </a>
      <LegacyAnchors lang={lang} />

      <Header
        lang={lang}
        items={navItems(lang, "home")}
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

        {/* Tentang singkat, termasuk empat bidang kerja */}
        <Section id="about" title={t.about.title} intro={t.about.intro} className="section-home">
          <div className="grid gap-10 lg:grid-cols-[1.35fr_1fr] lg:gap-16">
            <div>
              <Reveal>
                <p className="about-statement">{profile.aboutStatement[lang]}</p>
              </Reveal>
              <Reveal delay={80} className="mt-10">
                <h3 className="sub-title">{t.about.areasTitle}</h3>
                <ul className="work-list mt-5">
                  {areas.map((area) => (
                    <li key={area.icon}>
                      <span className="work-icon">
                        <AreaIcon kind={area.icon} />
                      </span>
                      <span>
                        <span className="work-title">{area.title[lang]}</span>
                        <span className="work-body">{area.body[lang]}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
            <Reveal delay={120}>
              <dl className="facts">
                {profile.facts[lang].map((fact) => (
                  <div key={fact.label}>
                    <dt>{fact.label}</dt>
                    <dd>{fact.value}</dd>
                  </div>
                ))}
              </dl>
              {tools.length === 0 ? null : (
                <div className="mt-8">
                  <h3 className="text-sm text-muted">{t.about.toolsTitle}</h3>
                  <ul className="tags mt-3">
                    {tools.map((tool) => (
                      <li key={tool}>{tool}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Reveal>
          </div>
        </Section>

        {/* Jelajahi halaman dalam */}
        <Section id="explore" title={t.explore.title} intro={t.explore.intro} className="section-home">
          <Spotlight className="explore">
            {explore.map((card, i) => (
              <Reveal key={card.key} delay={i * 80} className="h-full">
                <a href={pagePath(lang, card.key)} className="explore-card" data-spot>
                  {card.stat === "" ? null : <span className="explore-stat">{card.stat}</span>}
                  <h3 className="explore-title">{card.title}</h3>
                  <p className="explore-body">{card.body}</p>
                  <span className="explore-arrow" aria-hidden="true">
                    →
                  </span>
                </a>
              </Reveal>
            ))}
          </Spotlight>
        </Section>

        {/* Proyek unggulan */}
        <Section
          id="projects"
          title={t.projects.featuredTitle}
          intro={t.projects.intro}
          className="section-home"
          action={
            <a href={pagePath(lang, "projects")} className="btn btn-line btn-small">
              {t.projects.allProjects}
            </a>
          }
        >
          <Spotlight className="project-cards snap-row">
            {featured.map((project, i) => (
              <Reveal key={project.name} delay={i * 80} className="h-full">
                <ProjectFeature project={project} lang={lang} variant="compact" />
              </Reveal>
            ))}
          </Spotlight>
        </Section>

        {/* Sorotan capaian */}
        <Section
          id="achievements"
          title={t.achievements.homeTitle}
          intro={t.achievements.intro}
          className="section-home"
          action={
            <a href={archivePath(lang)} className="btn btn-line btn-small">
              {t.achievements.viewAll.replace("{n}", String(totalPublic))}
            </a>
          }
        >
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

          <Reveal className="mt-10" delay={80}>
            <AchievementHighlights groups={highlightGroups} filterLabel={t.achievements.filterLabel} labels={cardLabels} />
          </Reveal>
        </Section>

        {/* Kabar terbaru */}
        {latestPosts.length === 0 ? null : (
          <Section
            id="news"
            title={t.news.homeTitle}
            intro={t.news.intro}
            className="section-home"
            action={
              <a href={postsPath(lang)} className="btn btn-line btn-small">
                {t.news.all}
              </a>
            }
          >
            <Spotlight>
              <ul className="cred-grid news-home snap-row">
                {latestPosts.map((post, i) => (
                  <li key={post.slug}>
                    <Reveal delay={i * 70} className="h-full">
                      <NewsCard post={post} lang={lang} />
                    </Reveal>
                  </li>
                ))}
              </ul>
            </Spotlight>
          </Section>
        )}

        {/* Kontak */}
        <div className="giant-band">
          <Marquee
            items={[t.contact.marquee, t.contact.marquee, t.contact.marquee]}
            variant="giant"
            seconds={34}
            decorative
          />
        </div>

        <Section id="contact" title={t.contact.title} intro={t.contact.intro} className="section-home">
          <Spotlight className="collabs">
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
