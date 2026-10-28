"use client";

import { useEffect, useRef } from "react";
import Wordmark from "@/components/Wordmark";

// Wordmark besar di dasar footer: garis tepi sebagai dasar, dan lapisan gradasi yang hanya
// terlihat dalam lingkaran di sekitar kursor (mask radial dengan posisi dari variabel CSS).
// Kursor dilacak di seluruh footer. Dengan "kurangi gerakan" atau tanpa kursor, sorotan diam
// di posisi bawaan.
export default function WordmarkSpotlight() {
  const reveal = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = reveal.current;
    const footer = layer?.closest("footer");
    if (!layer || !footer) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const move = (e: PointerEvent) => {
      const r = layer.getBoundingClientRect();
      layer.style.setProperty("--mx", `${e.clientX - r.left}px`);
      layer.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    const leave = () => {
      layer.style.removeProperty("--mx");
      layer.style.removeProperty("--my");
    };
    footer.addEventListener("pointermove", move);
    footer.addEventListener("pointerleave", leave);
    return () => {
      footer.removeEventListener("pointermove", move);
      footer.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <div className="footer-wordmark" aria-hidden="true">
      <Wordmark variant="outline" />
      <div ref={reveal} className="footer-wordmark-reveal">
        <Wordmark variant="gradient" />
      </div>
    </div>
  );
}
