"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import Icon from "@/components/admin/Icon";
import type { Lang } from "@/content/types";
import { langOrder, pairStatus, type TranslationStatus } from "@/lib/i18n";

// Isian dua bahasa gaya OJS: bahasa utama tampil lebih dulu, bahasa lain dibuka lewat tombol
// globe per isian atau tab bahasa di atas formulir. Warna globe menunjukkan kelengkapan:
// hijau semua bahasa terisi, merah terjemahan belum lengkap, abu-abu belum diisi.

export type LangModeLabels = {
  bar: string;
  primarySuffix: string;
  status: Record<TranslationStatus, string>;
  show: string;
  hide: string;
};

type LangMode = { primary: Lang; translate: boolean };
const LangModeContext = createContext<LangMode>({ primary: "id", translate: false });

export function useLangMode(): LangMode {
  return useContext(LangModeContext);
}

// Tab bahasa di atas formulir. Tab bahasa utama: hanya bahasa utama. Tab bahasa lain:
// semua isian dua bahasa tampil berdampingan untuk diterjemahkan.
export function LangModeProvider({
  primary,
  names,
  labels,
  showBar,
  children,
}: {
  primary: Lang;
  names: Record<Lang, string>;
  labels: LangModeLabels;
  showBar: boolean;
  children: ReactNode;
}) {
  const [translate, setTranslate] = useState(false);
  return (
    <LangModeContext.Provider value={{ primary, translate }}>
      {showBar ? (
        <div className="admin-langbar" role="group" aria-label={labels.bar}>
          <span className="admin-langbar-label">{labels.bar}</span>
          {langOrder(primary).map((lang) => (
            <button
              key={lang}
              type="button"
              aria-pressed={lang === primary ? !translate : translate}
              onClick={() => setTranslate(lang !== primary)}
            >
              {names[lang]}
              {lang === primary ? <span className="admin-langbar-tag">{labels.primarySuffix}</span> : null}
            </button>
          ))}
        </div>
      ) : null}
      {children}
    </LangModeContext.Provider>
  );
}

// Tombol globe: warna menunjukkan status terjemahan, klik membuka atau menutup bahasa lain.
export function GlobeButton({
  status,
  open,
  otherName,
  controls,
  labels,
  onToggle,
  small,
}: {
  small?: boolean;
  status: TranslationStatus;
  open: boolean;
  otherName: string;
  controls: string;
  labels: LangModeLabels;
  onToggle: () => void;
}) {
  const action = (open ? labels.hide : labels.show).replace("{lang}", otherName);
  return (
    <button
      type="button"
      className={small ? "admin-globe admin-globe-sm" : "admin-globe"}
      data-status={status}
      aria-expanded={open}
      aria-controls={controls}
      aria-label={`${labels.status[status]}. ${action}`}
      title={`${labels.status[status]}. ${action}`}
      onClick={onToggle}
    >
      <Icon name="earth-asia" />
    </button>
  );
}

export type LocalizedValue = Record<Lang, string>;

// Satu isian teks dua bahasa (input satu baris atau textarea).
export function LocalizedInputs({
  name,
  id,
  value,
  multiline,
  rows,
  placeholder,
  names,
  labels,
  required,
  invalid,
}: {
  name: string;
  id: string;
  value: LocalizedValue;
  multiline: boolean;
  rows: number;
  placeholder: (lang: Lang) => string;
  names: Record<Lang, string>;
  labels: LangModeLabels;
  required?: boolean;
  invalid?: boolean;
}) {
  const { primary, translate } = useLangMode();
  const [current, setCurrent] = useState<LocalizedValue>(value);
  // Isian yang galat langsung terbuka supaya kesalahannya terlihat.
  const [expanded, setExpanded] = useState(invalid === true);
  const open = translate ? true : expanded;
  const order = langOrder(primary);
  const other = order[1];
  const status = pairStatus(current[primary], current[other]);

  return (
    <div className="admin-l10n" data-open={open ? "" : undefined}>
      {order.map((lang) => {
        const isPrimary = lang === primary;
        const fieldId = `${id}-${lang}`;
        const common = {
          id: fieldId,
          name: `${name}.${lang}`,
          className: "field",
          defaultValue: value[lang],
          placeholder: placeholder(lang),
          "aria-required": isPrimary ? required : undefined,
          "aria-invalid": invalid,
          onChange: (e: { target: { value: string } }) => setCurrent((c) => ({ ...c, [lang]: e.target.value })),
        };
        return (
          <div key={lang} id={`${fieldId}-cell`} className="admin-l10n-cell" hidden={isPrimary ? undefined : !open}>
            <label htmlFor={fieldId} className="admin-sublabel">
              {names[lang]}
              {isPrimary ? ` (${labels.primarySuffix})` : ""}
            </label>
            <div className="admin-l10n-row">
              {isPrimary ? (
                <GlobeButton
                  status={status}
                  open={open}
                  otherName={names[other]}
                  controls={`${id}-${other}-cell`}
                  labels={labels}
                  onToggle={() => setExpanded((v) => !v)}
                />
              ) : null}
              {multiline ? <textarea rows={rows} {...common} /> : <input {...common} />}
            </div>
          </div>
        );
      })}
    </div>
  );
}
