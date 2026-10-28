import Analytics from "@/components/Analytics";
import NewsCard from "@/components/NewsCard";
import Reveal from "@/components/Reveal";
import Spotlight from "@/components/Spotlight";
import SubpageShell from "@/components/SubpageShell";
import { copy, type Lang } from "@/data/profile";
import { homePath } from "@/lib/nav";
import { groupByYear, postsPath, publicPosts } from "@/lib/posts";
import { loadSite } from "@/server/content";

// Arsip /kabar/ dan /en/news/: semua berita public dikelompokkan per tahun.
export default async function NewsArchivePage({ lang }: { lang: Lang }) {
  const t = copy[lang];
  const other: Lang = lang === "id" ? "en" : "id";
  const groups = groupByYear(publicPosts((await loadSite()).post));

  return (
    <SubpageShell lang={lang} otherHref={postsPath(other)}>
      <Analytics />
      <section aria-labelledby="news-title" className="section subpage-section">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <nav aria-label={t.archive.crumbs} className="crumbs">
            <ol>
              <li>
                <a href={homePath(lang)} className="link">
                  {t.archive.home}
                </a>
              </li>
              <li aria-current="page">{t.news.title}</li>
            </ol>
          </nav>
          <Reveal className="section-head max-w-3xl">
            <h1 id="news-title" className="section-title">
              {t.news.title}
            </h1>
            <p className="section-intro">{t.news.archiveIntro}</p>
          </Reveal>

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
