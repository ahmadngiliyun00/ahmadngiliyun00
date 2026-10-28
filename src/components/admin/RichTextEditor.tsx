"use client";

import Image from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extensions";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useRef, useState } from "react";
import { uploadInlineImageAction } from "@/app/(admin)/admin/actions";
import Icon from "@/components/admin/Icon";
import { toast } from "@/components/Toaster";

export type RichTextLabels = {
  toolbar: string;
  paragraph: string;
  h2: string;
  h3: string;
  bold: string;
  italic: string;
  underline: string;
  strike: string;
  link: string;
  bulletList: string;
  orderedList: string;
  quote: string;
  code: string;
  rule: string;
  image: string;
  undo: string;
  redo: string;
  linkUrl: string;
  linkPlaceholder: string;
  linkInvalid: string;
  apply: string;
  unlink: string;
  alt: string;
  altPlaceholder: string;
  uploading: string;
  uploaded: string;
  uploadFailed: string;
  copyFrom: string;
  copyConfirm: string;
};

// Gambar diperkecil di browser sebelum diunggah: lebar maksimal 1600 px, WebP (atau JPEG di
// browser yang tidak bisa membuat WebP). Foto ponsel 4 MB biasanya menjadi 200 sampai 400 KB.
const MAX_WIDTH = 1600;
const KEEP_BELOW = 400 * 1024;

async function shrink(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_WIDTH / bitmap.width);
  if (scale === 1) {
    if (file.size <= KEEP_BELOW) return file;
  }
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const encode = (type: string) => new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.85));
  const webp = await encode("image/webp");
  const blob = webp?.type === "image/webp" ? webp : await encode("image/jpeg");
  if (blob === null) return file;
  return blob.size < file.size ? blob : file;
}

function imageFiles(list: FileList | null | undefined): File[] {
  return [...(list ?? [])].filter((f) => /^image\/(png|jpeg|webp)$/.test(f.type));
}

