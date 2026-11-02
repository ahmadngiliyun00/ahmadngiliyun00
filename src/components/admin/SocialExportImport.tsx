"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { attachExportImageAction, importExportAction, importLinkedinAction } from "@/app/(admin)/admin/actions";
import FileDrop from "@/components/admin/FileDrop";
import { shrink } from "@/components/admin/image-shrink";
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
  dropHint: string;
};

const MAX_BYTES = 5 * 1024 * 1024;
const BATCH = 200;
const MAX_STREAK = 3;
const TYPES: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };

const fill = (text: string, values: Record<string, string | number>) =>
  Object.entries(values).reduce((out, [k, v]) => out.split(`{${k}}`).join(String(v)), text);

// Gambar dari ekspor diperkecil sebelum diunggah (lebar maksimal 1600 px, WebP atau JPEG), sama
// seperti unggahan lain di CMS, supaya kartu di situs tidak memuat foto berukuran MB. Format lain
// (misalnya HEIC) ikut diubah lewat canvas. Bila peramban tidak bisa membacanya, berkas asli
// dipakai bila formatnya didukung dan ukurannya cukup; kalau tidak, gambar dilewati dan postingan
// tetap tersimpan.
async function prepareImage(blob: Blob, name: string): Promise<File | null> {
  const ext = (name.split(".").pop() ?? "").toLowerCase();
  const type = TYPES[ext];
  const source = new File([blob], name, { type: type ?? blob.type });
  try {
    const out = await shrink(source);
    if (out === source) return type !== undefined ? (source.size <= MAX_BYTES ? source : null) : null;
    if (out.size > MAX_BYTES) return null;
    const outExt = out.type === "image/webp" ? "webp" : "jpg";
    return new File([out], name.replace(/\.[^.]+$/, "") + "." + outExt, { type: out.type });
  } catch {
    if (type === undefined) return null;
    return blob.size <= MAX_BYTES ? source : null;
  }
}

type Loaded = { zip: File; entries: ZipEntry[]; parsed: ExportParse };

// Impor ZIP ekspor data. ZIP tidak pernah dikirim ke server: peramban membaca daftar isinya,
// mengirim daftar postingan, lalu mengunggah gambar sampul satu per satu.
export default function SocialExportImport({ labels }: { labels: ExportImportLabels }) {
  const router = useRouter();
  // Kunci baru memasang ulang area unggah, jadi pilihan berkas kosong lagi.
  const [dropKey, setDropKey] = useState(0);
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
        setDropKey((k) => k + 1);
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
      setDropKey((k) => k + 1);
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
      setDropKey((k) => k + 1);
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
        <FileDrop
          key={dropKey}
          id="social-export-zip"
          name="zip"
          accept=".zip,application/zip"
          hint={labels.dropHint}
          describedBy="social-export-help"
          disabled={busy}
          onFile={(f) => onPick(f)}
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
