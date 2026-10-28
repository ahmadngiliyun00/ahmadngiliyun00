import "server-only";
import { createHash } from "node:crypto";
import { count, desc, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { messages } from "@/db/schema";
import type { ContactInput } from "@/lib/contact";

// Baca dan tulis pesan form kontak. Pesan selalu privat: tidak pernah dirender di situs publik.

export type MessageStatus = "new" | "read" | "archived";
export type MessageFilter = "new" | "inbox" | "archived";
export type Message = typeof messages.$inferSelect;

export function hashIp(ip: string): string | null {
  if (ip === "unknown") return null;
  // Garam dari CONTACT_IP_SALT supaya hash tidak bisa dicocokkan dengan daftar IP umum.
  const salt = process.env.CONTACT_IP_SALT ?? "ngiliyun-contact";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

export async function createMessage(input: ContactInput, lang: "id" | "en", ip: string): Promise<number> {
  const res = await db.insert(messages).values({
    name: input.name,
    email: input.email,
    topic: input.topic,
    body: input.body,
    lang,
    status: "new",
    ipHash: hashIp(ip),
    notified: false,
    createdAt: new Date(),
  }).$returningId();
  return res[0].id;
}

export async function markNotified(id: number) {
  await db.update(messages).set({ notified: true }).where(eq(messages.id, id));
}

// inbox = semua kecuali arsip (baru dan sudah dibaca).
export async function listMessages(filter: MessageFilter): Promise<Message[]> {
  const where =
    filter === "new" ? eq(messages.status, "new") : filter === "archived" ? eq(messages.status, "archived") : ne(messages.status, "archived");
  return db.select().from(messages).where(where).orderBy(desc(messages.createdAt));
}

export async function countMessages(): Promise<Record<MessageStatus, number>> {
  const rows = await db.select({ status: messages.status, n: count() }).from(messages).groupBy(messages.status);
  const out: Record<MessageStatus, number> = { new: 0, read: 0, archived: 0 };
  for (const r of rows) out[r.status] = r.n;
  return out;
}

export async function setMessageStatus(id: number, status: MessageStatus) {
  await db
    .update(messages)
    .set({ status, readAt: status === "new" ? null : new Date() })
    .where(eq(messages.id, id));
}

export async function deleteMessage(id: number) {
  await db.delete(messages).where(eq(messages.id, id));
}
