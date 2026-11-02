"use client";

import { useEffect, useRef } from "react";

// Isi tulisan (HTML dari editor rich text, sudah dibersihkan renderRichText di server) dengan
// placeholder skeleton untuk setiap gambar di dalamnya. HTML-nya tetap dirender di server, jadi
// isi terbaca mesin pencari dan tanpa JavaScript. Setelah terpasang, gambar yang belum selesai
// diunduh diberi data-state="loading" (kilau di latar gambar itu sendiri, lihat .post-body img di
// globals.css), lalu ditandai selesai saat terbaca atau gagal.
export default function PostBody({ html, className }: { html: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const cleanups: (() => void)[] = [];
    root.querySelectorAll("img").forEach((img) => {
      if (img.complete) {
        if (img.naturalWidth > 0) return;
      }
      img.dataset.state = "loading";
      const done = () => {
        img.dataset.state = img.naturalWidth > 0 ? "loaded" : "error";
      };
      img.addEventListener("load", done, { once: true });
      img.addEventListener("error", done, { once: true });
      cleanups.push(() => {
        img.removeEventListener("load", done);
        img.removeEventListener("error", done);
      });
    });
    return () => cleanups.forEach((fn) => fn());
  }, [html]);

  return <div ref={ref} className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
