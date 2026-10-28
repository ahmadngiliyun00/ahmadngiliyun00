"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { useLocalTime } from "@/components/LiveClock";
import { toast } from "@/components/Toaster";
import { useTurnstile } from "@/components/useTurnstile";
import type { Lang } from "@/data/profile";
import type { ContactField, ContactFieldError, ContactFormError, ContactState } from "@/lib/contact";
import { sendContactMessage } from "@/server/contact-action";

// Form kontak: pesan dikirim ke server, disimpan di kotak masuk CMS, dan diteruskan ke email
// Mas Ilyun. Pengunjung wajib mengisi emailnya supaya balasan bisa dikirim.

export type ContactLabels = {
  formTitle: string;
  name: string;
  namePlaceholder: string;
  emailField: string;
  emailPlaceholder: string;
  topic: string;
  otherTopic: string;
  message: string;
  messagePlaceholder: string;
  send: string;
  sending: string;
  sendNote: string;
  emailLabel: string;
  copy: string;
  copied: string;
  localTime: string;
  sentTitle: string;
  sentBody: string;
  sendAnother: string;
  errors: {
    nameRequired: string;
    emailRequired: string;
    emailInvalid: string;
    topicRequired: string;
    bodyRequired: string;
    bodyTooShort: string;
    tooLong: string;
    tooManyLinks: string;
    captcha: string;
    tooMany: string;
    failed: string;
  };
};

const INITIAL: ContactState = { status: "idle" };
const FIELD_ORDER: ContactField[] = ["name", "email", "topic", "body"];

function fieldMessage(field: ContactField, code: ContactFieldError, e: ContactLabels["errors"]): string {
  if (code === "tooLong") return e.tooLong;
  if (code === "tooManyLinks") return e.tooManyLinks;
  if (code === "invalidEmail") return e.emailInvalid;
  if (code === "tooShort") return e.bodyTooShort;
  if (field === "name") return e.nameRequired;
  if (field === "email") return e.emailRequired;
  if (field === "topic") return e.topicRequired;
  return e.bodyRequired;
}

function formMessage(code: ContactFormError, e: ContactLabels["errors"]): string {
  if (code === "captcha") return e.captcha;
  if (code === "tooMany") return e.tooMany;
  return e.failed;
}

