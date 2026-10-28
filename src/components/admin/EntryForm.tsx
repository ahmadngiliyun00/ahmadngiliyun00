"use client";

import { useActionState, useEffect, useRef } from "react";
import type { FormState } from "@/app/(admin)/admin/actions";
import { toast } from "@/components/Toaster";
import FieldInput, { type FieldLabels, type FieldValue } from "@/components/admin/FieldInput";
import { fieldWidth, type Field, type Option } from "@/content/fields";

export interface EntryFormLabels extends FieldLabels {
  meta: string;
  visibility: string;
  visibilityPublic: string;
  visibilityPrivate: string;
  slug: string;
  slugHelp: string;
  position: string;
  positionHelp: string;
  save: string;
  saving: string;
  saved: string;
  errorsTitle: string;
  requiredNote: string;
  slugPlaceholder: string;
}

// Formulir generik untuk satu data koleksi atau satu pengaturan.
// meta = null untuk pengaturan (tanpa slug, status, dan urutan).
export default function EntryForm({
  action,
  hidden,
  fields,
  values,
  meta,
  references,
  file,
  labels,
}: {
  action: (state: FormState, form: FormData) => Promise<FormState>;
  hidden: Record<string, string>;
  fields: Field[];
  values: Record<string, FieldValue>;
  meta: { slug: string; visibility: "public" | "private"; position: number } | null;
  references?: Record<string, Option[]>;
  file?: { url: string; name: string } | null;
  labels: EntryFormLabels;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, undefined);
  const raw = state?.values ? (name: string) => state.values?.[name] : undefined;
  const errors = state?.errors ?? {};
  const formRef = useRef<HTMLFormElement>(null);

  // Hasil simpan tampil sebagai toast. Bila gagal, isian pertama yang salah langsung difokus;
  // pesan per isian tetap tampil di bawah isiannya.
  useEffect(() => {
    if (state === undefined) return;
    if (state.ok) {
      toast(labels.saved, "success");
      return;
    }
    const list = Object.values(state.errors ?? {});
    toast(state.message ?? labels.errorsTitle, "error", list);
    const first = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
    first?.focus();
  }, [state, labels.saved, labels.errorsTitle]);

  return (
    <form ref={formRef} action={formAction} className="admin-form" noValidate>
      {Object.entries(hidden).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}

      {meta ? (
        <fieldset className="admin-card admin-meta">
          <legend>{labels.meta}</legend>
          <div className="admin-field">
            <span className="admin-label">{labels.visibility}</span>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {(["public", "private"] as const).map((v) => (
                <label key={v} className="admin-inline-check">
                  <input
                    type="radio"
                    name="visibility"
                    value={v}
                    defaultChecked={(raw?.("visibility")?.[0] ?? meta.visibility) === v}
                  />
                  {v === "public" ? labels.visibilityPublic : labels.visibilityPrivate}
                </label>
              ))}
            </div>
          </div>
          <div className="admin-meta-grid">
            <div className="admin-field">
              <label htmlFor="fld-slug">
                <span className="admin-label">{labels.slug}</span>
              </label>
              <input
                id="fld-slug"
                name="slug"
                className="field"
                defaultValue={raw?.("slug")?.[0] ?? meta.slug}
                placeholder={labels.slugPlaceholder}
                aria-invalid={errors.slug ? true : undefined}
                aria-describedby="fld-slug-help"
              />
              <p id="fld-slug-help" className="admin-help">
                {labels.slugHelp}
              </p>
              {errors.slug ? <p className="admin-field-error">{errors.slug}</p> : null}
            </div>
            <div className="admin-field">
              <label htmlFor="fld-position">
                <span className="admin-label">{labels.position}</span>
              </label>
              <input
                id="fld-position"
                name="position"
                type="number"
                className="field"
                defaultValue={raw?.("position")?.[0] ?? String(meta.position)}
                placeholder="0"
                aria-describedby="fld-position-help"
              />
              <p id="fld-position-help" className="admin-help">
                {labels.positionHelp}
              </p>
            </div>
          </div>
        </fieldset>
      ) : null}

      {fields.some((f) => f.required) ? (
        <p className="admin-help">
          {labels.requiredNote.split("{mark}")[0]}
          <span className="admin-required">*</span>
          {labels.requiredNote.split("{mark}")[1]}
        </p>
      ) : null}

      <div className="admin-card admin-fields">
        {fields.map((field) => (
          <div key={field.name} className="admin-cell" data-w={fieldWidth(field)}>
            <FieldInput
              field={field}
              value={values[field.name] ?? null}
              raw={raw}
              error={errors[field.name]}
              options={field.type === "reference" ? references?.[field.collection] : undefined}
              file={field.type === "file" ? file : undefined}
              labels={labels}
            />
          </div>
        ))}
      </div>

      <div className="admin-actions">
        <button type="submit" className="btn btn-solid" disabled={pending}>
          {pending ? labels.saving : labels.save}
        </button>
      </div>
    </form>
  );
}
