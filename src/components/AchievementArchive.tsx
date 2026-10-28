"use client";

import { useEffect, useId, useMemo, useState } from "react";
import CredCard, { type CredCardLabels } from "@/components/CredCard";
import Spotlight from "@/components/Spotlight";
import type { AchievementCard } from "@/lib/achievements";

export type ArchiveLabels = {
  searchLabel: string;
  searchPlaceholder: string;
  kindLabel: string;
  all: string;
  yearLabel: string;
  allYears: string;
  resultsOne: string;
  resultsMany: string;
  empty: string;
  reset: string;
};

// Arsip capaian: pencarian, saringan kategori, dan saringan tahun, seluruhnya di sisi klien.
// Saringan disimpan di URL (?kategori=hki, ?tahun=2026, ?q=python) supaya bisa dibagikan.
export default function AchievementArchive({
  items,
  kinds,
  years,
  labels,
  cardLabels,
}: {
  items: AchievementCard[];
  kinds: { kind: string; label: string; count: number }[];
  years: number[];
  labels: ArchiveLabels;
  cardLabels: CredCardLabels;
}) {
  const uid = useId();
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const [year, setYear] = useState("all");

  // Baca saringan awal dari URL setelah halaman statis dimuat.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const k = params.get("kategori");
    if (k !== null) {
      if (kinds.some((x) => x.kind === k)) setKind(k);
    }
    const y = params.get("tahun");
    if (y !== null) {
      if (years.includes(Number(y))) setYear(y);
    }
    const q = params.get("q");
    if (q !== null) setQuery(q);
  }, [kinds, years]);

  // Tulis saringan ke URL tanpa memuat ulang halaman.
  useEffect(() => {
    const params = new URLSearchParams();
    if (kind !== "all") params.set("kategori", kind);
    if (year !== "all") params.set("tahun", year);
    if (query.trim() !== "") params.set("q", query.trim());
    const search = params.toString();
    const next = search === "" ? window.location.pathname : `${window.location.pathname}?${search}`;
    window.history.replaceState(null, "", next);
  }, [kind, year, query]);

  const shown = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter((w) => w !== "");
    return items
      .filter((item) => (kind === "all" ? true : item.kind === kind))
      .filter((item) => (year === "all" ? true : item.year === Number(year)))
      .filter((item) => words.every((w) => item.search.includes(w)));
  }, [items, kind, year, query]);

  const filtered = kind !== "all" ? true : year !== "all" ? true : query.trim() !== "";
  const resultText = shown.length === 1 ? labels.resultsOne : labels.resultsMany.replace("{n}", String(shown.length));

  const reset = () => {
    setKind("all");
    setYear("all");
    setQuery("");
  };

  return (
    <div>
      <div className="archive-controls">
        <div className="grid gap-2">
          <label htmlFor={`${uid}-q`} className="text-sm text-muted">
            {labels.searchLabel}
          </label>
          <input
            id={`${uid}-q`}
            type="search"
            className="field"
            placeholder={labels.searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-describedby={`${uid}-count`}
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor={`${uid}-year`} className="text-sm text-muted">
            {labels.yearLabel}
          </label>
          <select id={`${uid}-year`} className="field" value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="all">{labels.allYears}</option>
            {years.map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="filter-row mt-5" role="group" aria-labelledby={`${uid}-kind`}>
        <span id={`${uid}-kind`} className="text-sm text-muted">
          {labels.kindLabel}
        </span>
        <button type="button" className="filter-chip" aria-pressed={kind === "all"} onClick={() => setKind("all")}>
          {labels.all}
          <span className="filter-count">{items.length}</span>
        </button>
        {kinds.map((k) => (
          <button
            key={k.kind}
            type="button"
            className="filter-chip"
            aria-pressed={kind === k.kind}
            onClick={() => setKind(k.kind)}
          >
            {k.label}
            <span className="filter-count">{k.count}</span>
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
        <p id={`${uid}-count`} className="text-sm text-muted" aria-live="polite">
          {resultText}
        </p>
        {filtered ? (
          <button type="button" className="link text-sm" onClick={reset}>
            {labels.reset}
          </button>
        ) : null}
      </div>

      {shown.length === 0 ? (
        <p className="archive-empty">{labels.empty}</p>
      ) : (
        <Spotlight className="mt-6">
          <ul className="cred-grid">
            {shown.map((item) => (
              <li key={item.id}>
                <CredCard item={item} labels={cardLabels} />
              </li>
            ))}
          </ul>
        </Spotlight>
      )}
    </div>
  );
}
