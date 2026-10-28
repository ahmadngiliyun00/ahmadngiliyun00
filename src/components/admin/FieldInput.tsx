"use client";

import type { Field, Option } from "@/content/fields";
import type { PartialDate } from "@/content/types";

export type FieldValue = string | { id: string; en: string } | PartialDate | string[] | boolean | null;
export type FieldLabels = {
  id: string;
  en: string;
  year: string;
  month: string;
  day: string;
  choose: string;
  currentFile: string;
  openFile: string;
  removeFile: string;
  required: string;
  placeholder: {
    write: string;
    writeId: string;
    writeEn: string;
    url: string;
    number: string;
    list: string;
    listEn: string;
    links: string;
    year: string;
    month: string;
    day: string;
    secretKeep: string;
    secretNew: string;
  };
};

// Label di tengah kalimat: huruf pertama dikecilkan, kecuali singkatan seperti "URL" atau "ID".
function inSentence(label: string): string {
  const second = label.charAt(1);
  if (second !== "" ? second === second.toUpperCase() : true) return label;
  return label.charAt(0).toLowerCase() + label.slice(1);
}

// Placeholder bawaan per jenis field. Field boleh memberi placeholder sendiri di collections.ts.
function placeholderFor(field: Field, labels: FieldLabels, part?: "id" | "en"): string {
  const ph = labels.placeholder;
  const name = inSentence(field.label);
  const own = field.placeholder;
  if (typeof own === "object") return own[part ?? "id"];
  if (part === undefined) {
    if (own) return own;
  } else if (own) {
    return part === "id" ? own : `${own} (English)`;
  }
  switch (field.type) {
    case "url":
      return ph.url;
    case "number":
      return field.min === undefined ? ph.number : `Contoh: ${field.min}`;
    case "list":
      return ph.list;
    case "links":
      return ph.links;
    case "localizedList":
      return part === "en" ? ph.listEn : ph.list;
    case "localized":
      return (part === "en" ? ph.writeEn : ph.writeId).replace("{label}", name);
    default:
      return ph.write.replace("{label}", name);
  }
}

