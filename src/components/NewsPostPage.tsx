import Analytics from "@/components/Analytics";
import CommentForm from "@/components/CommentForm";
import ExternalLink from "@/components/ExternalLink";
import ShareButtons from "@/components/ShareButtons";
import SubpageShell from "@/components/SubpageShell";
import ViewBeacon from "@/components/ViewBeacon";
import { copy, site, type Lang } from "@/data/profile";
import { homePath } from "@/lib/nav";
import { formatNumber } from "@/lib/github";
import { asHtml, htmlToText, readingMinutes } from "@/lib/richtext";
import type { PublicComment } from "@/server/comments";
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
// comments = null bila kolom komentar dimatikan untuk tulisan ini.
export default function NewsPostPage({
  lang,
  post,
  views,
  comments,
}: {
  lang: Lang;
  post: PostItem;
  views: number;
  comments: PublicComment[] | null;
}) {
  const t = copy[lang];
  const other: Lang = lang === "id" ? "en" : "id";
  const title = post.title[lang];
  const kind = postKindLabel(post, lang);
  const date = postDate(post, lang);
  // Dibersihkan lagi saat dirender, sebagai lapis kedua setelah pembersihan saat disimpan.
  const html = renderRichText(asHtml(post.body?.[lang] ?? ""));
  const minutes = readingMinutes(htmlToText(html));
  const commentDate = new Intl.DateTimeFormat(lang === "id" ? "id-ID" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  });
  const viewText = views === 1 ? t.news.viewsOne : t.news.views.replace("{n}", formatNumber(views, lang));
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
      <ViewBeacon slug={post.slug} lang={lang} />
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
              <span>{t.news.readingTime.replace("{n}", String(minutes))}</span>
              {views > 0 ? <span>{viewText}</span> : null}
            </p>
            {post.summary ? <p className="section-intro">{post.summary[lang]}</p> : null}

            <div className="post-body" dangerouslySetInnerHTML={{ __html: html }} />

            <ShareButtons url={postUrl(lang, post.slug)} title={title} labels={{ ...t.news.share, newTab: t.newTab }} />

            {comments === null ? null : (
              <section className="comments" aria-labelledby="comments-title">
                <h2 id="comments-title" className="comments-title">
                  {t.news.comments.title}{" "}
                  <span className="comments-count">
                    {comments.length === 1
                      ? t.news.comments.countOne
                      : t.news.comments.count.replace("{n}", String(comments.length))}
                  </span>
                </h2>
                {comments.length === 0 ? (
                  <p className="mt-3 text-muted">{t.news.comments.empty}</p>
                ) : (
                  <ol className="comment-list">
                    {comments.map((c) => (
                      <li key={c.id} className="comment">
                        <p className="comment-head">
                          <span className="comment-name">{c.name}</span>
                          <time dateTime={c.createdAt.toISOString()}>{commentDate.format(c.createdAt)}</time>
                        </p>
                        <p className="comment-body">{c.body}</p>
                        {c.reply ? (
                          <div className="comment-reply">
                            <p className="comment-name">{t.news.comments.replyBy.replace("{name}", site.name)}</p>
                            <p className="comment-body">{c.reply}</p>
                          </div>
                        ) : null}
                      </li>
                    ))}
                  </ol>
                )}
                <CommentForm slug={post.slug} lang={lang} labels={t.news.comments} />
              </section>
            )}

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
