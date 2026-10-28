"use client";

import { useEffect, useState } from "react";
import CopyButton from "@/components/CopyButton";
import type { ShareSource } from "@/lib/views";

export type ShareLabels = { title: string; copy: string; copied: string; copyFailed: string; native: string; newTab: string };

const TARGETS: { key: ShareSource; label: string; build: (url: string, title: string) => string }[] = [
  { key: "whatsapp", label: "WhatsApp", build: (url, title) => `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}` },
  { key: "facebook", label: "Facebook", build: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
  {
    key: "x",
    label: "X",
    build: (url, title) => {
      const u = new URL("https://x.com/intent/post");
      u.searchParams.set("url", url);
      u.searchParams.set("text", title);
      return u.toString();
    },
  },
  { key: "linkedin", label: "LinkedIn", build: (url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
  {
    key: "telegram",
    label: "Telegram",
    build: (url, title) => {
      const u = new URL("https://t.me/share/url");
      u.searchParams.set("url", url);
      u.searchParams.set("text", title);
      return u.toString();
    },
  },
];

// Alamat yang dibagikan membawa ?src=<media> supaya asal pembaca tetap tercatat,
// karena aplikasi seperti WhatsApp tidak mengirim Referer.
function tagged(url: string, src: string): string {
  const u = new URL(url);
  u.searchParams.set("src", src);
  return u.toString();
}

// Tombol bagikan di halaman tulisan. Tanpa ikon, sesuai gaya situs publik.
export default function ShareButtons({ url, title, labels }: { url: string; title: string; labels: ShareLabels }) {
  const [native, setNative] = useState(false);
  useEffect(() => {
    setNative(typeof navigator.share === "function");
  }, []);

  return (
    <section className="share" aria-labelledby="share-title">
      <h2 id="share-title" className="share-title">
        {labels.title}
      </h2>
      <ul className="share-list">
        {TARGETS.map((s) => (
          <li key={s.key}>
            <a href={s.build(tagged(url, s.key), title)} target="_blank" rel="noopener noreferrer" className="btn btn-line btn-small">
              {s.label}
              <span className="sr-only"> ({labels.newTab})</span>
            </a>
          </li>
        ))}
        <li>
          <CopyButton text={url} label={labels.copy} copied={labels.copied} failed={labels.copyFailed} />
        </li>
        {native ? (
          <li>
            <button
              type="button"
              className="btn btn-line btn-small"
              onClick={() => {
                navigator.share({ title, url }).catch(() => {});
              }}
            >
              {labels.native}
            </button>
          </li>
        ) : null}
      </ul>
    </section>
  );
}
