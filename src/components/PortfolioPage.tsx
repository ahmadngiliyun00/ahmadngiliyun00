import type { CSSProperties, ReactNode } from "react";
import ExternalLink from "@/components/ExternalLink";
import KMeans from "@/components/KMeans";
import Marquee from "@/components/Marquee";
import Reveal from "@/components/Reveal";
import {
  contacts,
  copy,
  courses,
  links,
  projects,
  site,
  skills,
  type Lang,
} from "@/data/profile";

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-16 border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[14rem_1fr] lg:gap-16 lg:py-24">
        <Reveal>
          <h2
            id={`${id}-title`}
            className="font-display text-3xl font-bold tracking-tight lg:text-[2.1rem]"
          >
            {title}
          </h2>
        </Reveal>
        <div>{children}</div>
      </div>
    </section>
  );
}

function delay(ms: number): CSSProperties {
  return { "--d": `${ms}ms` } as CSSProperties;
}

export default function PortfolioPage({ lang }: { lang: Lang }) {
  const t = copy[lang];
  const other: Lang = lang === "id" ? "en" : "id";
  const home = lang === "id" ? "/" : "/en/";
  const otherHome = lang === "id" ? "/en/" : "/";

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    honorificSuffix: "M.Kom.",
    url: site.url,
    jobTitle: t.meta.jobTitle,
    affiliation: {
      "@type": "CollegeOrUniversity",
      name: "Universitas Insan Mahardika",
    },
    sameAs: [
      links.github,
      links.linkedin,
      links.orcid,
      links.youtube,
      links.x,
      links.instagram,
      links.facebook,
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-leaf focus:px-4 focus:py-2 focus:font-semibold focus:text-[#06210e]"
      >
        {t.nav.skip}
      </a>

      <header className="sticky top-0 z-40 border-b border-line/70 bg-ink/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-4 sm:px-8">
          <a
            href={home}
            className="font-display text-lg font-bold tracking-tight"
            aria-label={site.name}
          >
            <span className="text-leaf">Ahmad</span>{" "}
            <span className="text-sky">Ngiliyun</span>
          </a>
          <div className="flex items-center gap-6">
            <nav aria-label={t.nav.label}>
              <ul className="flex items-center gap-5 text-sm text-muted">
                <li><a className="link-nav" href="#about">{t.nav.about}</a></li>
                <li><a className="link-nav" href="#teaching">{t.nav.teaching}</a></li>
                <li><a className="link-nav" href="#projects">{t.nav.projects}</a></li>
                <li><a className="link-nav" href="#contact">{t.nav.contact}</a></li>
              </ul>
            </nav>
            <div
              className="flex items-center gap-2 text-sm"
              role="group"
              aria-label={t.nav.switchLabel}
            >
              <span aria-current="true" className="font-semibold text-fg">
                {lang === "id" ? "ID" : "EN"}
              </span>
              <span aria-hidden="true" className="text-line">/</span>
              <a
                href={otherHome}
                hrefLang={other}
                lang={other}
                className="link-nav text-muted"
              >
                {other === "id" ? "ID" : "EN"}
              </a>
            </div>
          </div>
        </div>
      </header>

      <main id="main">
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-10 sm:px-8 lg:grid-cols-[1.08fr_1fr] lg:gap-16 lg:pb-28 lg:pt-16">
          <div>
            <h1
              className="rise font-display text-[clamp(2.6rem,6.2vw,5.2rem)] font-bold leading-[1.02] tracking-[-0.035em] text-balance"
              style={delay(60)}
            >
              {t.hero.title}
            </h1>
            <p
              className="rise mt-6 max-w-[52ch] text-lg text-muted"
              style={delay(240)}
            >
              {t.hero.lead}
            </p>
            <div className="rise mt-8 flex flex-wrap gap-3" style={delay(380)}>
              <a href="#projects" className="btn btn-solid">
                {t.hero.primary}
              </a>
              <ExternalLink
                href={links.github}
                newTab={t.newTab}
                className="btn btn-line"
              >
                {t.hero.secondary}
              </ExternalLink>
            </div>
          </div>
          <div className="rise" style={delay(320)}>
            <KMeans labels={t.kmeans} />
          </div>
        </section>

        <div className="border-t border-line py-5">
          <Marquee items={skills} label={t.skillsLabel} />
        </div>

        <Section id="about" title={t.about.title}>
          <Reveal>
            <p className="max-w-[62ch] text-lg leading-relaxed">{t.about.body}</p>
          </Reveal>
          <Reveal delay={120}>
            <dl className="mt-10">
              {t.about.facts.map((fact) => (
                <div
                  key={fact.label}
                  className="grid gap-1 border-t border-line py-4 sm:grid-cols-[11rem_1fr] sm:gap-6"
                >
                  <dt className="text-muted">{fact.label}</dt>
                  <dd className="m-0">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </Section>

        <Section id="teaching" title={t.teaching.title}>
          <Reveal>
            <p className="max-w-[62ch] text-lg text-muted">{t.teaching.intro}</p>
          </Reveal>
          <Reveal delay={120}>
            <ul className="mt-8 grid gap-x-10 sm:grid-cols-2">
              {courses[lang].map((course) => (
                <li
                  key={course}
                  className="border-t border-line py-4 font-display text-xl font-semibold tracking-tight"
                >
                  {course}
                </li>
              ))}
            </ul>
          </Reveal>
        </Section>

        <Section id="projects" title={t.projects.title}>
          <Reveal>
            <p className="max-w-[62ch] text-lg text-muted">{t.projects.intro}</p>
          </Reveal>
          <ul className="mt-8">
            {projects.map((project, index) => (
              <li key={project.name}>
                <Reveal delay={index * 90}>
                  <article className="project grid gap-3 border-t border-line py-8">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                      <h3 className="font-display text-2xl font-bold tracking-tight">
                        <ExternalLink
                          href={project.href}
                          newTab={t.newTab}
                          className="project-link"
                        >
                          {project.name}
                        </ExternalLink>
                      </h3>
                      <span className="text-sm text-leaf">{project.stack}</span>
                    </div>
                    <p className="max-w-[62ch] text-muted">
                      {project.description[lang]}
                    </p>
                    <p className="text-sm text-muted/80">{project.display}</p>
                  </article>
                </Reveal>
              </li>
            ))}
            <li>
              <Reveal delay={projects.length * 90}>
                <div className="grid gap-3 border-t border-line py-8">
                  <p className="max-w-[62ch] text-muted">{t.projects.more}</p>
                  <p>
                    <ExternalLink
                      href={links.github}
                      newTab={t.newTab}
                      className="link"
                    >
                      {t.projects.moreLink}
                    </ExternalLink>
                  </p>
                </div>
              </Reveal>
            </li>
          </ul>
        </Section>

        <Section id="contact" title={t.contact.title}>
          <Reveal>
            <p className="max-w-[62ch] text-lg text-muted">{t.contact.intro}</p>
          </Reveal>
          <Reveal delay={120}>
            <ul className="mt-8">
              {site.email === "" ? null : (
                <li className="grid gap-1 border-t border-line py-4 sm:grid-cols-[11rem_1fr] sm:gap-6">
                  <span className="text-muted">{t.contact.emailLabel}</span>
                  <a className="link w-fit" href={`mailto:${site.email}`}>
                    {site.email}
                  </a>
                </li>
              )}
              {contacts.map((item) => (
                <li
                  key={item.label}
                  className="grid gap-1 border-t border-line py-4 sm:grid-cols-[11rem_1fr] sm:gap-6"
                >
                  <span className="text-muted">{item.label}</span>
                  <ExternalLink
                    href={item.href}
                    newTab={t.newTab}
                    className="link w-fit"
                  >
                    {item.handle}
                  </ExternalLink>
                </li>
              ))}
            </ul>
          </Reveal>
        </Section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-8 text-sm text-muted sm:px-8">
          <p>
            © {new Date().getFullYear()} {site.fullName}
          </p>
          <p>{t.footer.built}</p>
        </div>
      </footer>
    </>
  );
}
