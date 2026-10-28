"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCollection, getSettingsConfig } from "@/content/collections";
import type { FieldErrors } from "@/content/fields";
import type { CollectionKey } from "@/content/types";
import { db } from "@/db";
import { admins } from "@/db/schema";
import { DUMMY_HASH, verifyPassword } from "@/server/auth/password";
import { clearFailures, clientIp, isLimited, recordFailure } from "@/server/auth/rate-limit";
import { createSession, destroySession, requireAdmin } from "@/server/auth/session";
import { saveUpload } from "@/server/files";
import { sendTestMail } from "@/server/mail";
import { deleteComment, setCommentReply, setCommentStatus, type CommentStatus } from "@/server/comments";
import { deleteMessage, setMessageStatus, type MessageStatus } from "@/server/messages";
import {
  createShare,
  deleteEntry,
  moveEntry,
  revokeShare,
  saveEntry,
  saveSettings,
  setVisibility,
} from "@/server/entries";

// Semua Server Action admin. Setiap aksi (kecuali login) memanggil requireAdmin() lebih dulu,
// karena Server Action bisa dipanggil langsung tanpa melewati halaman.

// values: isian mentah dikembalikan saat validasi gagal, supaya formulir tidak kosong lagi.
export type FormState =
  | { message?: string; errors?: FieldErrors; ok?: boolean; values?: Record<string, string[]> }
  | undefined;

function rawValues(form: FormData): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  form.forEach((v, k) => {
    if (typeof v !== "string") return;
    if (k.startsWith("$ACTION")) return;
    (out[k] ??= []).push(v);
  });
  return out;
}

function toId(value: unknown): number {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) throw new Error("ID tidak valid");
  return n;
}

function toCollection(value: unknown): CollectionKey {
  const cfg = getCollection(String(value));
  if (cfg === undefined) throw new Error("Koleksi tidak dikenal");
  return cfg.key;
}

// ---------- Login ----------

export async function loginWithPassword(_prev: FormState, form: FormData): Promise<FormState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  if (email === "" || password === "") return { message: "Isi email dan kata sandi." };

  const ip = await clientIp();
  const keys = [`ip:${ip}`, `email:${email}`];
  if (await isLimited(keys)) return { message: "Terlalu banyak percobaan. Coba lagi 15 menit lagi." };

  const rows = await db.select().from(admins).where(eq(admins.email, email)).limit(1);
  const admin = rows[0];
  // Tetap jalankan verifikasi walau email tidak ada, supaya waktu respons tidak membocorkan email terdaftar.
  const ok = await verifyPassword(password, admin?.passwordHash ?? DUMMY_HASH);
  const allowed = admin ? (admin.active ? admin.passwordHash !== null : false) : false;
  if (!ok || !allowed || admin === undefined) {
    await recordFailure(keys);
    return { message: "Email atau kata sandi salah." };
  }
  await clearFailures(keys);
  await createSession(admin.id, "password");
  redirect("/admin/");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login/");
}

// ---------- Konten ----------

export async function saveEntryAction(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const collection = toCollection(form.get("collection"));
  const idText = String(form.get("id") ?? "");
  const id = idText === "" ? null : toId(idText);
  const res = await saveEntry(collection, id, form);
  if (!res.ok) return { message: res.message, errors: res.errors, values: rawValues(form) };
  if (id === null) redirect(`/admin/${collection}/${res.id}/?saved=1`);
  // Muat ulang data halaman, supaya formulir menampilkan isi yang baru tersimpan
  // (React mengosongkan formulir ke nilai awalnya setelah action berhasil).
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Tersimpan." };
}

export async function deleteEntryAction(form: FormData) {
  await requireAdmin();
  const collection = toCollection(form.get("collection"));
  await deleteEntry(toId(form.get("id")));
  redirect(`/admin/${collection}/?deleted=1`);
}

export async function setVisibilityAction(form: FormData) {
  await requireAdmin();
  const collection = toCollection(form.get("collection"));
  const visibility = form.get("visibility") === "public" ? "public" : "private";
  const error = await setVisibility(toId(form.get("id")), visibility);
  const back = String(form.get("back") ?? "list");
  const base = back === "edit" ? `/admin/${collection}/${toId(form.get("id"))}/` : `/admin/${collection}/`;
  redirect(error ? `${base}?error=${encodeURIComponent(error)}` : base);
}

