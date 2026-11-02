"use client";

import { useEffect, useId, useRef, useState, type DragEvent } from "react";
import { uploadInlineImageAction } from "@/app/(admin)/admin/actions";
import Icon from "@/components/admin/Icon";
import { shrink } from "@/components/admin/image-shrink";
import { useLangMode } from "@/components/admin/LangMode";
import { toast } from "@/components/Toaster";
import type { Lang } from "@/content/types";
import { ALT_MAX, fileUrl, GALLERY_MAX, galleryItems, moveItem, type GalleryItem } from "@/lib/gallery";
import { langOrder } from "@/lib/i18n";
import LazyImage from "@/components/LazyImage";

// Isian galeri di CMS: beberapa gambar berurutan yang tampil sebagai carousel di situs.
// - Gambar dipilih atau diseret (boleh banyak sekaligus), diperkecil di browser, lalu diunggah
//   satu per satu lewat Server Action, jadi batas 6 MB per permintaan tidak terlampaui.
// - PDF dipecah menjadi satu gambar per halaman (pdf.js di browser), misalnya dokumen carousel LinkedIn.
// - Urutan disusun dengan menyeret kartu atau tombol panah (keyboard). Gambar pertama menjadi sampul.
// - Teks alternatif per gambar opsional (bahasa utama; bahasa lain tampil di mode terjemahan).
//   Gambar tanpa teks sendiri memakai teks alternatif umum di situs.
// - Urutan dan teks dikirim lewat input tersembunyi berisi JSON; tersimpan saat formulir disimpan.
//   Gambar yang dilepas dari galeri dihapus permanen oleh server saat formulir disimpan.

export type GalleryLabels = {
  choose: string;
  or: string;
  hint: string;
  empty: string;
  count: string;
  item: string;
  first: string;
  moveUp: string;
  moveDown: string;
  remove: string;
  dragHint: string;
  uploading: string;
  reading: string;
  uploaded: string;
  failed: string;
  wrongType: string;
  full: string;
  trimmed: string;
  pdfFailed: string;
  moved: string;
  removed: string;
  preparing: string;
  loadingPdf: string;
  opening: string;
  wait: string;
  stillWorking: string;
  alt: string;
  altPlaceholder: string;
};

function parseInitial(text: string): GalleryItem[] {
  try {
    return galleryItems(JSON.parse(text));
  } catch {
    return galleryItems(text.split(","));
  }
}

const IMAGE = /^image\/(png|jpeg|webp)$/;
const ACCEPT = "image/png,image/jpeg,image/webp,application/pdf";

function isPdf(file: File): boolean {
  return file.type === "application/pdf" ? true : /\.pdf$/i.test(file.name);
}

function fill(text: string, values: Record<string, string | number>): string {
  return Object.entries(values).reduce((s, [k, v]) => s.split(`{${k}}`).join(String(v)), text);
}

