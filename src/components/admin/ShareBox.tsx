"use client";

import { useState, useTransition } from "react";
import { createShareAction, revokeShareAction } from "@/app/(admin)/admin/actions";

export type ShareLabels = {
  title: string;
  intro: string;
  create: string;
  replace: string;
  revoke: string;
  active: string;
  none: string;
  copy: string;
  copied: string;
  once: string;
  publicNote: string;
};

// Kelola tautan berbagi rahasia untuk satu data. Token hanya terlihat sekali, saat dibuat.
export default function ShareBox({
  id,
  active,
  siteUrl,
  publicUrl,
  labels,
}: {
  id: number;
  active: boolean;
  siteUrl: string;
  publicUrl: string | null;
  labels: ShareLabels;
}) {
  const [isActive, setActive] = useState(active);
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [pending, start] = useTransition();

  const create = () =>
    start(async () => {
      const { token } = await createShareAction(id);
      setLink(`${siteUrl}/s/${token}/`);
      setActive(true);
      setCopied(false);
    });
  const revoke = () =>
    start(async () => {
      await revokeShareAction(id);
      setLink("");
      setActive(false);
    });
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="admin-card" aria-labelledby="share-title">
      <h2 id="share-title" className="font-display text-lg font-bold tracking-tight">
        {labels.title}
      </h2>
      <p className="mt-2 text-sm text-muted">{labels.intro}</p>
      {publicUrl ? (
        <p className="mt-3 text-sm text-muted">
          {labels.publicNote}{" "}
          <a href={publicUrl} className="link" target="_blank" rel="noopener noreferrer">
            {publicUrl}
          </a>
        </p>
      ) : null}

      {link !== "" ? (
        <div className="mt-4 grid gap-2">
          <input readOnly value={link} className="field" aria-label={labels.title} onFocus={(e) => e.currentTarget.select()} />
          <p className="text-sm text-[#ffd27a]">{labels.once}</p>
          <div>
            <button type="button" className="btn btn-line btn-small" onClick={copy}>
              {copied ? labels.copied : labels.copy}
            </button>
            <span className="sr-only" aria-live="polite">
              {copied ? labels.copied : ""}
            </span>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm">{isActive ? labels.active : labels.none}</p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className="btn btn-line btn-small" onClick={create} disabled={pending}>
          {isActive ? labels.replace : labels.create}
        </button>
        {isActive ? (
          <button type="button" className="btn btn-line btn-small admin-danger" onClick={revoke} disabled={pending}>
            {labels.revoke}
          </button>
        ) : null}
      </div>
    </section>
  );
}
