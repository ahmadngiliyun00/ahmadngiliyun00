"use client";

import { useEffect, useRef, useState } from "react";
import type { Lang } from "@/data/profile";

// Angka yang menghitung naik saat pertama kali terlihat.
// HTML statis langsung berisi angka akhir, jadi tetap benar tanpa JavaScript.
export default function CountUp({
  value,
  lang,
  className,
}: {
  value: number;
  lang: Lang;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [shown, setShown] = useState(value);
  const fmt = new Intl.NumberFormat(lang === "id" ? "id-ID" : "en-US");

  useEffect(() => {
    const el = ref.current;
    if (el === null) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    setShown(0);
    let raf = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        const start = performance.now();
        const duration = 1400;
        const step = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          setShown(Math.round(value * eased));
          if (t < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value]);

  return (
    <span ref={ref} className={className}>
      <span aria-hidden="true" className="tabular-nums">
        {fmt.format(shown)}
      </span>
      <span className="sr-only">{fmt.format(value)}</span>
    </span>
  );
}