// Satu field formulir CMS. raw = isian mentah dari percobaan simpan yang gagal (bila ada).
export default function FieldInput({
  field,
  value,
  raw,
  error,
  options,
  file,
  labels,
}: {
  field: Field;
  value: FieldValue;
  raw?: (name: string) => string[] | undefined;
  error?: string;
  options?: Option[];
  file?: { url: string; name: string } | null;
  labels: FieldLabels;
}) {
  const key = `f.${field.name}`;
  const id = `fld-${field.name.replace(/\./g, "-")}`;
  const helpId = field.help ? `${id}-help` : undefined;
  const errId = error ? `${id}-err` : undefined;
  const describedBy = [helpId, errId].filter((x) => x !== undefined).join(" ") || undefined;
  const invalid = error ? true : undefined;
  const one = (name: string, fallback: string) => raw?.(name)?.[0] ?? fallback;
  const str = typeof value === "string" ? value : "";
  const pair = value !== null ? (typeof value === "object" ? (value as { id?: string; en?: string }) : {}) : {};

  const required = field.required ? true : undefined;
  const label = (
    <span className="admin-label">
      {field.label}
      {field.required ? (
        <>
          <span className="admin-required" aria-hidden="true">
            {" *"}
          </span>
          <span className="sr-only"> ({labels.required})</span>
        </>
      ) : null}
    </span>
  );
  const foot = (
    <>
      {field.help ? (
        <p id={helpId} className="admin-help">
          {field.help}
        </p>
      ) : null}
      {error ? (
        <p id={errId} className="admin-field-error">
          {error}
        </p>
      ) : null}
    </>
  );

  switch (field.type) {
    case "text":
    case "url":
    case "number":
      return (
        <div className="admin-field">
          <label htmlFor={id}>{label}</label>
          <input
            id={id}
            name={key}
            type={field.type === "url" ? "text" : field.type === "number" ? "number" : "text"}
            inputMode={field.type === "url" ? "url" : undefined}
            step={field.type === "number" ? "any" : undefined}
            className="field"
            defaultValue={one(key, str)}
            placeholder={placeholderFor(field, labels)}
            aria-required={required}
            aria-invalid={invalid}
            aria-describedby={describedBy}
          />
          {foot}
        </div>
      );
    case "textarea":
    case "list":
    case "links":
      return (
        <div className="admin-field">
          <label htmlFor={id}>{label}</label>
          <textarea
            id={id}
            name={key}
            className="field"
            rows={field.type === "textarea" ? 4 : 5}
            defaultValue={one(key, str)}
            placeholder={placeholderFor(field, labels)}
            aria-required={required}
            aria-invalid={invalid}
            aria-describedby={describedBy}
          />
          {foot}
        </div>
      );
    case "localized":
    case "localizedList": {
      const multi = field.type === "localized" ? field.multiline === true : true;
      return (
        <fieldset className="admin-field" aria-describedby={describedBy}>
          <legend>{label}</legend>
          <div className="admin-pair">
            {(["id", "en"] as const).map((lang) => {
              const name = `${key}.${lang}`;
              const v = one(name, pair[lang] ?? "");
              return (
                <div key={lang} className="grid gap-1">
                  <label htmlFor={`${id}-${lang}`} className="admin-sublabel">
                    {labels[lang]}
                  </label>
                  {multi ? (
                    <textarea
                      id={`${id}-${lang}`}
                      name={name}
                      className="field"
                      rows={field.type === "localized" ? (field.rows ?? 3) : 5}
                      defaultValue={v}
                      placeholder={placeholderFor(field, labels, lang)}
                      aria-required={required}
                      aria-invalid={invalid}
                    />
                  ) : (
                    <input
                      id={`${id}-${lang}`}
                      name={name}
                      className="field"
                      defaultValue={v}
                      placeholder={placeholderFor(field, labels, lang)}
                      aria-required={required}
                      aria-invalid={invalid}
                    />
                  )}
                </div>
              );
            })}
          </div>
          {foot}
        </fieldset>
      );
    }
    case "boolean": {
      // Setelah simpan gagal, kotak yang tidak dicentang memang tidak terkirim, jadi raw menentukan.
      const checked = raw ? raw(key) !== undefined : value === true;
      return (
        <div className="admin-field admin-check">
          <label>
            <input type="checkbox" name={key} defaultChecked={checked} aria-describedby={describedBy} />
            {label}
          </label>
          {foot}
        </div>
      );
    }
    case "select":
    case "reference": {
      const list = field.type === "select" ? field.options : (options ?? []);
      return (
        <div className="admin-field">
          <label htmlFor={id}>{label}</label>
          <select
            id={id}
            name={key}
            className="field"
            defaultValue={one(key, str)}
            aria-required={required}
            aria-invalid={invalid}
            aria-describedby={describedBy}
          >
            <option value="">{labels.choose}</option>
            {list.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {foot}
        </div>
      );
    }
    case "multiselect": {
      const selected = raw?.(key) ?? (Array.isArray(value) ? value : []);
      return (
        <fieldset className="admin-field" aria-describedby={describedBy}>
          <legend>{label}</legend>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {field.options.map((o) => (
              <label key={o.value} className="admin-inline-check">
                <input type="checkbox" name={key} value={o.value} defaultChecked={selected.includes(o.value)} />
                {o.label}
              </label>
            ))}
          </div>
          {foot}
        </fieldset>
      );
    }
    case "date": {
      const d = (value ?? {}) as Partial<PartialDate>;
      const part = (k: "year" | "month" | "day") => one(`${key}.${k}`, d[k] === undefined ? "" : String(d[k]));
      return (
        <fieldset className="admin-field" aria-describedby={describedBy}>
          <legend>{label}</legend>
          <div className="admin-date">
            {(["year", "month", "day"] as const).map((k) => (
              <div key={k} className="grid gap-1">
                <label htmlFor={`${id}-${k}`} className="admin-sublabel">
                  {labels[k]}
                </label>
                <input
                  id={`${id}-${k}`}
                  name={`${key}.${k}`}
                  type="number"
                  inputMode="numeric"
                  min={k === "year" ? 1990 : 1}
                  max={k === "year" ? 2100 : k === "month" ? 12 : 31}
                  className="field"
                  defaultValue={part(k)}
                  placeholder={labels.placeholder[k]}
                  aria-required={required ? (k === "year" ? true : undefined) : undefined}
                  aria-invalid={invalid}
                />
              </div>
            ))}
          </div>
          {foot}
        </fieldset>
      );
    }
    case "secret":
      // value hanya penanda tersimpan (boolean); sandi lama tidak pernah dikirim ke browser.
      return (
        <div className="admin-field">
          <label htmlFor={id}>{label}</label>
          <input
            id={id}
            name={key}
            type="password"
            autoComplete="new-password"
            className="field"
            placeholder={value === true ? labels.placeholder.secretKeep : labels.placeholder.secretNew}
            aria-required={required}
            aria-invalid={invalid}
            aria-describedby={describedBy}
          />
          {foot}
        </div>
      );
    case "file":
      return (
        <div className="admin-field">
          <label htmlFor={id}>{label}</label>
          {file ? (
            <div className="admin-file">
              <span>
                {labels.currentFile}: {file.name}
              </span>
              <a href={file.url} target="_blank" rel="noopener noreferrer" className="link text-sm">
                {labels.openFile}
              </a>
              <label className="admin-inline-check">
                <input type="checkbox" name="removeFile" />
                {labels.removeFile}
              </label>
              <input type="hidden" name={key} value={str} />
            </div>
          ) : null}
          <input
            id={id}
            name="upload"
            type="file"
            accept="application/pdf,image/png,image/jpeg,image/webp"
            className="admin-file-input"
            aria-invalid={invalid}
            aria-describedby={describedBy}
          />
          {foot}
        </div>
      );
  }
}
