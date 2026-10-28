import AchievementArchive from "@/components/AchievementArchive";
import Analytics from "@/components/Analytics";
import ExternalLink from "@/components/ExternalLink";
import Reveal from "@/components/Reveal";
import SubpageShell from "@/components/SubpageShell";
import { copy, type Lang } from "@/data/profile";
import { archivePath, itemYears, kindFilters, publicItems, toCards } from "@/lib/achievements";
import { formatDate, formatNumber } from "@/lib/github";
import { homePath } from "@/lib/nav";
import { loadSite } from "@/server/content";

export default async function ArchivePage({ lang }: { lang: Lang }) {
  const t = copy[lang];
  const other: Lang = lang === "id" ? "en" : "id";
  const content = await loadSite();
  const { msLearn } = content.metrics;
  const { credentialProfiles, researchProfiles } = content.profile;
  const all = publicItems(content.achievement);
  const items = toCards(all, lang);
  const hours = Math.floor(msLearn.learningMinutes / 60);
  const minutes = msLearn.learningMinutes % 60;
  const msLine = t.archive.msLearnLine
    .replace("{badges}", formatNumber(msLearn.badges, lang))
    .replace("{trophies}", formatNumber(msLearn.trophies, lang))
    .replace("{modules}", formatNumber(msLearn.modules, lang))
    .replace("{paths}", formatNumber(msLearn.paths, lang))
    .replace("{hours}", formatNumber(hours, lang))
    .replace("{minutes}", formatNumber(minutes, lang))
    .replace("{date}", formatDate(msLearn.source.asOf, lang));

  return (
    <SubpageShell lang={lang} otherHref={archivePath(other)}>
      <Analytics />
      <section aria-labelledby="archive-title" className="section subpage-section">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <nav aria-label={t.archive.crumbs} className="crumbs">
            <ol>
              <li>
                <a href={homePath(lang)} className="link">
                  {t.archive.home}
                </a>
              </li>
              <li aria-current="page">{t.archive.title}</li>
            </ol>
          </nav>
          <Reveal className="section-head max-w-3xl">
            <h1 id="archive-title" className="section-title">
              {t.archive.title}
            </h1>
            <p className="section-intro">{t.archive.intro}</p>
          </Reveal>

          <AchievementArchive
            items={items}
            kinds={kindFilters(all, lang)}
            years={itemYears(all)}
            labels={t.archive}
            cardLabels={{ verify: t.achievements.verify, details: t.achievements.details, newTab: t.newTab }}
          />

          <div className="archive-aside mt-20">
            <div>
              <h2 className="sub-title">{t.archive.profilesTitle}</h2>
              <ul className="profile-links mt-5">
                {credentialProfiles.map((p) => (
                  <li key={p.label}>
                    <ExternalLink href={p.href} newTab={t.newTab} className="btn btn-line btn-small">
                      {p.label}
                    </ExternalLink>
                  </li>
                ))}
              </ul>
              <h3 className="mt-8 font-display text-lg font-bold tracking-tight">{t.archive.msLearnTitle}</h3>
              <p className="mt-2 max-w-[60ch] text-muted">{msLine}</p>
            </div>
            <div>
              <h2 className="sub-title">{t.research.profilesTitle}</h2>
              <ul className="profile-links mt-5">
                {researchProfiles.map((p) => (
                  <li key={p.label}>
                    <ExternalLink href={p.href} newTab={t.newTab} className="btn btn-line btn-small">
                      {p.label}
                    </ExternalLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </SubpageShell>
  );
}
