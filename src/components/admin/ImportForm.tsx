"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { applyImportAction, previewImportAction, type ImportState } from "@/app/(admin)/admin/actions";
import Icon from "@/components/admin/Icon";
import { toast } from "@/components/Toaster";
import type { adminCopy } from "@/data/admin";

type Labels = (typeof adminCopy)["transfer"];

function fill(text: string, values: Record<string, string | number>): string {
  return Object.entries(values).reduce((out, [k, v]) => out.split(`{${k}}`).join(String(v)), text);
}

// Impor lembar kerja dua langkah: Periksa berkas (pratinjau tanpa menyimpan), lalu Terapkan.
// Dikirim lewat startTransition, bukan prop action, karena React mengosongkan formulir setelah
// action selesai; berkas yang dipilih harus tetap ada untuk langkah Terapkan.
export default function ImportForm({ collection, listHref, labels }: { collection: string; listHref: string; labels: Labels }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [preview, runPreview, previewing] = useActionState<ImportState, FormData>(previewImportAction, undefined);
  const [applied, runApply, applying] = useActionState<ImportState, FormData>(applyImportAction, undefined);
  // Pratinjau yang sudah usang: berkas diganti setelah diperiksa, atau sudah diterapkan.
  const [staleFor, setStaleFor] = useState<ImportState>(undefined);
  const [appliedFor, setAppliedFor] = useState<ImportState>(undefined);

  useEffect(() => {
    if (preview?.message) toast(preview.message, "error");
  }, [preview]);

  useEffect(() => {
    if (applied === undefined) return;
    if (applied.message) toast(applied.message, "error");
    else if (applied.result) {
      const { saved, failed } = applied.result;
      toast(
        failed.length === 0 ? fill(labels.done, { n: saved }) : fill(labels.doneWithErrors, { n: saved, f: failed.length }),
        failed.length === 0 ? "success" : "error",
      );
    }
  }, [applied, labels]);

  const plan = preview?.plan;
  const busy = previewing ? true : applying;
  const changes = plan ? plan.counts.new + plan.counts.update : 0;
  const stale = plan ? staleFor === preview : false;
  const done = plan ? appliedFor === preview : false;
  let canApply = changes > 0;
  if (stale) canApply = false;
  if (done) canApply = false;
  const nothing = plan ? changes + plan.counts.error === 0 : false;

  const submit = (run: (form: FormData) => void) => {
    const form = formRef.current;
    if (form === null) return;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    startTransition(() => run(data));
  };

  return (
    <>
      <form
        ref={formRef}
        className="admin-card mt-6"
        onSubmit={(e) => {
          e.preventDefault();
          submit(runPreview);
        }}
      >
        <input type="hidden" name="collection" value={collection} />
        <div className="admin-field">
          <label htmlFor="sheet">{labels.file}</label>
          <input
            id="sheet"
            name="sheet"
            type="file"
            required
            accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
            className="admin-file-input"
            aria-describedby="sheet-help"
            onChange={() => setStaleFor(preview)}
          />
          <p id="sheet-help" className="admin-help">
            {labels.fileHelp}
          </p>
        </div>
        <div className="admin-import-actions">
          <button type="submit" className="btn btn-line" disabled={busy}>
            <Icon name="magnifying-glass" />
            {previewing ? labels.previewing : labels.preview}
          </button>
          {canApply ? (
            <button
              type="button"
              className="btn btn-solid"
              disabled={busy}
              onClick={() => {
                setAppliedFor(preview);
                submit(runApply);
              }}
            >
              <Icon name="check" />
              {applying ? labels.applying : fill(labels.apply, { n: changes })}
            </button>
          ) : null}
        </div>
        {stale ? <p className="admin-help mt-3">{labels.stale}</p> : null}
      </form>

      {plan ? (
        <section className="admin-card mt-6" aria-labelledby="import-preview" aria-live="polite">
          <h2 id="import-preview" className="font-display text-lg font-bold">
            {fill(labels.summary, plan.counts)}
          </h2>
          {plan.unknown.length > 0 ? <p className="admin-help mt-2">{fill(labels.unknown, { cols: plan.unknown.join(", ") })}</p> : null}
          {nothing ? <p className="mt-3 text-sm text-muted">{labels.nothing}</p> : null}
          <ul className="admin-import">
            {plan.rows
              .filter((r) => r.action !== "same")
              .map((r) => (
                <li key={r.line} className="admin-import-row">
                  <p className="admin-row-badges">
                    <span className="admin-badge" data-v={r.action}>
                      {labels.actions[r.action]}
                    </span>
                    <span className="text-sm text-muted">
                      {fill(labels.line, { n: r.line })}
                      {r.slug === "" ? "" : `, ${r.slug}`}
                    </span>
                  </p>
                  <p className="admin-row-title">{r.title}</p>
                  {r.changes.length > 0 ? <p className="admin-row-sub">{fill(labels.changed, { fields: r.changes.join(", ") })}</p> : null}
                  {r.errors.length > 0 ? (
                    <ul className="admin-import-errors">
                      {r.errors.map((e) => (
                        <li key={e}>{e}</li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
          </ul>
        </section>
      ) : null}

      {applied?.result ? (
        <section className="admin-card mt-6" aria-labelledby="import-result">
          <h2 id="import-result" className="font-display text-lg font-bold">
            {applied.result.failed.length === 0
              ? fill(labels.done, { n: applied.result.saved })
              : fill(labels.doneWithErrors, { n: applied.result.saved, f: applied.result.failed.length })}
          </h2>
          {applied.result.failed.length > 0 ? (
            <>
              <h3 className="mt-4 text-sm font-semibold">{labels.failedTitle}</h3>
              <ul className="admin-import-errors">
                {applied.result.failed.map((f) => (
                  <li key={f.line}>
                    {fill(labels.line, { n: f.line })}, {f.title}: {f.message}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          <p className="mt-4">
            <a href={listHref} className="btn btn-line btn-small">
              {labels.back}
            </a>
          </p>
        </section>
      ) : null}
    </>
  );
}
