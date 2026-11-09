import { KindIndex } from "@/components/AchievementDetail";

// Alamat kategori tanpa slug (/buku/) dialihkan ke bagian yang memuatnya; segmen lain 404.
export const dynamic = "force-dynamic";

export default async function KindIndexPage({ params }: { params: Promise<{ kind: string }> }) {
  return KindIndex({ lang: "id", kindSlug: (await params).kind });
}
