// Memecah PDF menjadi satu gambar per halaman, di browser, untuk isian galeri. Cocok untuk
// dokumen carousel LinkedIn: setiap halaman menjadi satu slide. pdf.js dimuat hanya saat ada PDF,
// jadi tidak membebani halaman CMS lain. Worker pdf.js disajikan dari situs sendiri (CSP 'self').

import { canvasToBlob, MAX_WIDTH } from "@/components/admin/image-shrink";

type PdfJs = typeof import("pdfjs-dist");

let loading: Promise<PdfJs> | null = null;

function loadPdfJs(): Promise<PdfJs> {
  loading ??= import("pdfjs-dist").then((pdfjs) => {
    if (pdfjs.GlobalWorkerOptions.workerPort === null) {
      pdfjs.GlobalWorkerOptions.workerPort = new Worker(new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url), {
        type: "module",
      });
    }
    return pdfjs;
  });
  return loading;
}

// Muat pdf.js lebih awal (misalnya saat kursor atau berkas mendekati area unggah), supaya
// saat PDF dijatuhkan tidak ada jeda unduh pustaka yang terasa seperti tidak terjadi apa-apa.
export function preloadPdfJs(): void {
  void loadPdfJs().catch(() => {
    loading = null;
  });
}

// onOpen dipanggil sebelum PDF dibuka, onPage sebelum setiap halaman digambar (pesan kemajuan).
// limit = paling banyak halaman yang diambil, sisanya dilewati.
export async function pdfToImages(
  file: File,
  limit: number,
  onPage?: (page: number, pages: number) => void,
  onOpen?: () => void,
): Promise<{ files: File[]; pages: number }> {
  const pdfjs = await loadPdfJs();
  onOpen?.();
  const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
  const doc = await task.promise;
  const base = file.name.replace(/\.pdf$/i, "");
  const out: File[] = [];
  try {
    const total = Math.min(doc.numPages, limit);
    for (let n = 1; n <= total; n++) {
      onPage?.(n, doc.numPages);
      const page = await doc.getPage(n);
      const unit = page.getViewport({ scale: 1 });
      // Lebar sekitar 1600 px, tetapi PDF kecil tidak diperbesar lebih dari 3 kali.
      const viewport = page.getViewport({ scale: Math.min(3, MAX_WIDTH / unit.width) });
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(viewport.width);
      canvas.height = Math.round(viewport.height);
      // Halaman PDF tanpa latar menjadi putih, bukan transparan.
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      await page.render({ canvas, viewport }).promise;
      page.cleanup();
      const blob = await canvasToBlob(canvas);
      if (blob === null) throw new Error("canvas");
      const ext = blob.type === "image/webp" ? "webp" : "jpg";
      out.push(new File([blob], `${base}-hal-${n}.${ext}`, { type: blob.type }));
    }
    return { files: out, pages: doc.numPages };
  } finally {
    // Worker bersama (workerPort) tidak ikut dimatikan, hanya dokumen ini yang dilepas.
    await task.destroy();
  }
}
