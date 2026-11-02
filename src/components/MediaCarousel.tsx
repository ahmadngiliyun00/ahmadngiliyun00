"use client";

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent, type SyntheticEvent } from "react";
import { SLIDE_MS, wrapIndex } from "@/lib/gallery";

// Carousel gambar untuk kartu kabar, kartu media sosial, dan halaman tulisan.
// - Geser (swipe) memakai scroll-snap bawaan peramban, jadi terasa alami di ponsel.
// - Berganti otomatis tiap SLIDE_MS, berhenti sementara saat kursor di atasnya, saat ada fokus
//   keyboard di dalamnya, saat tidak terlihat di layar, atau saat tab peramban tidak aktif.
// - Tombol jeda dan putar selalu ada (WCAG 2.2.2). prefers-reduced-motion: tidak berputar sendiri
//   dan perpindahan tanpa animasi.
// - Indikator titik dan penghitung "2 / 5" menunjukkan jumlah gambar. Panah kiri dan kanan di
//   keyboard juga berfungsi saat carousel difokus.
// Satu gambar saja tampil sebagai gambar biasa tanpa kontrol.

export type CarouselImage = { src: string; alt: string };

export type CarouselLabels = {
  label: string;
  slide: string;
  image: string;
  prev: string;
  next: string;
  goTo: string;
  pause: string;
  play: string;
};

function fill(text: string, n: number, total: number): string {
  return text.replace("{n}", String(n)).replace("{total}", String(total));
}

// Mode natural: rasio tinggi gambar pertama menentukan tinggi carousel, dibatasi supaya kartu tidak terlalu
// tinggi (potret 4:5) atau terlalu pipih (16:9). Gambar lain ditampilkan utuh (contain).
const MIN_RATIO = 9 / 16;
const MAX_RATIO = 5 / 4;

