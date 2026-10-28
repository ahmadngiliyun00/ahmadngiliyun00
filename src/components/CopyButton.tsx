"use client";

import { useEffect, useState } from "react";
import { toast } from "@/components/Toaster";

// Tombol salin teks ke clipboard, dengan pengumuman untuk pembaca layar.
export default function CopyButton({
  text,
  label,
  copied,
  failed,
  describedBy,
}: {
  text: string;
  label: string;
  copied: string;
  failed: string;
  describedBy?: string;
}) {
  const [state, setState] = useState<"idle" | "done">("idle");

  useEffect(() => {
    if (state === "idle") return;
    const id = window.setTimeout(() => setState("idle"), 2400);
    return () => window.clearTimeout(id);
  }, [state]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setState("done");
    } catch {
      setState("idle");
      toast(failed, "error");
    }
  };

  return (
    <>
      <button type="button" className="btn btn-line btn-small" onClick={onCopy} aria-describedby={describedBy}>
        {state === "done" ? copied : label}
      </button>
      <span className="sr-only" aria-live="polite">
        {state === "done" ? copied : ""}
      </span>
    </>
  );
}