export async function moveEntryAction(form: FormData) {
  await requireAdmin();
  const collection = toCollection(form.get("collection"));
  await moveEntry(toId(form.get("id")), form.get("direction") === "up" ? "up" : "down");
  redirect(`/admin/${collection}/`);
}

export async function createShareAction(id: number): Promise<{ token: string }> {
  await requireAdmin();
  return { token: await createShare(toId(id)) };
}

// Unggah gambar dari editor rich text. Gambar dikaitkan ke datanya (entryId) supaya izin
// aksesnya mengikuti status data itu; untuk data baru, kaitan dibuat saat pertama disimpan.
export async function uploadInlineImageAction(
  form: FormData,
): Promise<{ ok: true; url: string } | { ok: false; message: string }> {
  await requireAdmin();
  const file = form.get("file");
  if (!(file instanceof File)) return { ok: false, message: "Tidak ada gambar." };
  const idText = String(form.get("entryId") ?? "");
  const entryId = idText === "" ? null : toId(idText);
  try {
    const buf = Buffer.from(await file.arrayBuffer());
    const meta = await saveUpload(buf, file.name, entryId, { imagesOnly: true });
    return { ok: true, url: `/files/${meta.id}/` };
  } catch (err) {
    return { ok: false, message: (err as Error).message };
  }
}

export async function revokeShareAction(id: number): Promise<void> {
  await requireAdmin();
  await revokeShare(toId(id));
}

export async function saveSettingsAction(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const key = String(form.get("key") ?? "");
  const res = await saveSettings(key, form);
  if (!res.ok) {
    // Isian rahasia (sandi SMTP) tidak dikirim balik ke browser.
    const values = rawValues(form);
    for (const f of getSettingsConfig(key)?.fields ?? []) {
      if (f.type === "secret") delete values[`f.${f.name}`];
    }
    return { message: res.message, errors: res.errors, values };
  }
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Tersimpan." };
}

export async function sendTestMailAction(_prev: FormState, _form: FormData): Promise<FormState> {
  await requireAdmin();
  const res = await sendTestMail();
  return { ok: res.ok, message: res.message };
}

// ---------- Pesan masuk ----------

const MESSAGE_STATUSES: MessageStatus[] = ["new", "read", "archived"];

function messageFilter(value: unknown): string {
  const f = String(value ?? "");
  return f === "new" ? "new" : f === "archived" ? "archived" : "inbox";
}

export async function setMessageStatusAction(form: FormData) {
  await requireAdmin();
  const id = toId(form.get("id"));
  const status = String(form.get("status")) as MessageStatus;
  if (!MESSAGE_STATUSES.includes(status)) throw new Error("Status pesan tidak dikenal");
  await setMessageStatus(id, status);
  redirect(`/admin/pesan/?f=${messageFilter(form.get("filter"))}`);
}

export async function deleteMessageAction(form: FormData) {
  await requireAdmin();
  await deleteMessage(toId(form.get("id")));
  // Satu parameter saja: nilai "deleted" sekaligus menyimpan saringan yang sedang dibuka.
  redirect(`/admin/pesan/?deleted=${messageFilter(form.get("filter"))}`);
}

// ---------- Komentar ----------

const COMMENT_STATUSES: CommentStatus[] = ["pending", "approved", "spam"];

function commentFilter(value: unknown): CommentStatus {
  const f = String(value ?? "");
  return f === "approved" ? "approved" : f === "spam" ? "spam" : "pending";
}

// Setelah aksi, kembali ke saringan yang sama dengan penanda toast (?done=...).
function backToComments(filter: CommentStatus, done: string): never {
  redirect(`/admin/komentar/?${new URLSearchParams({ f: filter, done }).toString()}`);
}

export async function setCommentStatusAction(form: FormData) {
  await requireAdmin();
  const status = String(form.get("status")) as CommentStatus;
  if (!COMMENT_STATUSES.includes(status)) throw new Error("Status komentar tidak dikenal");
  await setCommentStatus(toId(form.get("id")), status);
  revalidatePath("/", "layout");
  backToComments(commentFilter(form.get("filter")), status);
}

export async function replyCommentAction(form: FormData) {
  await requireAdmin();
  await setCommentReply(toId(form.get("id")), String(form.get("reply") ?? "").slice(0, 2000));
  revalidatePath("/", "layout");
  backToComments(commentFilter(form.get("filter")), "replied");
}

export async function deleteCommentAction(form: FormData) {
  await requireAdmin();
  await deleteComment(toId(form.get("id")));
  revalidatePath("/", "layout");
  backToComments(commentFilter(form.get("filter")), "deleted");
}
