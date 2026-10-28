"use client";

import type { Editor } from "@tiptap/react";
import { useCallback, useState } from "react";
import RichTextEditor, { type RichTextLabels } from "@/components/admin/RichTextEditor";

type Pair = { id: string; en: string };

// Dua editor rich text (Indonesia lalu Inggris), bertumpuk karena isi panjang butuh lebar penuh.
// Versi Inggris bisa diisi awal dengan salinan versi Indonesia untuk diterjemahkan.
export default function RichTextPair({
  name,
  id,
  value,
  placeholder,
  langLabels,
  labels,
  invalid,
}: {
  name: string;
  id: string;
  value: Pair;
  placeholder: Pair;
  langLabels: Pair;
  labels: RichTextLabels;
  invalid?: boolean;
}) {
  const [editors, setEditors] = useState<{ id?: Editor; en?: Editor }>({});
  const readyId = useCallback((e: Editor) => setEditors((cur) => (cur.id === e ? cur : { ...cur, id: e })), []);
  const readyEn = useCallback((e: Editor) => setEditors((cur) => (cur.en === e ? cur : { ...cur, en: e })), []);

  return (
    <div className="grid gap-5">
      {(["id", "en"] as const).map((lang) => (
        <div key={lang} className="grid gap-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span id={`${id}-${lang}-label`} className="admin-sublabel">
              {langLabels[lang]}
            </span>
            {lang === "en" ? (
              <button
                type="button"
                className="btn btn-line btn-small"
                onClick={() => {
                  const from = editors.id;
                  const to = editors.en;
                  if (from === undefined) return;
                  if (to === undefined) return;
                  if (!to.isEmpty) {
                    if (!window.confirm(labels.copyConfirm)) return;
                  }
                  to.commands.setContent(from.getHTML());
                  to.commands.focus("start");
                }}
              >
                {labels.copyFrom}
              </button>
            ) : null}
          </div>
          <RichTextEditor
            name={`${name}.${lang}`}
            initial={value[lang]}
            placeholder={placeholder[lang]}
            labels={labels}
            invalid={invalid}
            labelledBy={`${id}-${lang}-label`}
            onReady={lang === "id" ? readyId : readyEn}
          />
        </div>
      ))}
    </div>
  );
}
