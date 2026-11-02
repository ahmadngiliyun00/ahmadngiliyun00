"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { attachExportImageAction, importExportAction, importLinkedinAction } from "@/app/(admin)/admin/actions";
import Icon from "@/components/admin/Icon";
import { toast } from "@/components/Toaster";
import { coverImage, detectExport, parseFacebookExport, parseInstagramExport, type ExportParse, type SkipReason } from "@/lib/social-export";
import { findEntry, listZip, readZipEntry, readZipText, type ZipEntry } from "@/lib/zip-reader";

export type ExportImportLabels = {
  file: string;
  help: string;
  reading: string;
  found: string;
  withImage: string;
  skipped: string;
  reasons: Record<SkipReason, string>;
  warning: string;
  submit: string;
  saving: string;
  uploading: string;
  done: string;
  imagesFailed: string;
  serverError: string;
  retryHint: string;
  unsupported: string;
  platforms: { instagram: string; facebook: string };
};

const MAX_BYTES = 5 * 1024 * 1024;
const MAX_SIDE = 2048;
const BATCH = 200;
const MAX_STREAK = 3;
const TYPES: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };

const fill = (text: string, values: Record<string, string | number>) =>
  Object.entries(values).reduce((out, [k, v]) => out.split(`{${k}}`).join(String(v)), text);

// Gambar yang terlalu besar atau berformat lain (misalnya HEIC) diubah ke JPEG lewat canvas.
// Bila peramban tidak bisa membacanya, gambar dilewati dan postingan tetap tersimpan.
async function prepareImage(blob: Blob, name: string): Promise<File | null> {
  const ext = (name.split(".").pop() ?? "").toLowerCase();
  const type = TYPES[ext];
  if (type !== undefined) {
    if (blob.size <= MAX_BYTES) return new File([blob], name, { type });
  }
  try {
    const bitmap = await createImageBitmap(blob);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const out = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
    if (out === null) return null;
    return out.size <= MAX_BYTES ? new File([out], name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }) : null;
  } catch {
    return null;
  }
}

type Loaded = { zip: File; entries: ZipEntry[]; parsed: ExportParse };

