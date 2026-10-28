"use client";

import { useEffect, useRef, useState } from "react";
import Monogram from "@/components/Monogram";
import type { Lang } from "@/data/profile";

export type NavItem = { id: string; label: string };

export default function Header({
  lang,
  items,
  labels,
  homeHref,
  otherHref,
  name,
}: {
  lang: Lang;
  items: NavItem[];
  labels: { label: string; switchLabel: string; menu: string; close: string };
  homeHref: string;
  otherHref: string;
  name: string;
}) {
  const [active, setActive] = useState("");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const barRef = useRef<HTMLDivElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const other: Lang = lang === "id" ? "en" : "id";

  // Garis progres baca dan latar header setelah halaman digulir.
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      const bar = barRef.current;
      if (bar) bar.style.transform = `scaleX(${p})`;
      setScrolled(window.scrollY > 8);
    };
    const onScroll = () => {
      if (raf === 0) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Menandai bagian yang sedang dibaca.
  useEffect(() => {
    const sections = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [items]);

  // Menu ponsel: tutup dengan Escape dan kembalikan fokus ke tombol.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    const closeOnWide = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };
    window.addEventListener("resize", closeOnWide);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = previous;
      window.removeEventListener("resize", closeOnWide);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const navLinks = (onClick?: () => void) =>
    items.map((item) => (
      <li key={item.id}>
        <a
          href={`#${item.id}`}
          className="nav-link"
          aria-current={active === item.id ? "true" : undefined}
          onClick={onClick}
        >
          {item.label}
        </a>
      </li>
    ));

  const langSwitch = (
    <div className="flex items-center gap-2 text-sm" role="group" aria-label={labels.switchLabel}>
      <span aria-current="true" className="font-semibold text-fg">
        {lang.toUpperCase()}
      </span>
      <span aria-hidden="true" className="text-line">
        /
      </span>
      <a href={otherHref} hrefLang={other} lang={other} className="nav-link text-muted">
        {other.toUpperCase()}
      </a>
    </div>
  );

  return (
    <header className={scrolled ? "site-header is-scrolled" : "site-header"}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-3.5 sm:px-8">
        <a href={homeHref} className="group flex items-center gap-2.5" aria-label={name}>
          <Monogram className="h-8 w-8 transition-transform duration-300 group-hover:-rotate-6" />
          <span className="font-display text-[1.05rem] font-bold tracking-tight">{name}</span>
        </a>

        <div className="hidden items-center gap-7 lg:flex">
          <nav aria-label={labels.label}>
            <ul className="flex items-center gap-6 text-sm text-muted">{navLinks()}</ul>
          </nav>
          {langSwitch}
        </div>

        <button
          ref={menuButtonRef}
          type="button"
          className="menu-button lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">{open ? labels.close : labels.menu}</span>
          <span aria-hidden="true" className={open ? "burger is-open" : "burger"}>
            <span />
            <span />
          </span>
        </button>
      </div>

      <div
        id="mobile-menu"
        className={open ? "mobile-menu is-open lg:hidden" : "mobile-menu lg:hidden"}
        hidden={!open}
      >
        <nav aria-label={labels.label} className="px-5 pb-6 pt-2 sm:px-8">
          <ul className="grid gap-1 font-display text-2xl font-semibold">
            {navLinks(() => setOpen(false))}
          </ul>
          <div className="mt-6">{langSwitch}</div>
        </nav>
      </div>

      <div ref={barRef} className="read-progress" aria-hidden="true" />
    </header>
  );
}