export default function GalleryInput({
  id,
  name,
  initial,
  labels,
  names,
  invalid,
  describedBy,
}: {
  id?: string;
  name: string;
  initial: string; // JSON daftar item, atau ID dipisah koma
  labels: GalleryLabels;
  names: Record<Lang, string>;
  invalid?: boolean;
  describedBy?: string;
}) {
  const auto = useId();
  const inputId = id ?? auto;
  const wrap = useRef<HTMLDivElement>(null);
  const picker = useRef<HTMLInputElement>(null);
  const { primary, translate } = useLangMode();
  const [items, setItems] = useState<GalleryItem[]>(() => parseInitial(initial));
  const ids = items.map((x) => x.file);
  const [busy, setBusy] = useState("");
  // Kemajuan untuk bilah progres: null = belum diketahui (bilah berjalan tanpa angka).
  const [progress, setProgress] = useState<{ value: number; max: number } | null>(null);
  // Penanda sibuk yang langsung berlaku, sebelum render berikutnya: berkas kedua yang dijatuhkan
  // di saat yang sama ditolak, tidak ikut diproses bersamaan.
  const working = useRef(false);
  const warmed = useRef(false);
  const [over, setOver] = useState(false);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dropAt, setDropAt] = useState<number | null>(null);
  const [say, setSay] = useState("");
  // Jumlah gambar terkini untuk proses unggah yang berjalan di luar siklus render.
  const count = useRef(ids.length);
  useEffect(() => {
    count.current = items.length;
  }, [items]);

  async function upload(file: File | Blob, filename: string, entryId: string): Promise<string> {
    const data = new FormData();
    data.set("file", file, filename);
    data.set("entryId", entryId);
    const res = await uploadInlineImageAction(data);
    if (!res.ok) throw new Error(res.message);
    const found = /\/files\/([a-f0-9]{24})\//.exec(res.url);
    if (found === null) throw new Error("upload");
    return found[1];
  }

  // pdf.js (sekitar 1 MB) dimuat lebih awal saat kursor, fokus, atau berkas mendekati area unggah.
  function warmUp() {
    if (warmed.current) return;
    warmed.current = true;
    void import("@/components/admin/pdf-pages").then((m) => m.preloadPdfJs()).catch(() => {
      warmed.current = false;
    });
  }

  async function addFiles(list: File[]) {
    if (working.current) return;
    if (list.length === 0) return;
    const room = GALLERY_MAX - count.current;
    if (room <= 0) {
      toast(fill(labels.full, { max: GALLERY_MAX }), "error");
      return;
    }
    // Langsung terkunci dan berputar begitu berkas diterima, sebelum pekerjaan berat dimulai.
    working.current = true;
    setBusy(fill(labels.preparing, { n: list.length }));
    setProgress(null);
    const entryId = wrap.current?.closest("form")?.querySelector<HTMLInputElement>('input[name="id"]')?.value ?? "";
    const problems: string[] = [];
    let added = 0;
    let trimmed = false;
    try {
      // Kumpulkan dulu semua gambar (PDF dipecah per halaman), lalu unggah berurutan.
      const queue: File[] = [];
      for (const file of list) {
        if (queue.length >= room) {
          trimmed = true;
          break;
        }
        if (isPdf(file)) {
          try {
            setBusy(fill(labels.loadingPdf, { name: file.name }));
            setProgress(null);
            const { pdfToImages } = await import("@/components/admin/pdf-pages");
            const res = await pdfToImages(
              file,
              room - queue.length,
              (page, pages) => {
                setBusy(fill(labels.reading, { name: file.name, page, pages: Math.min(pages, room - queue.length) }));
                setProgress({ value: page - 1, max: Math.min(pages, room - queue.length) });
              },
              () => setBusy(fill(labels.opening, { name: file.name })),
            );
            queue.push(...res.files);
            if (res.pages > res.files.length) trimmed = true;
          } catch {
            problems.push(fill(labels.pdfFailed, { name: file.name }));
          }
        } else if (IMAGE.test(file.type)) {
          queue.push(file);
        } else {
          problems.push(fill(labels.wrongType, { name: file.name }));
        }
      }
      for (let i = 0; i < queue.length; i++) {
        setBusy(fill(labels.uploading, { done: i + 1, total: queue.length }));
        setProgress({ value: i, max: queue.length });
        const file = queue[i];
        try {
          const blob = file.type === "image/webp" ? file : await shrink(file);
          const fid = await upload(blob, file.name, entryId);
          added += 1;
          setItems((prev) => (prev.some((x) => x.file === fid) ? prev : [...prev, { file: fid }]));
        } catch (err) {
          problems.push(`${file.name}: ${(err as Error).message}`);
        }
      }
    } finally {
      working.current = false;
      setBusy("");
      setProgress(null);
      if (picker.current) picker.current.value = "";
    }
    if (added > 0) toast(fill(labels.uploaded, { n: added }), "success");
    if (trimmed) toast(fill(labels.trimmed, { n: room, max: GALLERY_MAX }), "info");
    if (problems.length > 0) toast(fill(labels.failed, { n: problems.length }), "error", problems);
  }

  function move(from: number, to: number, focus = false) {
    if (to < 0 || to >= ids.length) return;
    setItems((prev) => moveItem(prev, from, to));
    setSay(fill(labels.moved, { n: to + 1 }));
    if (focus) {
      // Fokus mengikuti gambar yang dipindah, supaya tombol panah bisa ditekan berulang.
      requestAnimationFrame(() => {
        const btn = wrap.current?.querySelector<HTMLButtonElement>(`[data-slot="${to}"] [data-dir="${to > from ? "down" : "up"}"]`);
        const usable = btn ? !btn.disabled : false;
        (usable ? btn : wrap.current?.querySelector<HTMLElement>(`[data-slot="${to}"] [data-dir="remove"]`))?.focus();
      });
    }
  }

  function remove(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
    setSay(labels.removed);
    toast(labels.removed, "info");
  }

  function setAlt(index: number, lang: Lang, text: string) {
    setItems((prev) =>
      prev.map((x, i) => (i === index ? { ...x, alt: { ...(x.alt ?? { id: "", en: "" }), [lang]: text } } : x)),
    );
  }

  function onZoneDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setOver(false);
    // Seret ulang kartu galeri ke area unggah tidak dihitung sebagai berkas baru.
    if (dragFrom !== null) return;
    const files = [...e.dataTransfer.files];
    if (files.length === 0) return;
    if (working.current) {
      toast(labels.stillWorking, "info");
      return;
    }
    void addFiles(files);
  }

  function onItemDrop(e: DragEvent<HTMLLIElement>, index: number) {
    e.preventDefault();
    if (dragFrom !== null) move(dragFrom, index);
    setDragFrom(null);
    setDropAt(null);
  }

  const disabled = busy !== "";

  return (
    <div ref={wrap} className="gallery-input" data-invalid={invalid ? "" : undefined}>
      <input type="hidden" name={name} value={JSON.stringify(items)} />

      <div className="file-drop" data-over={over ? "" : undefined} data-busy={disabled ? "" : undefined}>
        <label
          htmlFor={inputId}
          className="file-drop-zone"
          aria-disabled={disabled || undefined}
          aria-busy={disabled || undefined}
          onPointerEnter={warmUp}
          onFocus={warmUp}
          onDragEnter={(e) => {
            e.preventDefault();
            warmUp();
            if (dragFrom === null) {
              if (!disabled) setOver(true);
            }
          }}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(false);
          }}
          onDrop={onZoneDrop}
        >
          {/* Tanpa atribut name: berkas tidak ikut formulir, sudah diunggah satu per satu. */}
          <input
            ref={picker}
            id={inputId}
            type="file"
            multiple
            accept={ACCEPT}
            disabled={disabled}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            className="file-drop-input"
            onChange={(e) => void addFiles([...(e.currentTarget.files ?? [])])}
          />
          {disabled ? (
            <span className="file-drop-empty gallery-busy">
              <Icon name="spinner fa-spin-pulse" className="file-drop-icon" />
              <strong>{busy}</strong>
              {progress === null ? <progress className="gallery-progress" aria-hidden="true" /> : (
                <progress className="gallery-progress" value={progress.value} max={progress.max} aria-hidden="true" />
              )}
              <span className="file-drop-hint">{labels.wait}</span>
            </span>
          ) : (
            <span className="file-drop-empty">
              <Icon name="images" className="file-drop-icon" />
              <span>
                <strong>{labels.choose}</strong> {labels.or}
              </span>
              <span className="file-drop-hint">{fill(labels.hint, { max: GALLERY_MAX })}</span>
            </span>
          )}
        </label>
        {/* Selalu ada di halaman, supaya setiap perubahan tahap dibacakan pembaca layar. */}
        <p className="sr-only" role="status" aria-live="polite">
          {busy}
        </p>
      </div>

      <p className="gallery-count">
        {ids.length === 0 ? labels.empty : fill(labels.count, { n: ids.length, max: GALLERY_MAX })}
        {ids.length > 1 ? <span className="admin-help"> {labels.dragHint}</span> : null}
      </p>

      {ids.length > 0 ? (
        <ol className="gallery-list">
          {items.map((item, i) => {
            const fid = item.file;
            const label = fill(labels.item, { n: i + 1 });
            return (
              <li
                key={fid}
                data-slot={i}
                className="gallery-item"
                data-dragging={dragFrom === i ? "" : undefined}
                data-drop={dropAt === i ? (dragFrom !== null ? (dragFrom < i ? "after" : "before") : undefined) : undefined}
                onDragOver={(e) => {
                  if (dragFrom === null) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  if (dropAt !== i) setDropAt(i);
                }}
                onDrop={(e) => onItemDrop(e, i)}
              >
                {/* Hanya gambar yang bisa diseret, supaya teks di isian tetap bisa dipilih. */}
                <div
                  className="gallery-handle"
                  draggable={!disabled}
                  onDragStart={(e) => {
                    setDragFrom(i);
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("text/plain", String(i));
                  }}
                  onDragEnd={() => {
                    setDragFrom(null);
                    setDropAt(null);
                  }}
                >
                  <LazyImage src={fileUrl(fid)} alt={label} className="gallery-thumb" draggable={false} frameClassName="gallery-thumb-frame" />
                </div>
                <span className="gallery-badge">{i === 0 ? `${i + 1} · ${labels.first}` : i + 1}</span>
                <span className="gallery-tools">
                  <button
                    type="button"
                    className="gallery-btn"
                    data-dir="up"
                    onClick={() => move(i, i - 1, true)}
                    disabled={disabled ? true : i === 0}
                    aria-label={fill(labels.moveUp, { n: i + 1 })}
                    title={fill(labels.moveUp, { n: i + 1 })}
                  >
                    <Icon name="arrow-left" />
                  </button>
                  <button
                    type="button"
                    className="gallery-btn"
                    data-dir="down"
                    onClick={() => move(i, i + 1, true)}
                    disabled={disabled ? true : i === ids.length - 1}
                    aria-label={fill(labels.moveDown, { n: i + 1 })}
                    title={fill(labels.moveDown, { n: i + 1 })}
                  >
                    <Icon name="arrow-right" />
                  </button>
                  <button
                    type="button"
                    className="gallery-btn gallery-btn-remove"
                    data-dir="remove"
                    onClick={() => remove(i)}
                    disabled={disabled}
                    aria-label={fill(labels.remove, { n: i + 1 })}
                    title={fill(labels.remove, { n: i + 1 })}
                  >
                    <Icon name="trash-can" />
                  </button>
                </span>
                <div className="gallery-alt">
                  {langOrder(primary).map((lang) => {
                    if (lang !== primary) {
                      if (!translate) return null;
                    }
                    const altId = `${inputId}-alt-${i}-${lang}`;
                    return (
                      <div key={lang} className="gallery-alt-row">
                        <label htmlFor={altId} className="gallery-alt-label">
                          {fill(labels.alt, { n: i + 1, lang: names[lang] })}
                        </label>
                        <input
                          id={altId}
                          className="field gallery-alt-input"
                          value={item.alt?.[lang] ?? ""}
                          maxLength={ALT_MAX}
                          placeholder={labels.altPlaceholder}
                          onChange={(e) => setAlt(i, lang, e.currentTarget.value)}
                        />
                      </div>
                    );
                  })}
                </div>
              </li>
            );
          })}
        </ol>
      ) : null}
      <p className="sr-only" aria-live="polite">
        {say}
      </p>
    </div>
  );
}
