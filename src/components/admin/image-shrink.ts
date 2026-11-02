// Gambar diperkecil di browser sebelum diunggah: lebar maksimal 1600 px, WebP (atau JPEG di
// browser yang tidak bisa membuat WebP). Foto ponsel 4 MB biasanya menjadi 200 sampai 400 KB.
// Dipakai editor rich text dan isian galeri. Hanya berjalan di browser.

export const MAX_WIDTH = 1600;
const KEEP_BELOW = 400 * 1024;

// Kanvas menjadi berkas gambar: WebP bila didukung, kalau tidak JPEG.
export async function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  const encode = (type: string) => new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.85));
  const webp = await encode("image/webp");
  return webp?.type === "image/webp" ? webp : await encode("image/jpeg");
}

export async function shrink(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_WIDTH / bitmap.width);
  if (scale === 1) {
    if (file.size <= KEEP_BELOW) return file;
  }
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await canvasToBlob(canvas);
  if (blob === null) return file;
  return blob.size < file.size ? blob : file;
}
