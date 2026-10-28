"use server";

import { revalidatePath } from "next/cache";
import { commentTooFast, normalizeComment, validateComment, type CommentState } from "@/lib/comment";
import { hasPage, postPath } from "@/lib/posts";
import { clientIp, isLimited, recordFailure } from "@/server/auth/rate-limit";
import { createComment } from "@/server/comments";
import { loadSite } from "@/server/content";
import { sendCommentNotification } from "@/server/mail";

// Server Action form komentar. Urutan: jebakan robot (diam-diam dianggap terkirim), validasi,
// tulisan masih public dan komentar masih dibuka, batas per IP, simpan sebagai menunggu
// persetujuan, lalu email notifikasi ke Mas Ilyun.

// Maksimal 3 komentar per IP per 10 menit.
const LIMIT = { limit: 3, windowMs: 10 * 60 * 1000 };

export async function postComment(_prev: CommentState, form: FormData): Promise<CommentState> {
  const lang = form.get("lang") === "en" ? "en" : "id";
  const slug = String(form.get("slug") ?? "");
  const input = normalizeComment({ name: form.get("name"), email: form.get("email"), body: form.get("body") });

  if (String(form.get("website") ?? "") !== "") return { status: "sent" };
  if (commentTooFast(form.get("startedAt"), Date.now())) return { status: "sent" };

  const errors = validateComment(input);
  if (Object.keys(errors).length > 0) return { status: "error", errors };

  const entry = (await loadSite()).post.find((e) => e.slug === slug);
  const open = entry ? (entry.visibility === "public" ? entry.data.comments === true : false) : false;
  if (entry === undefined) return { status: "error", formError: "closed" };
  if (!open) return { status: "error", formError: "closed" };
  if (!hasPage(entry.data, lang)) return { status: "error", formError: "closed" };

  const ip = await clientIp();
  const keys = [`comment:${ip}`];
  if (await isLimited(keys, LIMIT)) return { status: "error", formError: "tooMany" };

  try {
    const id = await createComment(entry.id, input, lang, ip);
    await recordFailure(keys, LIMIT);
    await sendCommentNotification({ id, ...input, postTitle: entry.data.title.id, postUrl: postPath(lang, entry.slug) });
  } catch (err) {
    console.error("[comment] Gagal menyimpan komentar", err instanceof Error ? err.message : err);
    return { status: "error", formError: "failed" };
  }
  revalidatePath("/admin", "layout");
  return { status: "sent" };
}
