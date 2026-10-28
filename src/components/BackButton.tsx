"use client";

import type { ReactNode } from "react";

// Tombol kembali di halaman error: ke halaman sebelumnya bila datang dari situs ini,
// kalau tidak (misalnya tautan dibuka langsung dari luar) ke fallback, biasanya beranda.
export default function BackButton({
  fallback,
  className,
  children,
}: {
  fallback: string;
  className?: string;
  children: ReactNode;
}) {
  const goBack = () => {
    let sameSite = false;
    try {
      sameSite = document.referrer !== "" ? new URL(document.referrer).origin === window.location.origin : false;
    } catch {
      sameSite = false;
    }
    if (sameSite ? window.history.length > 1 : false) window.history.back();
    else window.location.href = fallback;
  };
  return (
    <button type="button" className={className} onClick={goBack}>
      {children}
    </button>
  );
}
