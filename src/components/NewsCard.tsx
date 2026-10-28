import ExternalLink from "@/components/ExternalLink";
import { copy, type Lang } from "@/data/profile";
import { type PostItem, postDate, postHref, postKindLabel } from "@/lib/posts";

// Kartu satu berita atau tulisan. Dipakai di beranda dan arsip /kabar/.
// Kartu menaut ke halaman di situs bila ada isi lengkap, kalau tidak ke sumber aslinya.
export default function NewsCard({ post, lang, headingLevel = 3 }: { post: PostItem; lang: Lang; headingLevel?: 2 | 3 }) {
  const t = copy[lang];
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const title = post.title[lang];
  const link = postHref(post, lang);
  const action = link ? (link.external ? t.news.readOn.replace("{outlet}", post.outlet ?? t.news.source) : t.news.read) : "";
  // Tautan keluar ke artikel dalam bahasa lain diberi keterangan bahasanya.
  const foreign = link ? (link.external ? (post.sourceLang ? post.sourceLang !== lang : false) : false) : false;

  return (
    <article className="cred news-card" data-spot data-kind={post.kind}>
      <p className="cred-meta">
        <span className="cred-kind">{postKindLabel(post, lang)}</span>
        <span>{postDate(post, lang)}</span>
      </p>
      <Heading className="cred-title">
        {link === null ? (
          title
        ) : link.external ? (
          <ExternalLink href={link.href} newTab={t.newTab} className="cred-link">
            {title}
          </ExternalLink>
        ) : (
          <a href={link.href} className="cred-link">
            {title}
          </a>
        )}
      </Heading>
      {post.outlet ? <p className="cred-issuer">{post.outlet}</p> : null}
      {post.summary ? <p className="cred-summary">{post.summary[lang]}</p> : null}
      {link === null ? null : (
        <div className="cred-actions">
          {/* Tautan kedua untuk mata saja; pembaca layar dan keyboard memakai tautan judul. */}
          <a
            href={link.href}
            className="link text-sm"
            aria-hidden="true"
            tabIndex={-1}
            target={link.external ? "_blank" : undefined}
            rel={link.external ? "noopener noreferrer" : undefined}
          >
            {action}
          </a>
          {foreign ? <span className="news-lang">{t.news.sourceLang[post.sourceLang ?? "id"]}</span> : null}
        </div>
      )}
    </article>
  );
}
