import type { Metadata } from "next";
import { notFound } from "next/navigation";
import NewsPostPage from "@/components/NewsPostPage";
import { SLUG_PATTERN } from "@/content/fields";
import { buildPostMetadata } from "@/lib/metadata";
import { hasPage, publicPosts } from "@/lib/posts";
import { loadSite } from "@/server/content";

// Hanya berita public yang punya isi lengkap dalam bahasa ini. Liputan tanpa isi menaut ke sumbernya.
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

async function find(slug: string) {
  if (!SLUG_PATTERN.test(slug)) return undefined;
  const post = publicPosts((await loadSite()).post).find((p) => p.slug === slug);
  return post ? (hasPage(post, "id") ? post : undefined) : undefined;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await find((await params).slug);
  return post ? buildPostMetadata("id", post) : {};
}

export default async function NewsPostRoute({ params }: Props) {
  const post = await find((await params).slug);
  if (post === undefined) notFound();
  return <NewsPostPage lang="id" post={post} />;
}
