import Analytics from "@/components/Analytics";
import PageHead from "@/components/PageHead";
import Reveal from "@/components/Reveal";
import Section from "@/components/Section";
import Spotlight from "@/components/Spotlight";
import SubpageShell from "@/components/SubpageShell";
import Timeline from "@/components/Timeline";
import { copy, type Lang } from "@/data/profile";
import { pagePath } from "@/lib/nav";
import { loadSite } from "@/server/content";

// Halaman Perjalanan (/perjalanan/, /en/journey/): garis waktu sejak 2017, lalu Arah ke depan
// (rencana lima tahun, cara bekerja dengan AI, dan yang sedang didalami) sebagai bagian sendiri.
export default async function JourneyPage({ lang }: { lang: Lang }) {
  const t = copy[lang];
  const other: Lang = lang === "id" ? "en" : "id";
  const content = await loadSite();
  const journey = content.milestone.map((e) => e.data);
  const plans = content.plan.map((e) => e.data);
  const principles = content.principle.map((e) => e.data);
  const learning = content.profile.learning ? content.profile.learning[lang] : [];

  return (
    <SubpageShell lang={lang} current="journey" backHome otherHref={pagePath(other, "journey")}>
      <Analytics />
      <div className="page-head mx-auto max-w-6xl px-5 sm:px-8">
        <PageHead
          lang={lang}
          id="page-title"
          title={t.pages.journey.title}
          intro={t.pages.journey.intro}
          path={pagePath(lang, "journey")}
        />
      </div>

      <Section id="timeline" title={t.journey.timelineTitle} intro={t.journey.intro}>
        <Timeline
          items={journey.map((m) => ({
            when: m.when[lang],
            title: m.title[lang],
            body: m.body[lang],
            current: m.current,
          }))}
        />
      </Section>

      {plans.length + principles.length + learning.length === 0 ? null : (
        <Section id="next" title={t.next.title} intro={t.next.intro}>
          {plans.length === 0 ? null : (
            <div>
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
    </SubpageShell>
  );
}
