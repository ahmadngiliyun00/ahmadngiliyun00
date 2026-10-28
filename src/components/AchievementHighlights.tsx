"use client";

import { useId, useState } from "react";
import CredCard, { type CredCardLabels } from "@/components/CredCard";
import Spotlight from "@/components/Spotlight";
import type { AchievementCard } from "@/lib/achievements";

export type HighlightGroup = { key: string; label: string; items: AchievementCard[] };

// Sorotan capaian di beranda dengan saringan ringan per kelompok.
// Tanpa JavaScript, kelompok pertama tetap tampil dan arsip lengkap tetap bisa dibuka.
export default function AchievementHighlights({
  groups,
  filterLabel,
  labels,
}: {
  groups: HighlightGroup[];
  filterLabel: string;
  labels: CredCardLabels;
}) {
  const uid = useId();
  const [active, setActive] = useState(groups[0]?.key ?? "");
  const current = groups.find((g) => g.key === active) ?? groups[0];
  if (current === undefined) return null;

  return (
    <div>
      <div className="filter-row" role="group" aria-labelledby={`${uid}-label`}>
        <span id={`${uid}-label`} className="text-sm text-muted">
          {filterLabel}
        </span>
        {groups.map((g) => (
          <button
            key={g.key}
            type="button"
            className="filter-chip"
            aria-pressed={g.key === current.key}
            aria-controls={`${uid}-list`}
            onClick={() => setActive(g.key)}
          >
            {g.label}
            <span className="filter-count">{g.items.length}</span>
          </button>
        ))}
      </div>
      <Spotlight className="mt-6">
        <ul id={`${uid}-list`} className="cred-grid">
          {current.items.map((item) => (
            <li key={item.id}>
              <CredCard item={item} labels={labels} />
            </li>
          ))}
        </ul>
      </Spotlight>
    </div>
  );
}
