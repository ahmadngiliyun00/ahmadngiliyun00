import { loadSite } from "@/server/content";

// Berkas verifikasi HTML Google Search Console. next.config.ts menulis ulang
// /google<kode>.html ke rute ini; isinya hanya dikirim bila nama berkas sama dengan isian CMS.
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ file: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { file } = await params;
  const expected = (await loadSite()).seo.googleHtmlFile;
  if (expected === undefined) return new Response("Not found", { status: 404 });
  if (file !== expected) return new Response("Not found", { status: 404 });
  return new Response(`google-site-verification: ${file}`, {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
}
