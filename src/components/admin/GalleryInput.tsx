"use client";

import { useEffect, useId, useRef, useState, type DragEvent } from "react";
import { uploadInlineImageAction } from "@/app/(admin)/admin/actions";
import Icon from "@/components/admin/Icon";
import { shrink } from "@/components/admin/image-shrink";
import { toast } from "@/components/Toaster";
import { fileUrl, GALLERY_MAX, isFileId, moveItem } from "@/lib/gallery";

// Isian galeri di CMS: beberapa gambar berurutan yang tampil sebagai carousel di situs.
// - Gambar dipilih atau diseret (boleh banyak sekaligus), diperkecil di browser, lalu diunggah
//   satu per satu lewat Server Action, jadi batas 6 MB per permintaan tidak terlampaui.
// - PDF dipecah menjadi satu gambar per halaman (pdf.js di browser), misalnya dokumen carousel LinkedIn.
// - Urutan disusun dengan menyeret kartu atau tombol panah (keyboard). Gambar pertama menjadi sampul.
// - Urutan dikirim lewat input tersembunyi berisi ID berkas; baru tersimpan saat formulir disimpan.
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
};

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
  invalid,
  describedBy,
}: {
  id?: string;
  name: string;
  initial: string[];
  labels: GalleryLabels;
  invalid?: boolean;
  describedBy?: string;
}) {
  const auto = useId();
  const inputId = id ?? auto;
  const wrap = useRef<HTMLDivElement>(null);
  const picker = useRef<HTMLInputElement>(null);
  const [ids, setIds] = useState<string[]>(() => initial.filter(isFileId));
  const [busy, setBusy] = useState("");
  const [over, setOver] = useState(false);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dropAt, setDropAt] = useState<number | null>(null);
  const [say, setSay] = useState("");
  // Jumlah gambar terkini untuk proses unggah yang berjalan di luar siklus render.
  const count = useRef(ids.length);
  useEffect(() => {
    count.current = ids.length;
  }, [ids]);

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

  async function addFiles(list: File[]) {
    if (busy !== "") return;
    const room = GALLERY_MAX - count.current;
    if (room <= 0) {
      toast(fill(labels.full, { max: GALLERY_MAX }), "error");
      return;
    }
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
            const { pdfToImages } = await import("@/components/admin/pdf-pages");
            const res = await pdfToImages(file, room - queue.length, (page, pages) =>
              setBusy(fill(labels.reading, { name: file.name, page, pages })),
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
        const file = queue[i];
        try {
          const blob = file.type === "image/webp" ? file : await shrink(file);
          const fid = await upload(blob, file.name, entryId);
          added += 1;
          setIds((prev) => (prev.includes(fid) ? prev : [...prev, fid]));
        } catch (err) {
          problems.push(`${file.name}: ${(err as Error).message}`);
        }
      }
    } finally {
      setBusy("");
      if (picker.current) picker.current.value = "";
    }
    if (added > 0) toast(fill(labels.uploaded, { n: added }), "success");
    if (trimmed) toast(fill(labels.trimmed, { n: room, max: GALLERY_MAX }), "info");
    if (problems.length > 0) toast(fill(labels.failed, { n: problems.length }), "error", problems);
  }

  function move(from: number, to: number, focus = false) {
    if (to < 0 || to >= ids.length) return;
    setIds((prev) => moveItem(prev, from, to));
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
    setIds((prev) => prev.filter((_, i) => i !== index));
    setSay(labels.removed);
    toast(labels.removed, "info");
  }

  function onZoneDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setOver(false);
    // Seret ulang kartu galeri ke area unggah tidak dihitung sebagai berkas baru.
    if (dragFrom !== null) return;
    const files = [...e.dataTransfer.files];
    if (files.length > 0) void addFiles(files);
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
      <input type="hidden" name={name} value={ids.join(",")} />

      <div className="file-drop" data-over={over ? "" : undefined}>
        <label
          htmlFor={inputId}
          className="file-drop-zone"
          aria-disabled={disabled || undefined}
          onDragEnter={(e) => {
            e.preventDefault();
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
          <span className="file-drop-empty">
            <Icon name={disabled ? "spinner fa-spin" : "images"} className="file-drop-icon" />
            {disabled ? (
              <span role="status">{busy}</span>
            ) : (
              <>
                <span>
                  <strong>{labels.choose}</strong> {labels.or}
                </span>
                <span className="file-drop-hint">{fill(labels.hint, { max: GALLERY_MAX })}</span>
              </>
            )}
          </span>
        </label>
      </div>

      <p className="gallery-count">
        {ids.length === 0 ? labels.empty : fill(labels.count, { n: ids.length, max: GALLERY_MAX })}
        {ids.length > 1 ? <span className="admin-help"> {labels.dragHint}</span> : null}
      </p>

      {ids.length > 0 ? (
        <ol className="gallery-list">
          {ids.map((fid, i) => {
            const label = fill(labels.item, { n: i + 1 });
            return (
              <li
                key={fid}
                data-slot={i}
                className="gallery-item"
                draggable={!disabled}
                data-dragging={dragFrom === i ? "" : undefined}
                data-drop={dropAt === i ? (dragFrom !== null ? (dragFrom < i ? "after" : "before") : undefined) : undefined}
                onDragStart={(e) => {
                  setDragFrom(i);
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData("text/plain", String(i));
                }}
                onDragOver={(e) => {
                  if (dragFrom === null) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  if (dropAt !== i) setDropAt(i);
                }}
                onDragEnd={() => {
                  setDragFrom(null);
                  setDropAt(null);
                }}
                onDrop={(e) => onItemDrop(e, i)}
              >
                <img src={fileUrl(fid)} alt={label} className="gallery-thumb" loading="lazy" draggable={false} />
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
