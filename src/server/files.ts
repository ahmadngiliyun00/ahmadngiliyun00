import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { isAbsolute, join } from "node:path";
import { and, eq, inArray, isNull, or } from "drizzle-orm";
import { db } from "@/db";
import { files } from "@/db/schema";

// Berkas unggahan disimpan di disk (UPLOAD_DIR, di luar public/) dan hanya bisa dibuka lewat
// route /files/<id>/, yang memeriksa izin: admin, item public, atau tautan berbagi yang sah.

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export const ALLOWED_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export type FileMeta = typeof files.$inferSelect;

// Path ditentukan saat runtime (UPLOAD_DIR), jadi dikecualikan dari tracing berkas saat build.
function uploadDir(): string {
  const dir = process.env.UPLOAD_DIR ?? "storage/uploads";
  return isAbsolute(dir) ? dir : join(/*turbopackIgnore: true*/ process.cwd(), dir);
}

function storedPath(name: string): string {
  return join(/*turbopackIgnore: true*/ uploadDir(), name);
}

// Memeriksa tanda tangan berkas (magic bytes), bukan hanya tipe yang dikirim peramban.
export function sniffType(buf: Buffer): string | null {
  if (buf.subarray(0, 5).toString("latin1") === "%PDF-") return "application/pdf";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (buf[0] === 0xff) {
    if (buf[1] === 0xd8) return "image/jpeg";
  }
  if (buf.subarray(0, 4).toString("latin1") === "RIFF") {
    if (buf.subarray(8, 12).toString("latin1") === "WEBP") return "image/webp";
  }
  return null;
}

// imagesOnly untuk gambar di dalam tulisan (editor rich text): PDF ditolak.
export async function saveUpload(
  buf: Buffer,
  originalName: string,
  entryId: number | null,
  opts: { imagesOnly?: boolean } = {},
): Promise<FileMeta> {
  const mime = sniffType(buf);
  if (mime === null) throw new Error(opts.imagesOnly ? "Gambar harus PNG, JPG, atau WebP." : "Berkas harus PDF, PNG, JPG, atau WebP.");
  if (opts.imagesOnly) {
    if (mime === "application/pdf") throw new Error("Gambar harus PNG, JPG, atau WebP.");
  }
  if (buf.length > MAX_UPLOAD_BYTES) throw new Error("Berkas melebihi 5 MB.");
  const id = randomBytes(12).toString("hex");
  const storedName = `${id}.${ALLOWED_TYPES[mime]}`;
  await mkdir(uploadDir(), { recursive: true });
  await writeFile(storedPath(storedName), buf, { mode: 0o600 });
  const row: FileMeta = {
    id,
    entryId,
    storedName,
    originalName: originalName.slice(0, 255),
    mime,
    size: buf.length,
    createdAt: new Date(),
  };
  await db.insert(files).values(row);
  return row;
}

export async function getFileMeta(id: string): Promise<FileMeta | undefined> {
  if (!/^[a-f0-9]{24}$/.test(id)) return undefined;
  const rows = await db.select().from(files).where(eq(files.id, id)).limit(1);
  return rows[0];
}

export async function readStored(meta: FileMeta): Promise<Buffer> {
  return readFile(storedPath(meta.storedName));
}

// Mengaitkan gambar di dalam isi ke datanya dan menghapus gambar milik data itu yang tidak
// dipakai lagi (misalnya dihapus dari editor). keep = berkas lain yang tetap dipakai (fileId).
export async function syncInlineFiles(entryId: number, used: string[], keep: string[] = []) {
  if (used.length > 0) {
    await db
      .update(files)
      .set({ entryId })
      .where(and(inArray(files.id, used), or(isNull(files.entryId), eq(files.entryId, entryId))));
  }
  const owned = await db.select({ id: files.id }).from(files).where(eq(files.entryId, entryId));
  for (const f of owned) {
    if (used.includes(f.id)) continue;
    if (keep.includes(f.id)) continue;
    await deleteFile(f.id);
  }
}

// Semua berkas milik satu data, dipakai saat data dihapus.
export async function deleteEntryFiles(entryId: number) {
  const owned = await db.select({ id: files.id }).from(files).where(eq(files.entryId, entryId));
  for (const f of owned) await deleteFile(f.id);
}

export async function deleteFile(id: string) {
  const meta = await getFileMeta(id);
  if (meta === undefined) return;
  await rm(storedPath(meta.storedName), { force: true });
  await db.delete(files).where(eq(files.id, id));
}
