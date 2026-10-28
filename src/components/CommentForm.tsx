"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { toast } from "@/components/Toaster";
import { useTurnstile } from "@/components/useTurnstile";
import type { CommentLabels, Lang } from "@/data/profile";
import type { CommentField, CommentFormError, CommentState } from "@/lib/comment";
import type { ContactFieldError } from "@/lib/contact";
import { postComment } from "@/server/comment-action";

const INITIAL: CommentState = { status: "idle" };
const ORDER: CommentField[] = ["name", "email", "body"];

function fieldMessage(field: CommentField, code: ContactFieldError, e: CommentLabels["errors"]): string {
  if (code === "tooLong") return e.tooLong;
  if (code === "tooManyLinks") return e.tooManyLinks;
  if (code === "invalidEmail") return e.emailInvalid;
  if (code === "tooShort") return e.bodyTooShort;
  if (field === "name") return e.nameRequired;
  if (field === "email") return e.emailRequired;
  return e.bodyRequired;
}

function formMessage(code: CommentFormError, e: CommentLabels["errors"]): string {
  if (code === "captcha") return e.captcha;
  if (code === "tooMany") return e.tooMany;
  if (code === "closed") return e.closed;
  return e.failed;
}

// Form komentar di halaman tulisan. Komentar masuk antrean persetujuan di CMS.
export default function CommentForm({ slug, lang, labels }: { slug: string; lang: Lang; labels: CommentLabels }) {
  const [state, action, pending] = useActionState(postComment, INITIAL);
  const [startedAt, setStartedAt] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const uid = useId();
  const { enabled: turnstileOn, widgetRef, reset: resetTurnstile } = useTurnstile(lang);
  const errors = state.status === "error" ? (state.errors ?? {}) : {};

  useEffect(() => {
    setStartedAt(String(Date.now()));
  }, []);

  // Hasil kiriman: toast, kosongkan form bila terkirim, fokus ke isian pertama yang salah,
  // dan minta token Turnstile baru (token sekali pakai).
  useEffect(() => {
    if (state.status !== "idle") resetTurnstile();
    if (state.status === "sent") {
      toast(labels.sent, "success");
      formRef.current?.reset();
      setStartedAt(String(Date.now()));
      return;
    }
    if (state.status !== "error") return;
    if (state.formError) toast(formMessage(state.formError, labels.errors), "error");
    const first = ORDER.find((f) => state.errors?.[f] !== undefined);
    if (first) document.getElementById(`${uid}-${first}`)?.focus();
  }, [state, uid, labels, resetTurnstile]);

  const describe = (f: CommentField) => (errors[f] === undefined ? undefined : `${uid}-${f}-err`);
  const errorText = (f: CommentField) => {
    const code = errors[f];
    return code === undefined ? null : (
      <p id={`${uid}-${f}-err`} className="field-error">
        {fieldMessage(f, code, labels.errors)}
      </p>
    );
  };

  return (
    <form ref={formRef} action={action} className="comment-form" noValidate>
      <h3 className="comment-form-title">{labels.formTitle}</h3>
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="startedAt" value={startedAt} />
      <div className="hp" aria-hidden="true">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid content-start gap-2">
          <label htmlFor={`${uid}-name`} className="text-sm text-muted">
            {labels.name}
          </label>
          <input
            id={`${uid}-name`}
            name="name"
            className="field"
            autoComplete="name"
            maxLength={80}
            required
            placeholder={labels.namePlaceholder}
            aria-invalid={errors.name === undefined ? undefined : true}
            aria-describedby={describe("name")}
          />
          {errorText("name")}
        </div>
        <div className="grid content-start gap-2">
          <label htmlFor={`${uid}-email`} className="text-sm text-muted">
            {labels.email}
          </label>
          <input
            id={`${uid}-email`}
            name="email"
            type="email"
            inputMode="email"
            className="field"
            autoComplete="email"
            maxLength={190}
            required
            placeholder={labels.emailPlaceholder}
            aria-invalid={errors.email === undefined ? undefined : true}
            aria-describedby={describe("email") ?? `${uid}-email-note`}
          />
          <p id={`${uid}-email-note`} className="text-xs text-muted">
            {labels.emailNote}
          </p>
          {errorText("email")}
        </div>
      </div>

      <div className="grid gap-2">
        <label htmlFor={`${uid}-body`} className="text-sm text-muted">
          {labels.body}
        </label>
        <textarea
          id={`${uid}-body`}
          name="body"
          className="field min-h-32 resize-y"
          maxLength={2000}
          required
          placeholder={labels.bodyPlaceholder}
          aria-invalid={errors.body === undefined ? undefined : true}
          aria-describedby={describe("body")}
        />
        {errorText("body")}
      </div>

      {turnstileOn ? <div ref={widgetRef} className="min-h-[65px]" /> : null}

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <button type="submit" className="btn btn-solid" disabled={pending} aria-disabled={pending}>
          {pending ? labels.sending : labels.send}
        </button>
        <p className="text-sm text-muted">{labels.moderation}</p>
      </div>
    </form>
  );
}
