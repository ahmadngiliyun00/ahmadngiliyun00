"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import type { Cell } from "@/lib/github";

type Tip = { text: string; x: number; y: number } | null;

export default function ContributionGraph({
  weeks,
  months,
  weekdays,
  summary,
  less,
  more,
  tooltip,
  dateLocale,
}: {
  weeks: Cell[][];
  months: { col: number; label: string }[];
  weekdays: [string, string, string];
  summary: string;
  less: string;
  more: string;
  tooltip: { none: string; one: string; many: string };
  dateLocale: string;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [tip, setTip] = useState<Tip>(null);
  const [state, setState] = useState<"static" | "waiting" | "in">("static");

  useEffect(() => {
    const scroller = scrollRef.current;
    // Di layar sempit, tampilkan minggu-minggu terbaru lebih dulu.
    if (scroller) scroller.scrollLeft = scroller.scrollWidth;

    const wrap = wrapRef.current;
    if (wrap === null) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (wrap.getBoundingClientRect().top < window.innerHeight * 0.85) return;

    setState("waiting");
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setState("in");
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(wrap);
    return () => io.disconnect();
  }, []);

  const fmt = new Intl.DateTimeFormat(dateLocale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  const onOver = (e: PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const date = target.dataset.date;
    const wrap = wrapRef.current;
    if (!date) {
      setTip(null);
      return;
    }
    if (wrap === null) return;
    const count = Number(target.dataset.count);
    const label = fmt.format(new Date(`${date}T00:00:00Z`));
    const template = count === 0 ? tooltip.none : count === 1 ? tooltip.one : tooltip.many;
    const r = target.getBoundingClientRect();
    const w = wrap.getBoundingClientRect();
    setTip({
      text: template.replace("{n}", String(count)).replace("{date}", label),
      x: r.left - w.left + r.width / 2,
      y: r.top - w.top,
    });
  };

  return (
    <div ref={wrapRef} className="relative">
      <div
        ref={scrollRef}
        className="contrib-scroll"
        role="img"
        aria-label={summary}
        onPointerOver={onOver}
        onPointerLeave={() => setTip(null)}
      >
        <div className="contrib" data-state={state}>
          <div className="contrib-months" aria-hidden="true">
            {months.map((m) => (
              <span key={`${m.col}-${m.label}`} style={{ gridColumnStart: m.col + 1 }}>
                {m.label}
              </span>
            ))}
          </div>
          <div className="contrib-days" aria-hidden="true">
            <span />
            <span>{weekdays[0]}</span>
            <span />
            <span>{weekdays[1]}</span>
            <span />
            <span>{weekdays[2]}</span>
            <span />
          </div>
          <div className="contrib-grid" aria-hidden="true">
            {weeks.map((week, col) =>
              week.map((cell, row) =>
                cell === null ? (
                  <span key={`${col}-${row}`} className="contrib-cell is-empty" />
                ) : (
                  <span
                    key={cell.date}
                    className="contrib-cell"
                    data-level={cell.level}
                    data-date={cell.date}
                    data-count={cell.count}
                    style={{ "--c": col, "--r": row } as CSSProperties}
                  />
                ),
              ),
            )}
          </div>
        </div>
      </div>

      <div className="contrib-legend" aria-hidden="true">
        <span>{less}</span>
        {[0, 1, 2, 3, 4].map((l) => (
          <span key={l} className="contrib-cell" data-level={l} />
        ))}
        <span>{more}</span>
      </div>

      {tip === null ? null : (
        <div
          className="contrib-tip"
          style={{ left: tip.x, top: tip.y } as CSSProperties}
          aria-hidden="true"
        >
          {tip.text}
        </div>
      )}
    </div>
  );
}