// Satu editor rich text untuk satu bahasa. Isinya ikut terkirim bersama formulir lewat
// event "formdata", jadi tidak bergantung pada input tersembunyi yang bisa direset React.
export default function RichTextEditor({
  name,
  initial,
  placeholder,
  labels,
  invalid,
  labelledBy,
  onReady,
}: {
  name: string;
  initial: string;
  placeholder: string;
  labels: RichTextLabels;
  invalid?: boolean;
  labelledBy: string;
  onReady?: (editor: Editor) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<(files: File[]) => void>(() => {});
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkValue, setLinkValue] = useState("");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        // https dan mailto sudah dikenali linkify secara bawaan. Mendaftarkannya lagi lewat
        // "protocols" memicu peringatan karena satu halaman punya dua editor (ID dan EN).
        // Skema tautan tetap dibatasi sanitizer saat disimpan.
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
      Image.configure({ allowBase64: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: initial,
    editorProps: {
      attributes: {
        class: "rte-content",
        role: "textbox",
        "aria-multiline": "true",
        "aria-labelledby": labelledBy,
        ...(invalid ? { "aria-invalid": "true" } : {}),
      },
      // Gambar yang ditempel atau diseret ikut diunggah, bukan disimpan sebagai base64.
      handlePaste: (_view, event) => {
        const files = imageFiles(event.clipboardData?.files);
        if (files.length === 0) return false;
        uploadRef.current(files);
        return true;
      },
      handleDrop: (_view, event, _slice, moved) => {
        if (moved) return false;
        const files = imageFiles((event as DragEvent).dataTransfer?.files);
        if (files.length === 0) return false;
        event.preventDefault();
        uploadRef.current(files);
        return true;
      },
    },
  });

  const state = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            p: e.isActive("paragraph"),
            h2: e.isActive("heading", { level: 2 }),
            h3: e.isActive("heading", { level: 3 }),
            bold: e.isActive("bold"),
            italic: e.isActive("italic"),
            underline: e.isActive("underline"),
            strike: e.isActive("strike"),
            link: e.isActive("link"),
            bullet: e.isActive("bulletList"),
            ordered: e.isActive("orderedList"),
            quote: e.isActive("blockquote"),
            code: e.isActive("codeBlock"),
            image: e.isActive("image"),
            alt: String(e.getAttributes("image").alt ?? ""),
            undo: e.can().undo(),
            redo: e.can().redo(),
          }
        : null,
  });

  useEffect(() => {
    if (editor) onReady?.(editor);
  }, [editor, onReady]);

  // Isi editor dimasukkan ke FormData saat formulir dikirim.
  useEffect(() => {
    const form = wrapRef.current?.closest("form");
    if (!form) return;
    const onData = (e: FormDataEvent) => {
      if (editor) e.formData.set(name, editor.getHTML());
    };
    form.addEventListener("formdata", onData);
    return () => form.removeEventListener("formdata", onData);
  }, [editor, name]);

  uploadRef.current = (files: File[]) => {
    if (!editor) return;
    const form = wrapRef.current?.closest("form");
    const entryId = form?.querySelector<HTMLInputElement>('input[name="id"]')?.value ?? "";
    for (const file of files) {
      toast(labels.uploading, "info");
      void (async () => {
        try {
          const blob = await shrink(file);
          const data = new FormData();
          data.set("file", blob, file.name);
          data.set("entryId", entryId);
          const res = await uploadInlineImageAction(data);
          if (!res.ok) {
            toast(res.message, "error");
            return;
          }
          editor.chain().focus().setImage({ src: res.url, alt: "" }).run();
          toast(labels.uploaded, "success");
        } catch {
          toast(labels.uploadFailed, "error");
        }
      })();
    }
  };

  const openLink = () => {
    if (!editor) return;
    setLinkValue(String(editor.getAttributes("link").href ?? ""));
    setLinkOpen((v) => !v);
  };

  const applyLink = () => {
    if (!editor) return;
    const href = linkValue.trim();
    if (href === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setLinkOpen(false);
      return;
    }
    if (!/^(https:\/\/|mailto:|\/|#)/.test(href)) {
      toast(labels.linkInvalid, "error");
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
    setLinkOpen(false);
  };

  const btn = (label: string, icon: string, active: boolean | undefined, run: () => void, disabled = false) => (
    <button
      type="button"
      className="rte-btn"
      aria-label={label}
      title={label}
      aria-pressed={active === undefined ? undefined : active}
      disabled={disabled ? true : editor === null}
      onMouseDown={(e) => e.preventDefault()}
      onClick={run}
    >
      {icon.startsWith("fa:") ? <Icon name={icon.slice(3)} /> : <span className="rte-btn-text">{icon}</span>}
    </button>
  );

  const chain = () => editor?.chain().focus();

  return (
    <div ref={wrapRef} className="rte" data-invalid={invalid ? "" : undefined}>
      <div className="rte-toolbar" role="toolbar" aria-label={labels.toolbar}>
        <div className="rte-group">
          {btn(labels.paragraph, "P", state?.p, () => chain()?.setParagraph().run())}
          {btn(labels.h2, "H2", state?.h2, () => chain()?.toggleHeading({ level: 2 }).run())}
          {btn(labels.h3, "H3", state?.h3, () => chain()?.toggleHeading({ level: 3 }).run())}
        </div>
        <div className="rte-group">
          {btn(labels.bold, "fa:bold", state?.bold, () => chain()?.toggleBold().run())}
          {btn(labels.italic, "fa:italic", state?.italic, () => chain()?.toggleItalic().run())}
          {btn(labels.underline, "fa:underline", state?.underline, () => chain()?.toggleUnderline().run())}
          {btn(labels.strike, "fa:strikethrough", state?.strike, () => chain()?.toggleStrike().run())}
          {btn(labels.link, "fa:link", state?.link ? true : linkOpen, openLink)}
        </div>
        <div className="rte-group">
          {btn(labels.bulletList, "fa:list-ul", state?.bullet, () => chain()?.toggleBulletList().run())}
          {btn(labels.orderedList, "fa:list-ol", state?.ordered, () => chain()?.toggleOrderedList().run())}
          {btn(labels.quote, "fa:quote-left", state?.quote, () => chain()?.toggleBlockquote().run())}
          {btn(labels.code, "fa:code", state?.code, () => chain()?.toggleCodeBlock().run())}
          {btn(labels.rule, "fa:minus", undefined, () => chain()?.setHorizontalRule().run())}
        </div>
        <div className="rte-group">
          {btn(labels.image, "fa:image", undefined, () => fileRef.current?.click())}
        </div>
        <div className="rte-group rte-group-end">
          {btn(labels.undo, "fa:rotate-left", undefined, () => chain()?.undo().run(), state ? !state.undo : true)}
          {btn(labels.redo, "fa:rotate-right", undefined, () => chain()?.redo().run(), state ? !state.redo : true)}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          hidden
          onChange={(e) => {
            uploadRef.current(imageFiles(e.currentTarget.files));
            e.currentTarget.value = "";
          }}
        />
      </div>

      {linkOpen ? (
        <div className="rte-bar">
          <label className="rte-bar-label" htmlFor={`${name}-link`}>
            {labels.linkUrl}
          </label>
          <input
            id={`${name}-link`}
            className="field"
            value={linkValue}
            placeholder={labels.linkPlaceholder}
            onChange={(e) => setLinkValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyLink();
              }
            }}
            autoFocus
          />
          <button type="button" className="btn btn-solid btn-small" onClick={applyLink}>
            {labels.apply}
          </button>
          {state?.link ? (
            <button
              type="button"
              className="btn btn-line btn-small"
              onClick={() => {
                chain()?.extendMarkRange("link").unsetLink().run();
                setLinkOpen(false);
              }}
            >
              {labels.unlink}
            </button>
          ) : null}
        </div>
      ) : null}

      {state?.image ? (
        <div className="rte-bar">
          <label className="rte-bar-label" htmlFor={`${name}-alt`}>
            {labels.alt}
          </label>
          <input
            id={`${name}-alt`}
            className="field"
            value={state.alt}
            placeholder={labels.altPlaceholder}
            onChange={(e) => editor?.chain().updateAttributes("image", { alt: e.target.value }).run()}
          />
        </div>
      ) : null}

      <EditorContent editor={editor} />
    </div>
  );
}
