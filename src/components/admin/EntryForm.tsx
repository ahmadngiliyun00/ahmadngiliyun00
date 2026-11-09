"use client";

import { useActionState, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormState } from "@/app/(admin)/admin/actions";
import { toast } from "@/components/Toaster";
import FieldInput, { type FieldLabels, type FieldValue } from "@/components/admin/FieldInput";
import FieldTabs from "@/components/admin/FieldTabs";
import { LangModeProvider } from "@/components/admin/LangMode";
import { RICH_TEXT_CHANGE } from "@/components/admin/RichTextEditor";
import { fieldVisible, fieldWidth, type Field, type Option } from "@/content/fields";
import type { Lang } from "@/content/types";

const LOCALIZED: Field["type"][] = ["localized", "localizedList", "richtext"];

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
  primary = "id",
}: {
  action: (state: FormState, form: FormData) => Promise<FormState>;
  hidden: Record<string, string>;
  fields: Field[];
  values: Record<string, FieldValue>;
  meta: { slug: string; visibility: "public" | "private"; position: number } | null;
  references?: Record<string, Option[]>;
  file?: { url: string; name: string } | null;
  labels: EntryFormLabels;
  primary?: Lang;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, undefined);
  const raw = state?.values ? (name: string) => state.values?.[name] : undefined;
  const errors = state?.errors ?? {};
  const formRef = useRef<HTMLFormElement>(null);

  // Isian bersyarat (showWhen, src/lib/conditions.ts). Nilai isian pengendali dibaca ulang dari
  // formulir setiap ada perubahan, lalu isian yang tidak berlaku disembunyikan (hidden). Isian yang
  // tersembunyi tetap ada di formulir, jadi ketikannya kembali bila pilihannya dikembalikan.
  const controllers = useMemo(() => [...new Set(fields.flatMap((f) => (f.showWhen ? [f.showWhen.field] : [])))], [fields]);
  const [watched, setWatched] = useState<Record<string, unknown>>({});
  const sync = useCallback(() => {
    const form = formRef.current;
    if (form === null) return;
    if (controllers.length === 0) return;
    // new FormData juga memicu event formdata, jadi isi editor rich text ikut terbaca.
    const data = new FormData(form);
    const text = (key: string) => data.getAll(key).filter((v): v is string => typeof v === "string");
    const next: Record<string, unknown> = {};
    for (const name of controllers) {
      const field = fields.find((f) => f.name === name);
      const type = field?.type;
      if (type === "boolean") next[name] = text(`f.${name}`).includes("on");
      else if (type === "multiselect") next[name] = text(`f.${name}`);
      else if (type === "localized" || type === "localizedList" || type === "richtext") {
        next[name] = { id: text(`f.${name}.id`)[0] ?? "", en: text(`f.${name}.en`)[0] ?? "" };
      } else next[name] = text(`f.${name}`)[0] ?? "";
    }
    setWatched((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
  }, [controllers, fields]);
  // Saat dibuka dan setelah simpan (React mengatur ulang formulir dari nilai terakhir).
  useEffect(() => {
    sync();
  }, [sync, state]);
  // Listener bawaan peramban, bukan onChange React, supaya perubahan editor rich text (event
  // RICH_TEXT_CHANGE) juga terbaca. Hanya perubahan pada isian pengendali yang memicu sync.
  useEffect(() => {
    const form = formRef.current;
    if (form === null) return;
    if (controllers.length === 0) return;
    const prefixes = controllers.map((name) => `f.${name}`);
    const onEvent = (e: Event) => {
      const target = e.target as HTMLElement | null;
      const name = target?.getAttribute("name") ?? "";
      if (prefixes.some((p) => name === p || name.startsWith(`${p}.`))) sync();
    };
    form.addEventListener("input", onEvent);
    form.addEventListener("change", onEvent);
    form.addEventListener(RICH_TEXT_CHANGE, sync);
    return () => {
      form.removeEventListener("input", onEvent);
      form.removeEventListener("change", onEvent);
      form.removeEventListener(RICH_TEXT_CHANGE, sync);
    };
  }, [controllers, sync]);
  const visible = (field: Field) => fieldVisible(field, fields, (name) => (name in watched ? watched[name] : values[name]));

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

  function input(field: Field) {
    return (
      <FieldInput
        key={field.name}
        field={field}
        value={values[field.name] ?? null}
        raw={raw}
        error={errors[field.name]}
        options={field.type === "reference" ? references?.[field.collection] : undefined}
        file={field.type === "file" ? file : undefined}
        labels={labels}
      />
    );
  }

  // Isian di dalam tab yang juga bersyarat.
  function conditional(field: Field) {
    if (field.showWhen === undefined) return input(field);
    return (
      <div key={field.name} hidden={!visible(field)}>
        {input(field)}
      </div>
    );
  }

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

      <LangModeProvider
        primary={primary}
        names={{ id: labels.id, en: labels.en }}
        labels={labels.langMode}
        showBar={fields.some((f) => LOCALIZED.includes(f.type))}
      >
        <div className="admin-card admin-fields">
          {fields.map((field) => {
            // Isian bertab dirender di dalam FieldTabs milik select-nya.
            if (field.tab) return null;
            if (field.type === "select" ? field.tabs === true : false) {
              const members = fields.filter((f) => f.tab?.of === field.name);
              const options = field.type === "select" ? field.options : [];
              const errorTabs = options
                .map((o) => o.value)
                .filter((v) => members.some((m) => (m.tab?.show?.includes(v) ? errors[m.name] !== undefined : false)));
              const current = raw?.(`f.${field.name}`)?.[0] ?? values[field.name];
              return (
                <div key={field.name} className="admin-cell" data-w="full">
                  <FieldTabs
                    field={field}
                    value={typeof current === "string" ? current : ""}
                    errorTabs={errorTabs}
                    error={errors[field.name]}
                    panels={options.map((o) => ({
                      value: o.value,
                      children: members.filter((m) => m.tab?.show?.includes(o.value)).map((m) => conditional(m)),
                    }))}
                    shared={members.filter((m) => (m.tab?.show ?? []).length === 0).map((m) => conditional(m))}
                  />
                </div>
              );
            }
            return (
              <div key={field.name} className="admin-cell" data-w={fieldWidth(field)} hidden={!visible(field)}>
                {input(field)}
              </div>
            );
          })}
        </div>
      </LangModeProvider>

      <div className="admin-actions">
        <button type="submit" className="btn btn-solid" disabled={pending}>
          {pending ? labels.saving : labels.save}
        </button>
      </div>
    </form>
  );
}
