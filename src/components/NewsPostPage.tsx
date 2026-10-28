import Analytics from "@/components/Analytics";
import ExternalLink from "@/components/ExternalLink";
import SubpageShell from "@/components/SubpageShell";
import { copy, site, type Lang } from "@/data/profile";
import { homePath } from "@/lib/nav";
import { asHtml } from "@/lib/richtext";
import { renderRichText } from "@/server/richtext";
import {
  type PostItem,
  hasPage,
  isoPartialDate,
  postDate,
  postKindLabel,
  postPath,
  postsPath,
  postUrl,
} from "@/lib/posts";

// Halaman satu tulisan atau kabar yang punya isi lengkap di situs.
export default function NewsPostPage({ lang, post }: { lang: Lang; post: PostItem }) {
  const t = copy[lang];
  const other: Lang = lang === "id" ? "en" : "id";
  const title = post.title[lang];
  const kind = postKindLabel(post, lang);
  const date = postDate(post, lang);
  // Dibersihkan lagi saat dirender, sebagai lapis kedua setelah pembersihan saat disimpan.
  const html = renderRichText(asHtml(post.body?.[lang] ?? ""));
  const otherHref = hasPage(post, other) ? postPath(other, post.slug) : postsPath(other);

  const structured = {
    "@context": "https://schema.org",
    "@type": post.kind === "liputan" ? "NewsArticle" : "BlogPosting",
    headline: title,
    description: post.summary?.[lang],
    datePublished: post.date ? isoPartialDate(post.date) : undefined,
    dateModified: post.updatedAt,
    author: post.kind === "liputan" ? undefined : { "@type": "Person", name: site.name, url: site.url },
    publisher: post.outlet ? { "@type": "Organization", name: post.outlet } : undefined,
    inLanguage: lang,
    url: postUrl(lang, post.slug),
    isBasedOn: post.url,
  };

  return (
    <SubpageShell lang={lang} otherHref={otherHref}>
      <Analytics />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured) }} />
      <article aria-labelledby="post-title" className="section subpage-section">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <nav aria-label={t.archive.crumbs} className="crumbs">
            <ol>
              <li>
                <a href={homePath(lang)} className="link">
                  {t.archive.home}
                </a>
              </li>
              <li>
                <a href={postsPath(lang)} className="link">
                  {t.news.title}
                </a>
              </li>
              <li aria-current="page">{kind}</li>
            </ol>
          </nav>

          <div className="post">
            <p className="cred-kind">{kind}</p>
            <h1 id="post-title" className="detail-title">
              {title}
            </h1>
            <p className="post-meta">
              {date === "" ? null : (
                <span>
                  {t.news.published} <time dateTime={post.date ? isoPartialDate(post.date) : undefined}>{date}</time>
                </span>
              )}
              {post.outlet ? <span>{post.outlet}</span> : null}
            </p>
            {post.summary ? <p className="section-intro">{post.summary[lang]}</p> : null}

            <div className="post-body" dangerouslySetInnerHTML={{ __html: html }} />

            <div className="post-foot">
              {post.url ? (
                <ExternalLink href={post.url} newTab={t.newTab} className="btn btn-line">
                  {t.news.original.replace("{outlet}", post.outlet ?? t.news.source)}
                </ExternalLink>
              ) : null}
              <a href={postsPath(lang)} className="link">
                {t.news.back}
              </a>
            </div>
          </div>
        </div>
      </article>
    </SubpageShell>
  );
}
