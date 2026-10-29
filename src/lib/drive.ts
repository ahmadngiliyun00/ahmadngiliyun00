// Tautan berkas Google Drive untuk pratinjau bukti sertifikat.
// Isian CMS menerima tautan berbagi, tautan pratinjau, atau kode <iframe> dari menu "Sematkan item".
// Yang disimpan selalu bentuk baku https://drive.google.com/file/d/<id>/view, dan situs
// menyematkan versi /preview-nya. Berkas ini hanya boleh import type (dibaca unit test).

export type DriveFile = { id: string; resourceKey?: string };

const FILE_ID = /^[A-Za-z0-9_-]{10,200}$/;
const RESOURCE_KEY = /^[A-Za-z0-9_-]{1,200}$/;
const AMP = String.fromCharCode(38);

// Atribut src dari kode sematan. Entitas HTML untuk pemisah parameter diubah balik.
function embedSrc(text: string): string {
  const m = /src\s*=\s*["']([^"']+)["']/i.exec(text);
  if (m === null) return text;
  return m[1].split(`${AMP}amp;`).join(AMP);
}

export function parseDriveUrl(input: string): DriveFile | null {
  const text = embedSrc(input.trim());
  let url: URL;
  try {
    url = new URL(text);
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  if (url.hostname !== "drive.google.com") {
    if (url.hostname !== "docs.google.com") return null;
  }

  // Bentuk umum: /file/d/<id>/view, /preview, /edit (juga dengan awalan /u/0/).
  const path = url.pathname.replace(/^\/u\/\d+/, "");
  const inPath = /^\/file\/d\/([^/]+)/.exec(path);
  let id = "";
  if (inPath !== null) id = inPath[1];
  else if (url.hostname === "drive.google.com") {
    // Bentuk lama: /open?id=<id> dan /uc?id=<id>.
    if (path === "/open" || path === "/uc") id = url.searchParams.get("id") ?? "";
  }
  if (!FILE_ID.test(id)) return null;

  // Berkas lama yang dibagikan sebelum 2021 butuh resourcekey supaya bisa dibuka orang lain.
  const key = url.searchParams.get("resourcekey") ?? "";
  return RESOURCE_KEY.test(key) ? { id, resourceKey: key } : { id };
}

// Tautan folder tidak bisa dipratinjau; dipakai untuk pesan galat yang lebih jelas.
export function isDriveFolder(input: string): boolean {
  return /drive\.google\.com\/(drive\/(u\/\d+\/)?folders|embeddedfolderview)/.test(input);
}

function withKey(base: string, file: DriveFile): string {
  return file.resourceKey ? `${base}?resourcekey=${file.resourceKey}` : base;
}

export function driveViewUrl(file: DriveFile): string {
  return withKey(`https://drive.google.com/file/d/${file.id}/view`, file);
}

export function drivePreviewUrl(file: DriveFile): string {
  return withKey(`https://drive.google.com/file/d/${file.id}/preview`, file);
}

// Bentuk baku untuk disimpan, atau null bila bukan tautan berkas Google Drive.
export function normalizeDriveUrl(input: string): string | null {
  const file = parseDriveUrl(input);
  return file === null ? null : driveViewUrl(file);
}
