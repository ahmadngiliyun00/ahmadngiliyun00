import type { CSSProperties, ReactNode } from "react";
import AreaIcon from "@/components/AreaIcon";
import ContactPanel from "@/components/ContactPanel";
import ContributionGraph from "@/components/ContributionGraph";
import CountUp from "@/components/CountUp";
import ExternalLink from "@/components/ExternalLink";
import Header from "@/components/Header";
import KMeans from "@/components/KMeans";
import LiveClock from "@/components/LiveClock";
import Marquee from "@/components/Marquee";
import Monogram from "@/components/Monogram";
import ProjectVisual from "@/components/ProjectVisual";
import Reveal from "@/components/Reveal";
import Spotlight from "@/components/Spotlight";
import Timeline from "@/components/Timeline";
import {
  areas,
  channels,
  collabs,
  contributions,
  copy,
  featured,
  journey,
  links,
  site,
  skills,
  status,
  teaching,
  topics,
  type Lang,
} from "@/data/profile";
import {
  formatDate,
  formatMonthYear,
  formatNumber,
  getContributionModel,
  getGithubMeta,
  getRecentRepos,
  languageColors,
} from "@/lib/github";

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

export default function PortfolioPage({ lang }: { lang: Lang }) {
  const t = copy[lang];
  const home = lang === "id" ? "/" : "/en/";
  const otherHome = lang === "id" ? "/en/" : "/";
  const contrib = getContributionModel(lang);
  const gh = getGithubMeta();
  const recent = getRecentRepos();
  const dateLocale = lang === "id" ? "id-ID" : "en-GB";

  const navItems = [
    { id: "about", label: t.nav.about },
    { id: "projects", label: t.nav.projects },
    { id: "activity", label: t.nav.activity },
    { id: "teaching", label: t.nav.teaching },
    { id: "journey", label: t.nav.journey },
    { id: "contact", label: t.nav.contact },
  ];

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    honorificSuffix: "M.Kom.",
    url: site.url,
    jobTitle: t.meta.jobTitle,
    worksFor: { "@type": "CollegeOrUniversity", name: "Universitas Insan Mahardika" },
    address: { "@type": "PostalAddress", addressLocality: "Cirebon", addressCountry: "ID" },
    sameAs: Object.values(links),
  };

  const stats = [
    { value: contrib.total, label: t.activity.total },
    { value: contrib.activeDays, label: t.activity.activeDays },
    { value: contrib.longestStreak, label: t.activity.longestStreak },
    { value: contrib.busiest.count, label: t.activity.busiestDay },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <a href="#main" className="skip-link">
        {t.nav.skip}
      </a>

      <Header
        lang={lang}
        items={navItems}
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
                {status[lang]}
              </p>

              <h1 id="hero-title" className="name">
                <span className="sr-only">{site.name}</span>
                <Letters text="Ahmad" start={80} className="text-leaf" />
                <Letters text="Ngiliyun" start={260} className="text-sky" />
              </h1>

              <p className="hero-statement rise" style={d(620)}>
                {t.hero.statement}
              </p>
              <p className="rise mt-5 max-w-[50ch] text-lg text-muted" style={d(720)}>
                {t.hero.lead}
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
          <Marquee items={skills} label={t.marqueeLabel.skills} seconds={46} />
          <Marquee items={topics[lang]} label={t.marqueeLabel.topics} reverse variant="outline" seconds={58} />
        </div>

        {/* Tentang */}
        <Section id="about" title={t.about.title}>
          <div className="grid gap-12 lg:grid-cols-[1.35fr_1fr] lg:gap-16">
            <Reveal>
              <p className="about-statement">{t.about.statement}</p>
            </Reveal>
            <Reveal delay={120}>
              <dl className="facts">
                {t.about.facts.map((fact) => (
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
                      label={project.visual === "cluster" ? t.projects.visualCluster : t.projects.visualSentiment}
                      sentimentNames={t.projects.sentimentLabels}
                    />
                  </div>
                  <div className="feature-body">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                      <span className="lang-dot">
                        <span style={{ background: languageColors[project.stack] ?? "var(--color-muted)" }} />
                        {project.stack}
                      </span>
                      {project.copyright ? <span className="badge">{t.projects.copyright}</span> : null}
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
                        <ExternalLink href={c.href} newTab={t.newTab} className="link text-sm">
                          {t.activity.open} ORCID
                        </ExternalLink>
                      </p>
                    ) : null}
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </Section>

        {/* Mengajar */}
        <Section id="teaching" title={t.teaching.title} intro={t.teaching.intro}>
          <div className="mt-12 grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
            {teaching.map((inst, i) => (
              <Reveal key={inst.name} delay={i * 120}>
                <div>
                  <h3 className="font-display text-2xl font-bold tracking-tight">{inst.name}</h3>
                  <p className="mt-1 text-muted">{inst.role[lang]}</p>
                  <ul className="courses mt-6">
                    {inst.courses.map((course) => (
                      <li key={course.name.id} className="course">
                        <span className="course-name">{course.name[lang]}</span>
                        {course.repo ? (
                          <ExternalLink href={course.repo} newTab={t.newTab} className="course-link">
                            {t.teaching.materials}
                          </ExternalLink>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
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
            {site.email.user === "" ? null : (
              <Reveal>
                <ContactPanel
                  lang={lang}
                  user={site.email.user}
                  domain={site.email.domain}
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

      <footer className="footer">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <div className="flex items-center gap-4">
              <Monogram className="h-14 w-14" />
              <div>
                <p className="font-display text-xl font-bold tracking-tight">{site.fullName}</p>
                <p className="text-sm text-muted">{t.footer.built}</p>
              </div>
            </div>
            <a href="#main" className="btn btn-line btn-small">
              {t.footer.top}
            </a>
          </div>
          <p className="mt-10 border-t border-line pt-6 text-sm text-muted">
            © {new Date().getFullYear()} {site.name}. ngiliyun.my.id
          </p>
        </div>
      </footer>
    </>
  );
}
