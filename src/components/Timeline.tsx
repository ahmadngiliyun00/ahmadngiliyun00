"use client";

import { useEffect, useRef, useState } from "react";

export type TimelineItem = { when: string; title: string; body: string; current?: boolean };

// Garis waktu yang terisi mengikuti posisi gulir. Titik menyala saat dilewati.
export default function Timeline({ items }: { items: TimelineItem[] }) {
  const listRef = useRef<HTMLOListElement | null>(null);
  const [reached, setReached] = useState(items.length);

  useEffect(() => {
    const list = listRef.current;
    if (list === null) return;
    let raf = 0;

    const update = () => {
      raf = 0;
      const rect = list.getBoundingClientRect();
      const anchor = window.innerHeight * 0.62;
      const p = Math.min(1, Math.max(0, (anchor - rect.top) / rect.height));
      list.style.setProperty("--p", String(p));
      const dots = list.querySelectorAll<HTMLElement>("[data-dot]");
      let n = 0;
      dots.forEach((d) => {
        if (d.getBoundingClientRect().top < anchor) n += 1;
      });
      setReached(n);
    };
    const onScroll = () => {
      if (raf === 0) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const shown = items[Math.max(0, reached - 1)];

  return (
    <div className="journey">
      <div className="journey-year" aria-hidden="true">
        <span
          key={shown.when}
          className="journey-year-text"
          data-current={shown.current ? "true" : undefined}
        >
          {shown.when}
        </span>
        <p className="journey-year-caption">{shown.title}</p>
      </div>
    <ol ref={listRef} className="timeline">
      {items.map((item, i) => (
        <li
          key={item.title}
          className="timeline-item"
          data-reached={i < reached ? "true" : "false"}
          data-current={item.current ? "true" : undefined}
        >
          <span className="timeline-dot" data-dot aria-hidden="true" />
          <p className="timeline-when">{item.when}</p>
          <h3 className="font-display text-xl font-bold tracking-tight sm:text-2xl">{item.title}</h3>
          <p className="mt-2 max-w-[56ch] text-muted">{item.body}</p>
        </li>
      ))}
    </ol>
    </div>
  );
}
