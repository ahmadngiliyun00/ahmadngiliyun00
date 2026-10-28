import Analytics from "@/components/Analytics";
import NewsCard from "@/components/NewsCard";
import Reveal from "@/components/Reveal";
import Spotlight from "@/components/Spotlight";
import PageHead from "@/components/PageHead";
import SubpageShell from "@/components/SubpageShell";
import { copy, type Lang } from "@/data/profile";
import { groupByYear, postsPath, publicPosts } from "@/lib/posts";
import { loadSite } from "@/server/content";

// Arsip /kabar/ dan /en/news/: semua berita public dikelompokkan per tahun.
export default async function NewsArchivePage({ lang }: { lang: Lang }) {
  const t = copy[lang];
  const other: Lang = lang === "id" ? "en" : "id";
  const groups = groupByYear(publicPosts((await loadSite()).post));

  return (
    <SubpageShell lang={lang} current="news" backHome otherHref={postsPath(other)}>
      <Analytics />
      <section aria-labelledby="news-title" className="section subpage-section">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <PageHead lang={lang} id="news-title" title={t.news.title} intro={t.news.archiveIntro} path={postsPath(lang)} />

          {groups.length === 0 ? (
            <p className="mt-12 text-muted">{t.news.empty}</p>
          ) : (
            <div className="news-years mt-12">
              {groups.map((g) => (
                <section key={g.year} className="news-year" aria-labelledby={`news-year-${g.year}`}>
                  <h2 id={`news-year-${g.year}`} className="pub-year-label">
                    {g.year}
                  </h2>
                  <Spotlight>
                    <ul className="cred-grid news-grid">
                      {g.items.map((post) => (
                        <li key={post.slug}>
                          <Reveal className="h-full">
                            <NewsCard post={post} lang={lang} />
                          </Reveal>
                        </li>
                      ))}
                    </ul>
                  </Spotlight>
                </section>
              ))}
            </div>
          )}
        </div>
      </section>
    </SubpageShell>
  );
}
