import { existsSync } from "node:fs";
import { join } from "node:path";

// Hanya dipakai di server component saat build: mencari thumbnail WebP hasil scripts/thumbnails.mjs.
export function thumbnailFor(file: string): string | null {
  if (!file.toLowerCase().endsWith(".pdf")) return null;
  const name = file.split("/").pop()?.replace(/\.pdf$/i, "") ?? "";
  if (name === "") return null;
  const rel = `sertifikat/thumbs/${name}.webp`;
  return existsSync(join(process.cwd(), "public", rel)) ? `/${rel}` : null;
}
