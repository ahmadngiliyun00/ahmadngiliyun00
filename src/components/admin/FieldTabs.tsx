"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import type { Field } from "@/content/fields";

// Tab navigasi untuk sekelompok isian formulir CMS, misalnya sumber gambar postingan:
// Tautan gambar, Satu gambar, atau Beberapa gambar (carousel).
// - Field select dengan tabs: true menjadi daftar tab; nilainya (tab aktif) dikirim lewat
//   input tersembunyi dengan nama field itu, jadi dibaca dan divalidasi seperti select biasa.
// - Isian dengan tab.of = nama select tampil di panel tab yang namanya ada di tab.show;
//   tanpa show, isian tampil di bawah semua panel.
// - Panel yang tidak aktif hanya disembunyikan (hidden), isinya tetap ikut terkirim, jadi
//   berganti tab tidak menghapus apa pun.
// - Keyboard: panah kiri dan kanan, Home, End (pola tab WAI-ARIA, aktivasi langsung).

export type TabPanel = { value: string; children: ReactNode };

export default function FieldTabs({
  field,
  value,
  errorTabs,
  error,
  panels,
  shared,
}: {
  field: Field;
  value: string;
  errorTabs: string[]; // tab yang berisi isian galat, dibuka lebih dulu
  error?: string;
  panels: TabPanel[];
  shared: ReactNode;
}) {
  const options = field.type === "select" ? field.options : [];
  const valid = options.some((o) => o.value === value);
  const [active, setActive] = useState(errorTabs[0] ?? (valid ? value : (options[0]?.value ?? "")));
  const uid = useId();
  const list = useRef<HTMLDivElement>(null);
  const key = `f.${field.name}`;
  const wrap = useRef<HTMLDivElement>(null);

  // Simpan gagal di isian dalam tab lain: buka tab itu dan fokus ke isian yang salah.
  const errorKey = errorTabs.join(",");
  useEffect(() => {
    const target = errorKey.split(",")[0];
    if (target === "") return;
    setActive(target);
    requestAnimationFrame(() => {
      wrap.current?.querySelector<HTMLElement>(`#${CSS.escape(`${uid}-panel-${target}`)} [aria-invalid="true"]`)?.focus();
    });
  }, [errorKey, uid]);
  const helpId = field.help ? `${uid}-help` : undefined;

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    const i = options.findIndex((o) => o.value === active);
    let next = -1;
    if (e.key === "ArrowRight") next = (i + 1) % options.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + options.length) % options.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = options.length - 1;
    if (next < 0) return;
    e.preventDefault();
    setActive(options[next].value);
    list.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
  }

  return (
    <div ref={wrap} className="admin-field field-tabs">
      <input type="hidden" name={key} value={active} />
      <span className="admin-label" id={`${uid}-label`}>
        {field.label}
      </span>
      <div ref={list} role="tablist" aria-labelledby={`${uid}-label`} aria-describedby={helpId} className="field-tablist" onKeyDown={onKey}>
        {options.map((o) => {
          const selected = o.value === active;
          const flagged = errorTabs.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              role="tab"
              id={`${uid}-tab-${o.value}`}
              aria-selected={selected}
              aria-controls={`${uid}-panel-${o.value}`}
              tabIndex={selected ? 0 : -1}
              className="field-tab"
              data-error={flagged ? "" : undefined}
              onClick={() => setActive(o.value)}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      {field.help ? (
        <p id={helpId} className="admin-help">
          {field.help}
        </p>
      ) : null}
      {error ? <p className="admin-field-error">{error}</p> : null}
      {options.map((o) => {
        const panel = panels.find((p) => p.value === o.value);
        return (
          <div
            key={o.value}
            role="tabpanel"
            id={`${uid}-panel-${o.value}`}
            aria-labelledby={`${uid}-tab-${o.value}`}
            hidden={o.value !== active}
            className="field-tabpanel"
          >
            {panel ? panel.children : null}
          </div>
        );
      })}
      {shared ? <div className="field-tabshared">{shared}</div> : null}
    </div>
  );
}
