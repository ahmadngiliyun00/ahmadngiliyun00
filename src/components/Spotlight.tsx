"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";

// Cahaya sorot yang mengikuti kursor di atas panel bertanda data-spot.
export default function Spotlight({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const frame = useRef(0);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const x = e.clientX;
    const y = e.clientY;
    if (frame.current !== 0) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const root = ref.current;
      if (root === null) return;
      root.querySelectorAll<HTMLElement>("[data-spot]").forEach((el) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${x - r.left}px`);
        el.style.setProperty("--my", `${y - r.top}px`);
      });
    });
  };

  return (
    <div ref={ref} className={className} onPointerMove={onMove}>
      {children}
    </div>
  );
}
