"use client";

import { useEffect, useRef } from "react";
import { toast, type ToastKind } from "@/components/Toaster";

// Menampilkan toast dari halaman server, misalnya setelah redirect dengan ?deleted=1.
// Parameter di clear dibuang dari alamat (tanpa memuat ulang) supaya toast tidak muncul lagi
// saat halaman dimuat ulang; set mengganti parameter lain bila perlu.
export default function FlashToast({
  message,
  kind = "success",
  clear,
  set,
}: {
  message: string;
  kind?: ToastKind;
  clear: string[];
  set?: Record<string, string>;
}) {
  const shown = useRef(false);
  useEffect(() => {
    if (shown.current) return;
    shown.current = true;
    toast(message, kind);
    const url = new URL(window.location.href);
    for (const k of clear) url.searchParams.delete(k);
    for (const [k, v] of Object.entries(set ?? {})) url.searchParams.set(k, v);
    window.history.replaceState(null, "", url);
  }, [message, kind, clear, set]);
  return null;
}