// Lebih dari ini, titik indikator tidak muat di kartu ponsel; penghitung "3 / 14" tetap tampil.
const DOTS_MAX = 10;

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path
        d={dir === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function MediaCarousel({
  images,
  labels,
  className,
  eager = false,
  natural = false,
}: {
  images: CarouselImage[];
  labels: CarouselLabels;
  className?: string;
  eager?: boolean; // gambar pertama dimuat segera (misalnya di atas halaman tulisan)
  // true: tinggi mengikuti rasio gambar pertama (halaman tulisan). false: rasio dari CSS kartu.
  natural?: boolean;
}) {
  const total = images.length;
  const uid = useId();
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [ratio, setRatio] = useState<number | null>(null);
  const [playing, setPlaying] = useState(true);
  const [hover, setHover] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [reduced, setReduced] = useState(false);

  // Pengguna yang meminta gerak dikurangi: tidak ada putar otomatis maupun animasi geser.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setReduced(mq.matches);
      if (mq.matches) setPlaying(false);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver((list) => setVisible(list.some((e) => e.isIntersecting)), { threshold: 0.4 });
    io.observe(el);
    const onVis = () => setPageVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const go = useCallback(
    (to: number) => {
      const el = track.current;
      if (!el) return;
      const next = wrapIndex(to, total);
      el.scrollTo({ left: next * el.clientWidth, behavior: reduced ? "auto" : "smooth" });
      setIndex(next);
    },
    [total, reduced],
  );

  // Indeks mengikuti posisi gulir, termasuk saat digeser dengan jari atau trackpad.
  function onScroll() {
    const el = track.current;
    if (!el) return;
    if (el.clientWidth === 0) return;
    const at = Math.round(el.scrollLeft / el.clientWidth);
    if (at !== index) setIndex(Math.min(total - 1, Math.max(0, at)));
  }

  // Satu pewaktu per slide: setiap perpindahan (otomatis atau manual) memulai hitungan baru.
  const running = total > 1 ? (playing ? (hover ? false : focused ? false : visible ? pageVisible : false) : false) : false;
  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => go(index + 1), SLIDE_MS);
    return () => window.clearTimeout(timer);
  }, [running, index, go]);

  // Lebar berubah (rotasi layar): tetap di slide yang sama. Hanya bereaksi pada perubahan lebar,
  // supaya animasi geser yang sedang berjalan tidak terpotong.
  const indexRef = useRef(0);
  useEffect(() => {
    indexRef.current = index;
  }, [index]);
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let width = el.clientWidth;
    const ro = new ResizeObserver(() => {
      if (el.clientWidth === width) return;
      width = el.clientWidth;
      el.scrollTo({ left: indexRef.current * width, behavior: "auto" });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(index + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(index - 1);
    }
  }

  function measure(img: HTMLImageElement | null | undefined) {
    if (!natural) return;
    if (!img) return;
    if (img.naturalWidth > 0) setRatio(img.naturalHeight / img.naturalWidth);
  }

  function onFirstLoad(e: SyntheticEvent<HTMLImageElement>) {
    measure(e.currentTarget);
  }

  // Gambar yang sudah dimuat sebelum React terpasang (cache, eager) tidak memicu onLoad lagi.
  useEffect(() => {
    measure(track.current?.querySelector("img"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = !natural ? undefined : ratio === null ? undefined : { aspectRatio: `${1} / ${Math.min(MAX_RATIO, Math.max(MIN_RATIO, ratio))}` };

  if (total === 0) return null;
  if (total === 1) {
    const only = images[0];
    return (
      <div className={className ? `carousel carousel-single ${className}` : "carousel carousel-single"}>
        <img
          src={only.src}
          alt={only.alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          referrerPolicy="no-referrer"
          className="carousel-img"
        />
      </div>
    );
  }

  return (
    <div
      ref={root}
      className={className ? `carousel ${className}` : "carousel"}
      role="region"
      aria-roledescription="carousel"
      aria-label={labels.label}
      tabIndex={0}
      onKeyDown={onKey}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") setHover(true);
      }}
      onPointerLeave={() => setHover(false)}
      onFocus={(e) => {
        // Hanya fokus keyboard yang menjeda; klik tombol dengan tetikus tidak.
        if (e.target.matches(":focus-visible")) setFocused(true);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
    >
      <div ref={track} className="carousel-track" style={style} onScroll={onScroll} id={`${uid}-track`} aria-live={running ? "off" : "polite"}>
        {images.map((img, i) => (
          <div
            key={`${img.src}-${i}`}
            className="carousel-slide"
            role="group"
            aria-roledescription="slide"
            aria-label={fill(labels.slide, i + 1, total)}
            aria-hidden={i === index ? undefined : true}
          >
            <img
              src={img.src}
              alt={img.alt}
              loading={eager ? (i === 0 ? "eager" : "lazy") : "lazy"}
              decoding="async"
              referrerPolicy="no-referrer"
              draggable={false}
              className="carousel-img"
              onLoad={i === 0 ? onFirstLoad : undefined}
            />
          </div>
        ))}
      </div>

      <span className="carousel-count" aria-hidden="true">
        {index + 1} / {total}
      </span>

      <button type="button" className="carousel-arrow carousel-prev" onClick={() => go(index - 1)} aria-label={labels.prev} aria-controls={`${uid}-track`}>
        <Chevron dir="left" />
      </button>
      <button type="button" className="carousel-arrow carousel-next" onClick={() => go(index + 1)} aria-label={labels.next} aria-controls={`${uid}-track`}>
        <Chevron dir="right" />
      </button>

      <div className="carousel-bar">
        <button
          type="button"
          className="carousel-toggle"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? labels.pause : labels.play}
        >
          {playing ? (
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" focusable="false">
              <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" />
              <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" focusable="false">
              <path d="M8 5v14l11-7z" fill="currentColor" />
            </svg>
          )}
        </button>
        {total > DOTS_MAX ? null : (
        <div className="carousel-dots">
          {images.map((img, i) => (
            <button
              key={`${img.src}-dot-${i}`}
              type="button"
              className="carousel-dot"
              onClick={() => go(i)}
              aria-label={fill(labels.goTo, i + 1, total)}
              aria-current={i === index ? "true" : undefined}
              aria-controls={`${uid}-track`}
            />
          ))}
        </div>
        )}
      </div>
    </div>
  );
}
