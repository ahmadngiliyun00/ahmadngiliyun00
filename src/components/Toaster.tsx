"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";

// Notifikasi toast untuk situs dan CMS. Panggil toast("Tersimpan.") dari komponen client mana pun;
// <Toaster /> dipasang sekali di RootShell. Toast hilang sendiri setelah beberapa detik,
// berhenti menghitung saat disorot kursor atau fokus keyboard, dan bisa ditutup manual.

export type ToastKind = "success" | "error" | "info";
type Item = { id: number; kind: ToastKind; message: string; detail: string[]; duration: number };

const DURATION: Record<ToastKind, number> = { success: 4000, info: 5000, error: 8000 };
const MAX_VISIBLE = 4;
const EMPTY: Item[] = [];

let items: Item[] = EMPTY;
let nextId = 1;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function toast(message: string, kind: ToastKind = "success", detail: string[] = []) {
  // Pesan yang sama dan masih tampil tidak ditumpuk (misalnya efek yang berjalan dua kali).
  if (items.some((t) => (t.message === message ? t.kind === kind : false))) return;
  items = [...items, { id: nextId++, kind, message, detail, duration: DURATION[kind] }].slice(-MAX_VISIBLE);
  emit();
}

function dismiss(id: number) {
  items = items.filter((t) => t.id !== id);
  emit();
}

function reducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function ToastItem({ item, closeLabel, moreLabel }: { item: Item; closeLabel: string; moreLabel: string }) {
  const [paused, setPaused] = useState(false);
  const [closing, setClosing] = useState(false);
  const remaining = useRef(item.duration);

  // Tanpa animasi (kurangi gerakan), toast langsung dibuang; selain itu tunggu animasi keluar.
  const close = () => {
    if (reducedMotion()) dismiss(item.id);
    else setClosing(true);
  };

  useEffect(() => {
    if (paused) return;
    if (closing) return;
    const start = Date.now();
    const timer = window.setTimeout(() => {
      if (reducedMotion()) dismiss(item.id);
      else setClosing(true);
    }, remaining.current);
    return () => {
      window.clearTimeout(timer);
      remaining.current -= Date.now() - start;
    };
  }, [paused, closing, item.id]);

  const shown = item.detail.slice(0, 4);
  const more = item.detail.length - shown.length;

  return (
    <div
      className="toast"
      data-kind={item.kind}
      data-paused={paused ? "" : undefined}
      data-closing={closing ? "" : undefined}
      role={item.kind === "error" ? "alert" : "status"}
      style={{ "--toast-ms": `${item.duration}ms` } as CSSProperties}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false);
      }}
      onAnimationEnd={(e) => {
        if (e.animationName === "toast-out") dismiss(item.id);
      }}
    >
      <div className="toast-body">
        <p className="toast-message">{item.message}</p>
        {shown.length > 0 ? (
          <ul className="toast-detail">
            {shown.map((d) => (
              <li key={d}>{d}</li>
            ))}
            {more > 0 ? <li>{moreLabel.replace("{n}", String(more))}</li> : null}
          </ul>
        ) : null}
      </div>
      <button type="button" className="toast-close" aria-label={closeLabel} onClick={close}>
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
          <path d="M3.5 3.5l9 9m0-9l-9 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
      <span className="toast-timer" aria-hidden="true" />
    </div>
  );
}

export default function Toaster({ closeLabel, moreLabel }: { closeLabel: string; moreLabel: string }) {
  const list = useSyncExternalStore(subscribe, () => items, () => EMPTY);
  // Wadah aria-live selalu ada di DOM supaya toast baru dibacakan pembaca layar.
  return (
    <div className="toast-region" aria-live="polite">
      {list.map((item) => (
        <ToastItem key={item.id} item={item} closeLabel={closeLabel} moreLabel={moreLabel} />
      ))}
    </div>
  );
}
