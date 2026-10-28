"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { useLocalTime } from "@/components/LiveClock";
import type { Lang } from "@/data/profile";
import type { ContactField, ContactFieldError, ContactFormError, ContactState } from "@/lib/contact";
import { sendContactMessage } from "@/server/contact-action";

// Form kontak: pesan dikirim ke server, disimpan di kotak masuk CMS, dan diteruskan ke email
// Mas Ilyun. Pengunjung wajib mengisi emailnya supaya balasan bisa dikirim.

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
const TURNSTILE_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type Turnstile = {
  render: (el: HTMLElement, opts: { sitekey: string; theme: "dark"; language: string }) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
};
interface TurnstileWindow extends Window {
  turnstile?: Turnstile;
}

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
  topics: string[];
  labels: ContactLabels;
  timeZone: string;
  zoneLabel: string;
}) {
  const uid = useId();
  const [state, formAction, pending] = useActionState(sendContactMessage, INITIAL);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [topic, setTopic] = useState(topics[0] ?? labels.otherTopic);
  const [body, setBody] = useState("");
  const [startedAt, setStartedAt] = useState("");
  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const time = useLocalTime(lang, timeZone);

  const errors = state.status === "error" ? (state.errors ?? {}) : {};
  const formError = state.status === "error" ? state.formError : undefined;
  const sent = state.status === "sent" ? !dismissed : false;

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
    const ts = (window as TurnstileWindow).turnstile;
    if (ts) {
      if (widgetId.current) ts.reset(widgetId.current);
    }
  }, [state, uid]);

  // Cloudflare Turnstile hanya dimuat bila kunci situs diatur.
  useEffect(() => {
    if (TURNSTILE_SITE_KEY === "") return;
    if (sent) return;
    let cancelled = false;
    const mount = () => {
      const ts = (window as TurnstileWindow).turnstile;
      if (cancelled) return;
      if (!ts) return;
      if (!widgetRef.current) return;
      if (widgetId.current) return;
      widgetId.current = ts.render(widgetRef.current, { sitekey: TURNSTILE_SITE_KEY, theme: "dark", language: lang });
    };
    const existing = document.querySelector<HTMLScriptElement>("script[data-turnstile]");
    if ((window as TurnstileWindow).turnstile) mount();
    else if (existing) existing.addEventListener("load", mount);
    else {
      const s = document.createElement("script");
      s.src = TURNSTILE_SRC;
      s.async = true;
      s.dataset.turnstile = "1";
      s.addEventListener("load", mount);
      document.head.appendChild(s);
    }
    return () => {
      cancelled = true;
      const ts = (window as TurnstileWindow).turnstile;
      if (ts) {
        if (widgetId.current) ts.remove(widgetId.current);
      }
      widgetId.current = null;
    };
  }, [lang, sent]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const allTopics = [...topics, labels.otherTopic];
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

          <fieldset className="grid gap-2" aria-describedby={describe("topic")}>
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

          {TURNSTILE_SITE_KEY === "" ? null : <div ref={widgetRef} className="min-h-[65px]" />}

          {formError === undefined ? null : (
            <p role="alert" className="field-error">
              {formMessage(formError, labels.errors)}
            </p>
          )}

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
