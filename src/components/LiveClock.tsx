"use client";

import { useEffect, useState } from "react";
import type { Lang } from "@/data/profile";

// Jam lokal Cirebon. Di server dirender "--.--" lalu diisi setelah halaman aktif,
// supaya HTML statis tidak menyimpan jam saat build.
export function useLocalTime(lang: Lang, timeZone: string) {
  const [text, setText] = useState("--.--");

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat(lang === "id" ? "id-ID" : "en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone,
    });
    const tick = () => setText(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 15000);
    return () => window.clearInterval(id);
  }, [lang, timeZone]);

  return text;
}

export default function LiveClock({
  lang,
  timeZone,
  zoneLabel,
  className,
}: {
  lang: Lang;
  timeZone: string;
  zoneLabel: string;
  className?: string;
}) {
  const text = useLocalTime(lang, timeZone);
  return (
    <span className={className}>
      <span className="tabular-nums">{text}</span> {zoneLabel}
    </span>
  );
}
