import { notFound } from "next/navigation";
import { getCollection } from "@/content/collections";
import { requireAdmin } from "@/server/auth/session";
import { exportCollection } from "@/server/transfer";

// Unduh semua data satu koleksi (public dan privat) sebagai Excel untuk diisi lalu diimpor kembali.
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ collection: string }> }) {
  await requireAdmin();
  const cfg = getCollection((await params).collection);
  if (cfg === undefined) notFound();
  const { filename, body } = await exportCollection(cfg);
  return new Response(Buffer.from(body), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
