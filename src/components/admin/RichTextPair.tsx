"use client";

import type { Editor } from "@tiptap/react";
import { useCallback, useEffect, useState } from "react";
import { GlobeButton, useLangMode, type LangModeLabels } from "@/components/admin/LangMode";
import RichTextEditor, { type RichTextLabels } from "@/components/admin/RichTextEditor";
import type { Lang } from "@/content/types";
import { langOrder, pairStatus } from "@/lib/i18n";
import { htmlToText } from "@/lib/richtext";

type Pair = Record<Lang, string>;

function hasContent(html: string): boolean {
  return htmlToText(html) !== "" ? true : html.includes("<img");
}

// Dua editor rich text, bahasa utama lebih dulu. Editor bahasa lain dibuka lewat globe atau
// tab bahasa, bertumpuk karena isi panjang butuh lebar penuh. Bahasa lain bisa diisi awal
// dengan salinan bahasa utama untuk diterjemahkan.
export default function RichTextPair({
  name,
  id,
  value,
  placeholder,
  langLabels,
  labels,
  langMode,
  invalid,
}: {
  name: string;
  id: string;
  value: Pair;
  placeholder: Pair;
  langLabels: Pair;
  labels: RichTextLabels;
  langMode: LangModeLabels;
  invalid?: boolean;
}) {
  const { primary, translate } = useLangMode();
  const [main, other] = langOrder(primary);
  const [editors, setEditors] = useState<Partial<Record<Lang, Editor>>>({});
  const [filled, setFilled] = useState<Record<Lang, boolean>>({ id: hasContent(value.id), en: hasContent(value.en) });
  const [expanded, setExpanded] = useState(invalid === true);
  const open = translate ? true : expanded;

  const readyId = useCallback((e: Editor) => setEditors((cur) => (cur.id === e ? cur : { ...cur, id: e })), []);
  const readyEn = useCallback((e: Editor) => setEditors((cur) => (cur.en === e ? cur : { ...cur, en: e })), []);

  // Status globe mengikuti isi editor saat diketik.
  useEffect(() => {
    const offs: (() => void)[] = [];
    for (const lang of ["id", "en"] as const) {
      const ed = editors[lang];
      if (ed === undefined) continue;
      const update = () => setFilled((f) => ({ ...f, [lang]: hasContent(ed.getHTML()) }));
      ed.on("update", update);
      offs.push(() => ed.off("update", update));
    }
    return () => offs.forEach((off) => off());
  }, [editors]);

  const status = pairStatus(filled[main] ? "x" : "", filled[other] ? "x" : "");

  return (
    <div className="grid gap-5">
      {[main, other].map((lang) => {
        const isMain = lang === main;
        return (
          <div key={lang} id={`${id}-${lang}-cell`} className="grid gap-1" hidden={isMain ? undefined : !open}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                {isMain ? (
                  <GlobeButton
                    small
                    status={status}
                    open={open}
                    otherName={langLabels[other]}
                    controls={`${id}-${other}-cell`}
                    labels={langMode}
                    onToggle={() => setExpanded((v) => !v)}
                  />
                ) : null}
                <span id={`${id}-${lang}-label`} className="admin-sublabel">
                  {langLabels[lang]}
                  {isMain ? ` (${langMode.primarySuffix})` : ""}
                </span>
              </span>
              {isMain ? null : (
                <button
                  type="button"
                  className="btn btn-line btn-small"
                  onClick={() => {
                    const from = editors[main];
                    const to = editors[other];
                    if (from === undefined) return;
                    if (to === undefined) return;
                    if (!to.isEmpty) {
                      const ask = labels.copyConfirm.replace("{other}", langLabels[other]).replace("{lang}", langLabels[main]);
                      if (!window.confirm(ask)) return;
                    }
                    to.commands.setContent(from.getHTML(), { emitUpdate: true });
                    to.commands.focus("start");
                  }}
                >
                  {labels.copyFrom.replace("{lang}", langLabels[main])}
                </button>
              )}
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
        );
      })}
    </div>
  );
}
