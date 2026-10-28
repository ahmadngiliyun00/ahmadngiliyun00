"use client";

import { useCallback, useEffect, useRef } from "react";

// Cloudflare Turnstile (anti robot) untuk form publik: kontak dan komentar. Hanya dimuat bila
// kunci situs diatur. Widget menambahkan isian cf-turnstile-response ke form; servernya
// diperiksa oleh verifyTurnstile() di src/server/turnstile.ts.

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
const SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type Turnstile = {
  render: (el: HTMLElement, opts: { sitekey: string; theme: "dark"; language: string }) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
};
interface TurnstileWindow extends Window {
  turnstile?: Turnstile;
}

// active = false melepas widget (misalnya setelah pesan terkirim dan form disembunyikan).
// reset() meminta token baru setelah setiap kiriman, karena token hanya berlaku sekali.
export function useTurnstile(lang: string, active = true) {
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  useEffect(() => {
    if (SITE_KEY === "") return;
    if (!active) return;
    let cancelled = false;
    const mount = () => {
      const ts = (window as TurnstileWindow).turnstile;
      if (cancelled) return;
      if (!ts) return;
      if (!widgetRef.current) return;
      if (widgetId.current) return;
      widgetId.current = ts.render(widgetRef.current, { sitekey: SITE_KEY, theme: "dark", language: lang });
    };
    const existing = document.querySelector<HTMLScriptElement>("script[data-turnstile]");
    if ((window as TurnstileWindow).turnstile) mount();
    else if (existing) existing.addEventListener("load", mount);
    else {
      const s = document.createElement("script");
      s.src = SRC;
      s.async = true;
      s.dataset.turnstile = "1";
      s.addEventListener("load", mount);
      document.head.appendChild(s);
    }
    return () => {
      cancelled = true;
      existing?.removeEventListener("load", mount);
      const ts = (window as TurnstileWindow).turnstile;
      if (ts) {
        if (widgetId.current) ts.remove(widgetId.current);
      }
      widgetId.current = null;
    };
  }, [lang, active]);

  const reset = useCallback(() => {
    const ts = (window as TurnstileWindow).turnstile;
    if (ts) {
      if (widgetId.current) ts.reset(widgetId.current);
    }
  }, []);

  return { enabled: SITE_KEY !== "", widgetRef, reset };
}
