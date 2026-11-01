import type { NextRequest } from "next/server";
import { sameToken } from "@/server/auth/github";
import { AUTO_PLATFORMS } from "@/server/social/config";
import { getConnection } from "@/server/social/store";
import { syncPlatform } from "@/server/social/sync";

// Tarikan terjadwal postingan media sosial, dipanggil cron di server (lihat docs/DEPLOY.md):
//   curl -fsS -X POST -H "Authorization: Bearer <SOCIAL_CRON_SECRET>" https://ngiliyun.my.id/cron/social/
// Tanpa SOCIAL_CRON_SECRET (minimal 32 karakter) rute ini mati. Hasil tarikan selalu data privat,
// dan token Instagram ikut diperpanjang sehingga koneksi tidak kedaluwarsa.

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const secret = (process.env.SOCIAL_CRON_SECRET ?? "").trim();
  if (secret.length < 32) return new Response("Tidak ditemukan", { status: 404 });
  const header = req.headers.get("authorization") ?? "";
  const given = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!sameToken(given, secret)) return new Response("Tidak diizinkan", { status: 401 });

  const results: Record<string, unknown> = {};
  for (const platform of AUTO_PLATFORMS) {
    if ((await getConnection(platform)) === null) {
      results[platform] = { skipped: "belum terhubung" };
      continue;
    }
    const { added, images, skipped, more, error } = await syncPlatform(platform);
    results[platform] = { added, images, skipped, more, error };
  }
  return Response.json(results, { headers: { "Cache-Control": "no-store" } });
}

export function GET() {
  return new Response("Gunakan POST", { status: 405, headers: { Allow: "POST" } });
}
