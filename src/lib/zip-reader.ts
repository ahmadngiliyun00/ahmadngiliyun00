// Pembaca ZIP untuk berkas besar di peramban: hanya bagian yang dibutuhkan yang dibaca lewat
// Blob.slice, jadi arsip ekspor ratusan MB tidak dimuat utuh ke memori dan tidak pernah dikirim
// ke server. Dekompresi memakai DecompressionStream bawaan peramban (juga ada di Node 22).
// Mendukung metode stored (0) dan deflate (8), serta ZIP64. Tanpa impor nilai, supaya bisa diuji
// dari tests/social-export.test.mjs.

export type ZipEntry = {
  name: string;
  method: number;
  compressedSize: number;
  size: number;
  localOffset: number;
};

const EOCD = 0x06054b50;
const EOCD64 = 0x06064b50;
const EOCD64_LOCATOR = 0x07064b50;
const CENTRAL = 0x02014b50;
const LOCAL = 0x04034b50;
const MAX_COMMENT = 0xffff;

async function bytes(blob: Blob, start: number, end: number): Promise<DataView> {
  return new DataView(await blob.slice(start, end).arrayBuffer());
}

function u64(view: DataView, at: number): number {
  return view.getUint32(at, true) + view.getUint32(at + 4, true) * 0x100000000;
}

function decodeName(raw: Uint8Array, utf8: boolean): string {
  if (utf8) return new TextDecoder("utf-8").decode(raw);
  // Tanpa penanda UTF-8, nama tetap dicoba sebagai UTF-8 (kebanyakan alat modern), lalu latin1.
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(raw);
  } catch {
    return Array.from(raw, (b) => String.fromCharCode(b)).join("");
  }
}

// Daftar isi arsip dari central directory di akhir berkas.
export async function listZip(file: Blob): Promise<ZipEntry[]> {
  const tailStart = Math.max(0, file.size - (MAX_COMMENT + 22));
  const tail = await bytes(file, tailStart, file.size);
  let at = -1;
  for (let i = tail.byteLength - 22; i >= 0; i--) {
    if (tail.getUint32(i, true) === EOCD) {
      at = i;
      break;
    }
  }
  if (at < 0) throw new Error("Berkas ini bukan arsip ZIP, atau unduhannya terpotong.");
  let count = tail.getUint16(at + 10, true);
  let dirSize = tail.getUint32(at + 12, true);
  let dirOffset = tail.getUint32(at + 16, true);
  if (count === 0xffff || dirSize === 0xffffffff || dirOffset === 0xffffffff) {
    const locAt = tailStart + at - 20;
    const loc = await bytes(file, locAt, locAt + 20);
    if (loc.getUint32(0, true) !== EOCD64_LOCATOR) throw new Error("Arsip ZIP64 tidak lengkap.");
    const recAt = u64(loc, 8);
    const rec = await bytes(file, recAt, recAt + 56);
    if (rec.getUint32(0, true) !== EOCD64) throw new Error("Arsip ZIP64 tidak lengkap.");
    count = u64(rec, 32);
    dirSize = u64(rec, 40);
    dirOffset = u64(rec, 48);
  }
  if (dirOffset + dirSize > file.size) throw new Error("Arsip ZIP rusak atau terpotong.");
  const dir = await bytes(file, dirOffset, dirOffset + dirSize);
  const entries: ZipEntry[] = [];
  let p = 0;
  for (let n = 0; n < count; n++) {
    if (p + 46 > dir.byteLength || dir.getUint32(p, true) !== CENTRAL) throw new Error("Daftar isi ZIP rusak.");
    const flags = dir.getUint16(p + 8, true);
    const method = dir.getUint16(p + 10, true);
    let compressedSize = dir.getUint32(p + 20, true);
    let size = dir.getUint32(p + 24, true);
    const nameLen = dir.getUint16(p + 28, true);
    const extraLen = dir.getUint16(p + 30, true);
    const commentLen = dir.getUint16(p + 32, true);
    let localOffset = dir.getUint32(p + 42, true);
    const nameBytes = new Uint8Array(dir.buffer, dir.byteOffset + p + 46, nameLen);
    const name = decodeName(nameBytes, (flags >> 11) % 2 === 1);
    // Kolom ZIP64 di extra field, urutannya mengikuti kolom yang bernilai 0xffffffff.
    let e = p + 46 + nameLen;
    const extraEnd = e + extraLen;
    while (e + 4 <= extraEnd) {
      const id = dir.getUint16(e, true);
      const len = dir.getUint16(e + 2, true);
      if (id === 1) {
        let q = e + 4;
        if (size === 0xffffffff) {
          size = u64(dir, q);
          q += 8;
        }
        if (compressedSize === 0xffffffff) {
          compressedSize = u64(dir, q);
          q += 8;
        }
        if (localOffset === 0xffffffff) localOffset = u64(dir, q);
      }
      e += 4 + len;
    }
    if (!name.endsWith("/")) entries.push({ name, method, compressedSize, size, localOffset });
    p = extraEnd + commentLen;
  }
  return entries;
}

// Isi satu berkas di arsip sebagai Blob.
export async function readZipEntry(file: Blob, entry: ZipEntry, type = ""): Promise<Blob> {
  const head = await bytes(file, entry.localOffset, entry.localOffset + 30);
  if (head.getUint32(0, true) !== LOCAL) throw new Error(`Berkas ${entry.name} di dalam arsip rusak.`);
  const start = entry.localOffset + 30 + head.getUint16(26, true) + head.getUint16(28, true);
  const raw = file.slice(start, start + entry.compressedSize);
  if (entry.method === 0) return raw.slice(0, raw.size, type);
  if (entry.method !== 8) throw new Error(`Berkas ${entry.name} memakai kompresi yang tidak didukung.`);
  const stream = raw.stream().pipeThrough(new DecompressionStream("deflate-raw"));
  const out = await new Response(stream).blob();
  return type === "" ? out : out.slice(0, out.size, type);
}

export async function readZipText(file: Blob, entry: ZipEntry): Promise<string> {
  return (await readZipEntry(file, entry)).text();
}

// Mencari berkas berdasarkan path relatif di JSON ekspor. Arsip yang dibungkus ulang dalam
// folder (misalnya hasil ekstrak lalu zip lagi) tetap ditemukan lewat akhiran path.
export function findEntry(entries: ZipEntry[], path: string): ZipEntry | undefined {
  return entries.find((e) => e.name === path) ?? entries.find((e) => e.name.endsWith(`/${path}`));
}