export default function ContactPanel({
  lang,
  user,
  domain,
  topics,
  labels,
  timeZone,
  zoneLabel,
}: {
  lang: Lang;
  user: string;
  domain: string;
  topics: { title: string; note: string }[]; // jenis kerja sama dari CMS; note tampil di bawah pilihan
  labels: ContactLabels;
  timeZone: string;
  zoneLabel: string;
}) {
  const uid = useId();
  const [state, formAction, pending] = useActionState(sendContactMessage, INITIAL);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [topic, setTopic] = useState(topics[0]?.title ?? labels.otherTopic);
  const [body, setBody] = useState("");
  const [startedAt, setStartedAt] = useState("");
  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied] = useState(false);
  const time = useLocalTime(lang, timeZone);

  const errors = state.status === "error" ? (state.errors ?? {}) : {};
  const sent = state.status === "sent" ? !dismissed : false;
  const { enabled: turnstileOn, widgetRef, reset: resetTurnstile } = useTurnstile(lang, !sent);

  // Alamat email dirakit di peramban supaya tidak tertulis utuh di HTML.
  useEffect(() => {
    setEmail(`${user}@${domain}`);
  }, [user, domain]);

  // Waktu form mulai ditampilkan, untuk jebakan waktu di server.
  useEffect(() => {
    if (startedAt === "") setStartedAt(String(Date.now()));
  }, [startedAt]);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 2200);
    return () => window.clearTimeout(id);
  }, [copied]);

  // Setelah setiap kiriman: tampilkan hasil baru, kosongkan isi pesan bila terkirim,
  // fokuskan kolom pertama yang salah, dan minta token Turnstile baru (token sekali pakai).
  useEffect(() => {
    setDismissed(false);
    if (state.status === "sent") setBody("");
    if (state.status === "error") {
      const first = FIELD_ORDER.find((f) => state.errors?.[f] !== undefined);
      if (first) document.getElementById(`${uid}-${first}`)?.focus();
    }
    resetTurnstile();
  }, [state, uid, resetTurnstile]);

  // Galat umum (captcha, terlalu sering, gagal kirim) tampil sebagai toast, sekali per kiriman.
  // Teksnya dihitung di luar efek supaya efek di atas tidak ikut berjalan ulang
  // bila objek label berganti tanpa ada kiriman baru.
  const formErrorText = state.status === "error" ? (state.formError ? formMessage(state.formError, labels.errors) : "") : "";
  useEffect(() => {
    if (formErrorText !== "") toast(formErrorText, "error");
  }, [state, formErrorText]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const allTopics = [...topics.map((t) => t.title), labels.otherTopic];
  const topicNote = topics.find((t) => t.title === topic)?.note ?? "";
  const describe = (field: ContactField) => (errors[field] === undefined ? undefined : `${uid}-${field}-error`);
  const errorText = (field: ContactField) => {
    const code = errors[field];
    if (code === undefined) return null;
    return (
      <p id={`${uid}-${field}-error`} className="field-error">
        {fieldMessage(field, code, labels.errors)}
      </p>
    );
  };

  return (
    <div className="contact-panel">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
        <div>
          <p className="text-sm text-muted">{labels.emailLabel}</p>
          <p className="mt-1 font-display text-xl font-semibold tracking-tight sm:text-2xl">
            {email === "" ? (
              <span className="text-muted">{user} [at] {domain}</span>
            ) : (
              <a className="link" href={`mailto:${email}`}>
                {email}
              </a>
            )}
          </p>
        </div>
        <button type="button" className="btn btn-line btn-small" onClick={onCopy}>
          {copied ? labels.copied : labels.copy}
        </button>
        <span className="sr-only" aria-live="polite">
          {copied ? labels.copied : ""}
        </span>
      </div>

      <div aria-live="polite">
        {sent ? (
          <div className="contact-sent mt-6" role="status">
            <h3 className="font-display text-xl font-bold tracking-tight">{labels.sentTitle}</h3>
            <p className="mt-2 text-muted">
              {labels.sentBody
                .replace("{name}", state.status === "sent" ? state.name : "")
                .replace("{email}", state.status === "sent" ? state.email : "")}
            </p>
            <button
              type="button"
              className="btn btn-line btn-small mt-5"
              onClick={() => {
                setDismissed(true);
                setStartedAt("");
              }}
            >
              {labels.sendAnother}
            </button>
          </div>
        ) : null}
      </div>

      {sent ? null : (
        <form className="mt-6 grid gap-5" action={formAction} noValidate>
          <h3 className="font-display text-xl font-bold tracking-tight">{labels.formTitle}</h3>
          <input type="hidden" name="lang" value={lang} />
          <input type="hidden" name="startedAt" value={startedAt} />

          {/* Kolom jebakan: tidak terlihat oleh manusia, biasanya diisi robot. */}
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
                type="text"
                autoComplete="name"
                maxLength={120}
                required
                placeholder={labels.namePlaceholder}
                value={name}
                aria-invalid={errors.name === undefined ? undefined : true}
                aria-describedby={describe("name")}
                onChange={(e) => setName(e.target.value)}
              />
              {errorText("name")}
            </div>
            <div className="grid content-start gap-2">
              <label htmlFor={`${uid}-email`} className="text-sm text-muted">
                {labels.emailField}
              </label>
              <input
                id={`${uid}-email`}
                name="email"
                className="field"
                type="email"
                inputMode="email"
                autoComplete="email"
                maxLength={190}
                required
                placeholder={labels.emailPlaceholder}
                value={senderEmail}
                aria-invalid={errors.email === undefined ? undefined : true}
                aria-describedby={describe("email")}
                onChange={(e) => setSenderEmail(e.target.value)}
              />
              {errorText("email")}
            </div>
          </div>

          <fieldset
            className="grid gap-2"
            aria-describedby={[describe("topic"), topicNote === "" ? undefined : `${uid}-topic-note`].filter(Boolean).join(" ") || undefined}
          >
            <legend className="mb-2 text-sm text-muted">{labels.topic}</legend>
            <div className="flex flex-wrap gap-2">
              {allTopics.map((t, i) => (
                <label key={t} className="chip">
                  <input
                    id={i === 0 ? `${uid}-topic` : undefined}
                    type="radio"
                    name="topic"
                    value={t}
                    checked={topic === t}
                    onChange={() => setTopic(t)}
                  />
                  <span>{t}</span>
                </label>
              ))}
            </div>
            {topicNote === "" ? null : (
              <p id={`${uid}-topic-note`} className="topic-note">
                {topicNote}
              </p>
            )}
            {errorText("topic")}
          </fieldset>

          <div className="grid gap-2">
            <label htmlFor={`${uid}-body`} className="text-sm text-muted">
              {labels.message}
            </label>
            <textarea
              id={`${uid}-body`}
              name="body"
              className="field min-h-32 resize-y"
              maxLength={5000}
              required
              placeholder={labels.messagePlaceholder}
              value={body}
              aria-invalid={errors.body === undefined ? undefined : true}
              aria-describedby={describe("body") ?? `${uid}-note`}
              onChange={(e) => setBody(e.target.value)}
            />
            {errorText("body")}
          </div>

          {turnstileOn ? <div ref={widgetRef} className="min-h-[65px]" /> : null}

          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <button type="submit" className="btn btn-solid" disabled={pending} aria-disabled={pending}>
              {pending ? labels.sending : labels.send}
            </button>
            <p id={`${uid}-note`} className="max-w-[44ch] text-sm text-muted">
              {labels.sendNote}
            </p>
          </div>
        </form>
      )}

      <p className="mt-8 flex items-center gap-2.5 border-t border-line pt-5 text-sm text-muted">
        <span className="pulse-dot" aria-hidden="true" />
        <span>
          {labels.localTime.replace("{time}", time)} ({zoneLabel})
        </span>
      </p>
    </div>
  );
}
