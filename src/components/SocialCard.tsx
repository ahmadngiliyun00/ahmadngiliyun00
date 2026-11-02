import ExternalLink from "@/components/ExternalLink";
import MediaCarousel from "@/components/MediaCarousel";
import { socialPlatformLabels, type SocialPlatform, type SocialPost } from "@/content/types";
import { copy, type Lang } from "@/data/profile";
import { formatPartialDate } from "@/lib/achievements";
import { slideImages, socialSlides } from "@/lib/gallery";

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
  // Gambar dari tab yang dipilih di CMS (tautan, satu gambar, atau carousel); tanpa gambar bila kosong.
  // Dua gambar atau lebih tampil sebagai carousel. Tautan luar dimuat tanpa Referer.
  const images = slideImages(socialSlides(post), lang, post.imageAlt?.[lang] ?? "", t.carousel.image);
  return (
    <article className="cred social-post" data-spot data-platform={post.platform}>
      {images.length > 0 ? <MediaCarousel images={images} labels={t.carousel} className="social-image" /> : null}
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

