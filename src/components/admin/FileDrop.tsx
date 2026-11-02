"use client";

import { useEffect, useId, useRef, useState, type DragEvent } from "react";
import Icon from "@/components/admin/Icon";
import { shrink } from "@/components/admin/image-shrink";
import { toast } from "@/components/Toaster";
import { adminCopy } from "@/data/admin";

// Area unggah berkas untuk CMS: kotak bergaris putus-putus yang bisa diklik atau dijatuhi berkas
// (drag and drop), dengan pratinjau sebelum diunggah. Di dalamnya tetap ada <input type="file">
// asli, jadi formulir dan Server Action membaca berkas seperti biasa, dan keyboard tetap bisa
// membuka pemilih berkas. Berkas yang dijatuhkan dipasang ke input lewat DataTransfer.
// shrinkImages: gambar PNG, JPG, atau WebP diperkecil di peramban lebih dulu (lebar maksimal
// 1600 px, WebP), lalu berkas hasilnya yang dipasang ke input dan diunggah saat Simpan. Batas
// ukuran diperiksa setelah diperkecil, jadi foto ponsel besar tetap bisa dipakai.

const SHRINKABLE = /^image\/(png|jpeg|webp)$/;

const t = adminCopy.fileDrop;

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

// Cocokkan berkas dengan atribut accept (ekstensi seperti .zip atau tipe seperti image/png).
function accepted(file: File, accept: string | undefined): boolean {
  if (!accept) return true;
  const name = file.name.toLowerCase();
  return accept
    .split(",")
    .map((a) => a.trim().toLowerCase())
    .filter((a) => a !== "")
    .some((a) => (a.startsWith(".") ? name.endsWith(a) : a.endsWith("/*") ? file.type.startsWith(a.slice(0, -1)) : file.type === a));
}

export default function FileDrop({
  id,
  name,
  accept,
  hint,
  required,
  disabled,
  maxBytes,
  invalid,
  describedBy,
  onFile,
  shrinkImages = false,
}: {
  id?: string;
  name: string;
  accept?: string;
  hint?: string; // jenis dan batas berkas, tampil di dalam kotak
  required?: boolean;
  disabled?: boolean;
  maxBytes?: number;
  invalid?: boolean;
  describedBy?: string;
  onFile?: (file: File | undefined) => void;
  shrinkImages?: boolean;
}) {
  const auto = useId();
  const inputId = id ?? auto;
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [over, setOver] = useState(false);
  const [shrinking, setShrinking] = useState(false);
  const [original, setOriginal] = useState<number | null>(null);

  // Pratinjau gambar dari berkas lokal, dilepas lagi saat berkas berganti.
  useEffect(() => {
    if (file === null || !file.type.startsWith("image/")) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Formulir yang di-reset (misalnya setelah impor berhasil) ikut mengosongkan pilihan.
  useEffect(() => {
    const form = input.current?.form;
    if (!form) return;
    const onReset = () => setFile(null);
    form.addEventListener("reset", onReset);
    return () => form.removeEventListener("reset", onReset);
  }, []);

  // Pasang berkas (misalnya hasil diperkecil) ke input asli, supaya ikut terkirim bersama formulir.
  function setInputFile(next: File) {
    const el = input.current;
    if (!el) return;
    const dt = new DataTransfer();
    dt.items.add(next);
    el.files = dt.files;
  }

  async function take(picked: File | undefined) {
    const el = input.current;
    let next = picked;
    setOriginal(null);
    if (next !== undefined) {
      if (shrinkImages ? SHRINKABLE.test(next.type) : false) {
        if (accepted(next, accept)) {
          setShrinking(true);
          setFile(next);
          try {
            const blob = await shrink(next);
            if (blob !== next) {
              const ext = blob.type === "image/webp" ? "webp" : "jpg";
              const smaller = new File([blob], next.name.replace(/\.[^.]+$/, "") + "." + ext, { type: blob.type });
              setOriginal(next.size);
              next = smaller;
              setInputFile(smaller);
            }
          } catch {
            // Peramban tidak bisa membaca gambarnya: berkas asli dipakai apa adanya.
          } finally {
            setShrinking(false);
          }
        }
      }
    }
    if (next !== undefined) {
      let problem = "";
      if (!accepted(next, accept)) problem = t.wrongType.replace("{name}", next.name);
      else if (maxBytes !== undefined) {
        if (next.size > maxBytes) problem = t.tooBig.replace("{max}", formatSize(maxBytes));
      }
      if (problem !== "") {
        toast(problem, "error");
        if (el) el.value = "";
        setFile(null);
        setOriginal(null);
        onFile?.(undefined);
        return;
      }
    }
    setFile(next ?? null);
    onFile?.(next);
  }

  function clear() {
    if (input.current) input.current.value = "";
    void take(undefined);
    input.current?.focus();
  }

  function onDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setOver(false);
    if (disabled) return;
    const dropped = e.dataTransfer.files[0];
    if (dropped === undefined) return;
    const el = input.current;
    if (el) {
      const dt = new DataTransfer();
      dt.items.add(dropped);
      el.files = dt.files;
    }
    void take(dropped);
  }

  return (
    <div className="file-drop" data-over={over ? "" : undefined} data-filled={file ? "" : undefined} data-invalid={invalid ? "" : undefined}>
      <label
        htmlFor={inputId}
        className="file-drop-zone"
        aria-disabled={disabled || undefined}
        onDragEnter={(e) => {
          e.preventDefault();
          if (!disabled) setOver(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(false);
        }}
        onDrop={onDrop}
      >
        <input
          ref={input}
          id={inputId}
          name={name}
          type="file"
          accept={accept}
          required={required}
          disabled={disabled}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          className="file-drop-input"
          onChange={(e) => void take(e.currentTarget.files?.[0])}
        />
        {file ? (
          <span className="file-drop-picked">
            {preview ? <img src={preview} alt="" className="file-drop-thumb" /> : <Icon name="file-lines" className="file-drop-icon" />}
            <span className="file-drop-meta">
              <span className="file-drop-name">{file.name}</span>
              <span className="file-drop-size">
                {shrinking
                  ? t.shrinking
                  : original !== null
                    ? `${formatSize(file.size)} · ${t.shrunk.replace("{from}", formatSize(original))} · ${t.ready}`
                    : `${formatSize(file.size)} · ${t.ready}`}
              </span>
            </span>
          </span>
        ) : (
          <span className="file-drop-empty">
            <Icon name="cloud-arrow-up" className="file-drop-icon" />
            <span>
              <strong>{t.choose}</strong> {t.or}
            </span>
            {hint ? <span className="file-drop-hint">{hint}</span> : null}
          </span>
        )}
      </label>
      {file ? (
        <button type="button" className="btn btn-line btn-small file-drop-clear" onClick={clear} disabled={disabled}>
          <Icon name="xmark" />
          {t.clear}
        </button>
      ) : null}
    </div>
  );
}
