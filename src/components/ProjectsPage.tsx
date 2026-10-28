import Analytics from "@/components/Analytics";
import ContributionGraph from "@/components/ContributionGraph";
import CountUp from "@/components/CountUp";
import ExternalLink from "@/components/ExternalLink";
import PageHead from "@/components/PageHead";
import ProjectFeature from "@/components/ProjectFeature";
import Reveal from "@/components/Reveal";
import Section from "@/components/Section";
import Spotlight from "@/components/Spotlight";
import SubpageShell from "@/components/SubpageShell";
import { copy, type Lang } from "@/data/profile";
import {
  formatDate,
  formatMonthYear,
  getContributionModel,
  getGithubMeta,
  getRecentRepos,
  languageColors,
} from "@/lib/github";
import { pagePath, sectionHref } from "@/lib/nav";
import { loadSite } from "@/server/content";

// Halaman Proyek (/proyek/, /en/projects/): proyek unggulan lengkap, sistem yang dikembangkan,
// repositori terbaru, kontribusi GitHub dan di luar kode, serta teknologi dan topik.
export default async function ProjectsPage({ lang }: { lang: Lang }) {
  const t = copy[lang];
  const other: Lang = lang === "id" ? "en" : "id";
  const content = await loadSite();
  const profile = content.profile;
  const featured = content.project.map((e) => e.data);
  const systems = content.system.map((e) => e.data);
  const areas = content.area.map((e) => e.data);
  const contributions = content.contribution.map((e) => e.data);
  const recent = getRecentRepos(featured.map((p) => p.repo));
  const contrib = getContributionModel(lang);
  const gh = getGithubMeta();
  const dateLocale = lang === "id" ? "id-ID" : "en-GB";

  const stats = [
    { value: contrib.total, label: t.activity.total },
    { value: contrib.activeDays, label: t.activity.activeDays },
    { value: contrib.longestStreak, label: t.activity.longestStreak },
    { value: contrib.busiest.count, label: t.activity.busiestDay },
  ];

  return (
    <SubpageShell lang={lang} current="projects" backHome otherHref={pagePath(other, "projects")}>
      <Analytics />
      <div className="page-head mx-auto max-w-6xl px-5 sm:px-8">
        <PageHead
          lang={lang}
          id="page-title"
          title={t.pages.projects.title}
          intro={t.pages.projects.intro}
          path={pagePath(lang, "projects")}
        />
      </div>

      <Section id="featured" title={t.projects.featuredTitle} intro={t.projects.intro}>
        <Spotlight className="grid gap-6">
          {featured.map((project, i) => (
            <Reveal key={project.name} delay={i * 100}>
              <ProjectFeature project={project} lang={lang} variant="full" flip={i % 2 === 1} />
            </Reveal>
          ))}
        </Spotlight>
      </Section>

      {systems.length === 0 ? null : (
        <Section id="systems" title={t.projects.systemsTitle} intro={t.projects.systemsIntro}>
          <Spotlight className="systems">
            {systems.map((sys, i) => (
              <Reveal key={sys.name} delay={i * 80} className="h-full">
                <article className="system" data-spot>
                  <p className="cred-meta">
                    <span>{sys.period[lang]}</span>
                    {sys.repo ? null : <span className="system-private">{t.projects.privateRepo}</span>}
                  </p>
                  <h3 className="mt-3 font-display text-2xl font-bold tracking-tight">{sys.name}</h3>
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
        </Section>
      )}

      {recent.length === 0 ? null : (
        <Section
          id="recent"
          title={t.projects.recentTitle}
          intro={t.projects.recentIntro}
          action={
            <ExternalLink href={gh.profileUrl} newTab={t.newTab} className="btn btn-line btn-small">
              {t.projects.all}
            </ExternalLink>
          }
        >
          <ul className="repo-list">
            {recent.map((repo, i) => (
              <li key={repo.name}>
                <Reveal delay={i * 60}>
                  <article className="repo">
                    <div className="min-w-0">
                      <h3 className="font-display text-lg font-bold tracking-tight">
                        <ExternalLink href={repo.url} newTab={t.newTab} className="repo-link">
                          {repo.name}
                        </ExternalLink>
                      </h3>
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
        </Section>
      )}

      <Section id="activity" title={t.activity.title} intro={t.activity.intro}>
        <Reveal>
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

        {contributions.length === 0 ? null : (
          <>
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
                            <a href={sectionHref(lang, c.href, false)} className="link text-sm">
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
          </>
        )}
      </Section>

      <Section id="stack" title={t.projects.stackTitle} intro={t.projects.stackIntro}>
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          <Reveal>
            <h3 className="sub-title">{t.projects.byArea}</h3>
            <dl className="stack-areas mt-6">
              {areas.map((area) => (
                <div key={area.icon}>
                  <dt>
                    {area.title[lang]}
                    <span className="stack-area-body">{area.body[lang]}</span>
                  </dt>
                  <dd>
                    <ul className="tags">
                      {area.tools.map((tool) => (
                        <li key={tool}>{tool}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
          <div className="grid content-start gap-10">
            <Reveal delay={80}>
              <h3 className="sub-title">{t.marqueeLabel.skills}</h3>
              <ul className="tags mt-5">
                {profile.skills.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={120}>
              <h3 className="sub-title">{t.marqueeLabel.topics}</h3>
              <ul className="tags mt-5">
                {profile.topics[lang].map((topic) => (
                  <li key={topic}>{topic}</li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </Section>
    </SubpageShell>
  );
}
