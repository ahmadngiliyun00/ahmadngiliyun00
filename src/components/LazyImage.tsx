"use client";

import { useEffect, useRef, useState, type ImgHTMLAttributes, type SyntheticEvent } from "react";

// Gambar situs dengan placeholder skeleton: selama gambar diunduh, bingkainya menampilkan blok
// abu-abu dengan kilau yang bergerak ke kanan, lalu gambar muncul perlahan setelah selesai.
// - loading="lazy" bawaan: gambar di luar layar baru diunduh saat mendekati layar.
// - Kilau ada di latar bingkai, di belakang gambar: tanpa JavaScript pun gambar tetap tampil
//   dan menutupi kilaunya sendiri begitu terbaca.
// - Gambar yang sudah selesai sebelum React terpasang (cache) langsung tampil tanpa efek.
// - Gagal dimuat: kilau berhenti, bingkai tetap tenang (tanpa ikon rusak).
// - prefers-reduced-motion: tanpa kilau bergerak dan tanpa efek muncul perlahan (globals.css).
// Bingkai (.lazy-frame) mengisi wadahnya; tinggi diatur wadah, atau rasio cadangan 4:3 untuk
// gambar yang tingginya mengikuti isi (lihat .lazy-frame[data-fit="natural"]).

// loaded = selesai diunduh setelah halaman tampil (muncul perlahan); ready = sudah ada sebelum
// React terpasang, misalnya dari cache (langsung tampil tanpa efek, supaya tidak berkedip).
type State = "loading" | "loaded" | "ready" | "error";

export default function LazyImage({
  frameClassName,
  fit = "fill",
  onLoad,
  onError,
  loading = "lazy",
  decoding = "async",
  ...img
}: ImgHTMLAttributes<HTMLImageElement> & {
  frameClassName?: string;
  // fill: bingkai setinggi wadahnya (kartu berasio tetap). natural: tinggi mengikuti gambar.
  fit?: "fill" | "natural";
}) {
  const ref = useRef<HTMLImageElement>(null);
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.complete) setState(el.naturalWidth > 0 ? "ready" : "error");
  }, []);

  function handleLoad(e: SyntheticEvent<HTMLImageElement, Event>) {
    setState("loaded");
    onLoad?.(e);
  }

  function handleError(e: SyntheticEvent<HTMLImageElement, Event>) {
    setState("error");
    onError?.(e);
  }

  return (
    <span className={frameClassName ? `lazy-frame ${frameClassName}` : "lazy-frame"} data-state={state} data-fit={fit}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={ref} loading={loading} decoding={decoding} {...img} onLoad={handleLoad} onError={handleError} />
    </span>
  );
}
