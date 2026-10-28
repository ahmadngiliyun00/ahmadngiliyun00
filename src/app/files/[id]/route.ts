import { sql } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { db } from "@/db";
import { entries } from "@/db/schema";
import { getSession, sha256 } from "@/server/auth/session";
import { getFileMeta, readStored } from "@/server/files";

// Menyajikan berkas unggahan. Izin dibuka bila salah satu terpenuhi:
// 1. pengunjung adalah admin yang sedang masuk,
// 2. berkas milik data yang public (lampiran sertifikat atau gambar di dalam tulisan),
// 3. permintaan membawa token tautan berbagi (?s=) yang cocok dengan data pemilik berkas.
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const meta = await getFileMeta(id);
  if (meta === undefined) return new Response("Tidak ditemukan", { status: 404 });

  // Pemilik: data yang memakai berkas ini sebagai fileId (sertifikat), atau data yang tercatat
  // di files.entry_id (gambar di dalam isi tulisan).
  const owners = await db
    .select({ visibility: entries.visibility, shareHash: entries.shareHash })
    .from(entries)
    .where(
      meta.entryId === null
        ? sql`JSON_UNQUOTE(JSON_EXTRACT(${entries.data}, '$.fileId')) = ${id}`
        : sql`${entries.id} = ${meta.entryId} OR JSON_UNQUOTE(JSON_EXTRACT(${entries.data}, '$.fileId')) = ${id}`,
    )
    .limit(1);
  const owner = owners[0];
  const isPublic = owner ? owner.visibility === "public" : false;

  let allowed = isPublic;
  if (!allowed) {
    const token = req.nextUrl.searchParams.get("s") ?? "";
    if (token !== "") {
      if (owner?.shareHash) allowed = owner.shareHash === sha256(token);
    }
  }
  if (!allowed) allowed = (await getSession()) !== null;
  // Sengaja 404, bukan 403, supaya keberadaan berkas privat tidak terungkap.
  if (!allowed) return new Response("Tidak ditemukan", { status: 404 });

  const body = await readStored(meta);
  const safeName = meta.originalName.replace(/[^\w.\- ]+/g, "_");
  return new Response(new Uint8Array(body), {
    headers: {
      "Content-Type": meta.mime,
      "Content-Length": String(body.length),
      "Content-Disposition": `inline; filename="${safeName}"`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": isPublic ? "public, max-age=3600" : "private, no-store",
      "X-Robots-Tag": isPublic ? "all" : "noindex, nofollow",
    },
  });
}

