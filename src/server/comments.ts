import "server-only";
import { and, asc, count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { comments, entries } from "@/db/schema";
import type { CommentInput } from "@/lib/comment";
import { hashIp } from "@/server/messages";

// Komentar pengunjung pada tulisan. Selalu menunggu persetujuan sebelum tampil di situs.
// Email pengomentar hanya terlihat di CMS.

export type Comment = typeof comments.$inferSelect;
export type CommentStatus = Comment["status"];
export type PublicComment = { id: number; name: string; body: string; reply: string | null; createdAt: Date };

export async function createComment(entryId: number, input: CommentInput, lang: "id" | "en", ip: string): Promise<number> {
  const res = await db
    .insert(comments)
    .values({ entryId, name: input.name, email: input.email, body: input.body, lang, status: "pending", ipHash: hashIp(ip), createdAt: new Date() })
    .$returningId();
  return res[0].id;
}

// Komentar yang sudah disetujui, terlama di atas. Tanpa email.
export async function approvedComments(entryId: number): Promise<PublicComment[]> {
  try {
    return await db
      .select({ id: comments.id, name: comments.name, body: comments.body, reply: comments.reply, createdAt: comments.createdAt })
      .from(comments)
      .where(and(eq(comments.entryId, entryId), eq(comments.status, "approved")))
      .orderBy(asc(comments.createdAt));
  } catch {
    // Tabel belum dimigrasi: halaman tetap tampil tanpa komentar.
    return [];
  }
}

export interface AdminComment extends Comment {
  postTitle: string;
  postSlug: string;
}

export async function listComments(status: CommentStatus): Promise<AdminComment[]> {
  const rows = await db
    .select({ c: comments, data: entries.data, slug: entries.slug })
    .from(comments)
    .leftJoin(entries, eq(entries.id, comments.entryId))
    .where(eq(comments.status, status))
    .orderBy(desc(comments.createdAt));
  return rows.map((r) => {
    const data = (r.data ?? {}) as { title?: { id?: string } };
    return { ...r.c, postTitle: data.title?.id ?? "", postSlug: r.slug ?? "" };
  });
}

export async function countComments(): Promise<Record<CommentStatus, number>> {
  const out: Record<CommentStatus, number> = { pending: 0, approved: 0, spam: 0 };
  const rows = await db.select({ status: comments.status, n: count() }).from(comments).groupBy(comments.status);
  for (const r of rows) out[r.status] = r.n;
  return out;
}

export async function setCommentStatus(id: number, status: CommentStatus) {
  await db
    .update(comments)
    .set({ status, approvedAt: status === "approved" ? new Date() : null })
    .where(eq(comments.id, id));
}

// Balasan Mas Ilyun; membalas sekaligus menyetujui komentar. Balasan kosong menghapus balasan.
export async function setCommentReply(id: number, reply: string) {
  const text = reply.trim();
  await db
    .update(comments)
    .set(
      text === ""
        ? { reply: null, repliedAt: null }
        : { reply: text, repliedAt: new Date(), status: "approved", approvedAt: new Date() },
    )
    .where(eq(comments.id, id));
}

export async function deleteComment(id: number) {
  await db.delete(comments).where(eq(comments.id, id));
}
