import ExternalLink from "@/components/ExternalLink";
import { socialPlatformLabels, type SocialPlatform, type SocialPost } from "@/content/types";
import { copy, type Lang } from "@/data/profile";
import { formatPartialDate } from "@/lib/achievements";

export interface SocialItem extends SocialPost {
  slug: string;
}

export type SocialProfiles = Partial<Record<SocialPlatform, string>>;

// Satu postingan: gambar (bila ada), platform dan tanggal, teks, dan tautan ke postingan asli.
// Postingan hasil impor ekspor tidak punya tautan sendiri, jadi menaut ke profil akunnya.
// Teks dipotong beberapa baris; versi lengkap ada di platform asalnya.
export default function SocialCard({ post, lang, profiles }: { post: SocialItem; lang: Lang; profiles: SocialProfiles }) {
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

