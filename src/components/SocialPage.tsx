import Analytics from "@/components/Analytics";
import ExternalLink from "@/components/ExternalLink";
import PageHead from "@/components/PageHead";
import Reveal from "@/components/Reveal";
import Section from "@/components/Section";
import Spotlight from "@/components/Spotlight";
import SubpageShell from "@/components/SubpageShell";
import { socialPlatformLabels, type SocialPlatform, type SocialPost } from "@/content/types";
import { copy, type Lang } from "@/data/profile";
import { formatPartialDate } from "@/lib/achievements";
import { pagePath } from "@/lib/nav";
import { groupByTopic } from "@/lib/social";
import { loadSite } from "@/server/content";

interface Item extends SocialPost {
  slug: string;
}

type Profiles = Partial<Record<SocialPlatform, string>>;

// Satu postingan: gambar (bila ada), platform dan tanggal, teks, dan tautan ke postingan asli.
// Postingan hasil impor ekspor tidak punya tautan sendiri, jadi menaut ke profil akunnya.
// Teks dipotong beberapa baris; versi lengkap ada di platform asalnya.
function SocialCard({ post, lang, profiles }: { post: Item; lang: Lang; profiles: Profiles }) {
  const t = copy[lang];
  const platform = socialPlatformLabels[post.platform];
  const caption = post.caption[lang];
  const href = post.url ?? profiles[post.platform];
  const label = (post.url ? t.social.viewOn : t.social.profileOn).replace("{platform}", platform);
  return (
    <article className="cred social-post" data-spot data-platform={post.platform}>
      {post.fileId ? (
        // Gambar disajikan dari /files/ (UPLOAD_DIR), bukan dari CDN Meta yang tautannya kedaluwarsa.
        <img src={`/files/${post.fileId}/`} alt={post.imageAlt?.[lang] ?? ""} loading="lazy" decoding="async" className="social-image" />
      ) : null}
      <p className="cred-meta">
        <span className="cred-kind">{platform}</span>
        {post.date ? <span>{formatPartialDate(post.date, lang)}</span> : null}
      </p>
      {caption ? <p className="social-caption">{caption}</p> : null}
      {href ? (
        <div className="cred-actions">
          <ExternalLink href={href} newTab={t.newTab} className="link text-sm">
            {label}
          </ExternalLink>
        </div>
      ) : null}
    </article>
  );
}

function Grid({ items, lang, profiles }: { items: Item[]; lang: Lang; profiles: Profiles }) {
  return (
    <Spotlight>
      <ul className="cred-grid social-grid-public mt-8">
        {items.map((post) => (
          <li key={post.slug}>
            <Reveal className="h-full">
              <SocialCard post={post} lang={lang} profiles={profiles} />
            </Reveal>
          </li>
        ))}
      </ul>
    </Spotlight>
  );
}

// Halaman Media sosial (/media-sosial/, /en/social/): postingan public dari Instagram, Facebook,
// dan LinkedIn, dikelompokkan per topik (misalnya program yang sedang didampingi).
export default async function SocialPage({ lang }: { lang: Lang }) {
  const t = copy[lang];
  const other: Lang = lang === "id" ? "en" : "id";
  const content = await loadSite();
  const groups = groupByTopic(content.social.map((e) => ({ ...e.data, slug: e.slug })));
  const titled = groups.some((g) => g.topic !== null);

  return (
    <SubpageShell lang={lang} current="social" backHome otherHref={pagePath(other, "social")}>
      <Analytics />
      <div className="page-head mx-auto max-w-6xl px-5 sm:px-8">
        <PageHead lang={lang} id="page-title" title={t.pages.social.title} intro={t.pages.social.intro} path={pagePath(lang, "social")} />
        {groups.length > 1 ? (
          <nav aria-label={t.social.topicsLabel} className="social-topics">
            <ul className="tags">
              {groups.map((g) => (
                <li key={g.id}>
                  <a href={`#${g.id}`}>{g.topic ?? t.social.other}</a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </div>

      {groups.length === 0 ? (
        <div className="mx-auto max-w-6xl px-5 pb-16 sm:px-8">
          <p className="mt-8 text-muted">{t.social.empty}</p>
        </div>
      ) : titled ? (
        groups.map((g) => (
          <Section key={g.id} id={g.id} title={g.topic ?? t.social.other}>
            <Grid items={g.items} lang={lang} profiles={content.socialProfiles} />
          </Section>
        ))
      ) : (
        <div className="mx-auto max-w-6xl px-5 pb-16 sm:px-8">
          <Grid items={groups[0].items} lang={lang} profiles={content.socialProfiles} />
        </div>
      )}
    </SubpageShell>
  );
}
