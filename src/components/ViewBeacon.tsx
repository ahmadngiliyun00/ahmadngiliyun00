"use client";

import { useEffect, useRef } from "react";

// Mengirim satu kunjungan setelah halaman tulisan benar-benar terlihat selama 2 detik,
// sehingga prefetch, tab latar, dan pengunjung yang langsung pergi tidak terhitung.
// Parameter ?src= dari tombol bagikan dibuang dari alamat setelah dicatat.
export default function ViewBeacon({ slug, lang }: { slug: string; lang: "id" | "en" }) {
  const sent = useRef(false);

  useEffect(() => {
    let timer: number | undefined;
    const send = () => {
      if (sent.current) return;
      sent.current = true;
      const url = new URL(window.location.href);
      const src = url.searchParams.get("src") ?? "";
      void fetch("/api/views/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, lang, src, ref: document.referrer }),
        keepalive: true,
      }).catch(() => {});
      if (src !== "") {
        url.searchParams.delete("src");
        window.history.replaceState(null, "", url);
      }
    };
    const arm = () => {
      if (document.visibilityState !== "visible") return;
      window.clearTimeout(timer);
      timer = window.setTimeout(send, 2000);
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") arm();
      else window.clearTimeout(timer);
    };
    arm();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [slug, lang]);

  return null;
}
