"use client";

import { useState, type IframeHTMLAttributes } from "react";

// Iframe (misalnya pratinjau berkas Google Drive) dengan placeholder skeleton yang sama seperti
// LazyImage: kilau bergerak di latar bingkai sampai isi iframe selesai dimuat. Selama memuat,
// latar iframe transparan supaya kilau terlihat; isi Drive yang sudah tampil menutupinya sendiri,
// jadi aman bila event load terlewat sebelum React terpasang.
export default function LazyIframe({
  frameClassName,
  onLoad,
  loading = "lazy",
  ...frame
}: IframeHTMLAttributes<HTMLIFrameElement> & { frameClassName?: string }) {
  const [state, setState] = useState<"loading" | "loaded">("loading");
  return (
    <span className={frameClassName ? `lazy-frame ${frameClassName}` : "lazy-frame"} data-state={state} data-fit="natural">
      <iframe
        loading={loading}
        {...frame}
        onLoad={(e) => {
          setState("loaded");
          onLoad?.(e);
        }}
      />
    </span>
  );
}
