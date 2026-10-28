"use client";

import { useEffect } from "react";
import type { Lang } from "@/data/profile";
import { LEGACY_ANCHORS, pagePath } from "@/lib/nav";

// Tautan lama ke bagian beranda yang kini punya halaman sendiri (misalnya /#research atau
// /en/#teaching) dialihkan ke halaman barunya, supaya tautan yang sudah tersebar tetap bekerja.
export default function LegacyAnchors({ lang }: { lang: Lang }) {
  useEffect(() => {
    const follow = () => {
      const moved = LEGACY_ANCHORS[window.location.hash.slice(1)];
      if (moved === undefined) return;
      window.location.replace(`${pagePath(lang, moved.page)}${moved.hash ? `#${moved.hash}` : ""}`);
    };
    follow();
    window.addEventListener("hashchange", follow);
    return () => window.removeEventListener("hashchange", follow);
  }, [lang]);
  return null;
}