// Impor ZIP ekspor data. ZIP tidak pernah dikirim ke server: peramban membaca daftar isinya,
// mengirim daftar postingan, lalu mengunggah gambar sampul satu per satu.
export default function SocialExportImport({ labels }: { labels: ExportImportLabels }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function onPick(file: File | undefined) {
    setLoaded(null);
    setStatus("");
    if (file === undefined) return;
    if (typeof DecompressionStream === "undefined") {
      toast(labels.unsupported, "error");
      return;
    }
    setBusy(true);
    setStatus(labels.reading);
    try {
      const entries = await listZip(file);
      const kind = detectExport(entries.map((e) => e.name));
      if (kind.kind === "linkedin") {
        // Shares.csv (atau Shares_<nomor>.csv di arsip Complete) diteruskan ke impor CSV yang sudah
        // ada, satu berkas per permintaan.
        let anyOk = false;
        for (const name of kind.files) {
          const entry = findEntry(entries, name);
          if (entry === undefined) throw new Error(`${name} tidak bisa dibaca.`);
          const form = new FormData();
          form.set("shares", new File([await readZipEntry(file, entry, "text/csv")], "Shares.csv", { type: "text/csv" }));
          let res: Awaited<ReturnType<typeof importLinkedinAction>>;
          try {
            res = await importLinkedinAction(undefined, form);
          } catch {
            throw new Error(labels.serverError);
          }
          if (res?.message) toast(res.message, res.ok ? "success" : "error");
          if (res?.ok) anyOk = true;
        }
        setStatus("");
        if (input.current) input.current.value = "";
        if (anyOk) router.refresh();
        return;
      }
      const files: Record<string, string> = {};
      for (const name of kind.files) {
        const entry = findEntry(entries, name);
        if (entry) files[name] = await readZipText(file, entry);
      }
      const parsed = kind.kind === "instagram" ? parseInstagramExport(files) : parseFacebookExport(files);
      setLoaded({ zip: file, entries, parsed });
      setStatus("");
    } catch (err) {
      setStatus("");
      toast((err as Error).message, "error");
      if (input.current) input.current.value = "";
    } finally {
      setBusy(false);
    }
  }

  async function onImport() {
    if (loaded === null) return;
    const { zip, entries, parsed } = loaded;
    setBusy(true);
    try {
      setStatus(labels.saving);
      let added = 0;
      let existing = 0;
      let ignored = 0;
      const pending: { id: number; sourceId: string; path: string }[] = [];
      for (let i = 0; i < parsed.posts.length; i += BATCH) {
        let res: Awaited<ReturnType<typeof importExportAction>>;
        try {
          res = await importExportAction({ platform: parsed.platform, posts: parsed.posts.slice(i, i + BATCH) });
        } catch {
          // Balasan bukan dari Server Action (misalnya halaman error Nginx atau Cloudflare).
          throw new Error(labels.serverError);
        }
        if (!res.ok) throw new Error(res.message);
        added += res.added;
        existing += res.existing;
        ignored += res.ignored;
        pending.push(...res.images);
      }
      // Gambar yang gagal dilewati supaya gambar lain tetap terunggah; impor ulang ZIP yang sama
      // melengkapi yang terlewat. Setelah beberapa kegagalan beruntun, unggahan dihentikan.
      let failed = 0;
      let streak = 0;
      let serverIssue = false;
      for (const [n, item] of pending.entries()) {
        if (streak >= MAX_STREAK) {
          failed += pending.length - n;
          break;
        }
        setStatus(fill(labels.uploading, { n: n + 1, total: pending.length }));
        const entry = findEntry(entries, item.path);
        const name = item.path.split("/").pop() ?? "gambar.jpg";
        const image = entry ? await prepareImage(await readZipEntry(zip, entry), name) : null;
        if (image === null) {
          failed++;
          continue;
        }
        const form = new FormData();
        form.set("id", String(item.id));
        form.set("sourceId", item.sourceId);
        form.set("image", image);
        let ok = false;
        try {
          ok = (await attachExportImageAction(form)).ok;
        } catch {
          serverIssue = true;
        }
        if (ok) streak = 0;
        else {
          failed++;
          streak++;
        }
      }
      const summary = fill(labels.done, { added, existing, ignored, images: pending.length - failed });
      const problem = failed === 0 ? "" : ` ${fill(labels.imagesFailed, { n: failed })}${serverIssue ? ` ${labels.retryHint}` : ""}`;
      toast(`${summary}${problem}`, failed > 0 ? "error" : "success");
      setLoaded(null);
      if (input.current) input.current.value = "";
      router.refresh();
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setStatus("");
      setBusy(false);
    }
  }

  const parsed = loaded?.parsed;
  const skipped = parsed
    ? (Object.entries(parsed.skipped) as [SkipReason, number][]).filter(([, n]) => n > 0).map(([r, n]) => `${labels.reasons[r]} ${n}`)
    : [];

  return (
    <div className="mt-4">
      <div className="admin-field">
        <label htmlFor="social-export-zip">{labels.file}</label>
        <input
          ref={input}
          id="social-export-zip"
          type="file"
          accept=".zip,application/zip"
          className="admin-file-input"
          aria-describedby="social-export-help"
          disabled={busy}
          onChange={(e) => onPick(e.currentTarget.files?.[0])}
        />
        <p id="social-export-help" className="admin-help">
          {labels.help}
        </p>
      </div>
      <p className="admin-help mt-2" role="status" aria-live="polite">
        {status}
      </p>
      {parsed ? (
        <div className="social-preview mt-3">
          <p className="text-sm">
            <strong>{labels.platforms[parsed.platform]}</strong>{" "}
            {fill(labels.found, { n: parsed.posts.length })}{" "}
            {fill(labels.withImage, { n: parsed.posts.filter((p) => coverImage(p) !== undefined).length })}
          </p>
          {skipped.length > 0 ? <p className="admin-help">{fill(labels.skipped, { list: skipped.join(", ") })}</p> : null}
          {parsed.platform === "facebook" ? <p className="admin-help admin-warn">{labels.warning}</p> : null}
          <button type="button" className="btn btn-solid btn-small mt-3" disabled={busy ? true : parsed.posts.length === 0} onClick={onImport}>
            <Icon name="file-import" />
            {busy ? labels.saving : fill(labels.submit, { n: parsed.posts.length })}
          </button>
        </div>
      ) : null}
    </div>
  );
}
