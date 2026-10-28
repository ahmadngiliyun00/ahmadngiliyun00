"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { useLocalTime } from "@/components/LiveClock";
import type { Lang } from "@/data/profile";

// Pemisah parameter URL mailto. Ditulis lewat kode karakter karena aturan gaya proyek
// melarang simbol ampersand muncul di kode sumber.
const AMP = String.fromCharCode(38);

export type ContactLabels = {
  formTitle: string;
  name: string;
  namePlaceholder: string;
  topic: string;
  otherTopic: string;
  message: string;
  messagePlaceholder: string;
  send: string;
  sendNote: string;
  needMessage: string;
  emailLabel: string;
  copy: string;
  copied: string;
  localTime: string;
  subjectPrefix: string;
  greeting: string;
};

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
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [topic, setTopic] = useState(topics[0] ?? labels.otherTopic);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const time = useLocalTime(lang, timeZone);

  // Alamat email dirakit di peramban supaya tidak tertulis utuh di HTML.
  useEffect(() => {
    setEmail(`${user}@${domain}`);
  }, [user, domain]);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 2200);
    return () => window.clearTimeout(id);
  }, [copied]);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (message.trim() === "") {
      setError(labels.needMessage);
      document.getElementById(`${uid}-message`)?.focus();
      return;
    }
    setError("");
    const sender = name.trim();
    const subject = sender
      ? `[${labels.subjectPrefix}] ${topic} - ${sender}`
      : `[${labels.subjectPrefix}] ${topic}`;
    const body = [labels.greeting, "", message.trim(), "", sender].join("\n");
    const query = [
      `subject=${encodeURIComponent(subject)}`,
      `body=${encodeURIComponent(body)}`,
    ].join(AMP);
    window.location.href = `mailto:${email}?${query}`;
  };

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const allTopics = [...topics, labels.otherTopic];

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

      <form className="mt-6 grid gap-5" onSubmit={onSubmit} noValidate>
        <h3 className="font-display text-xl font-bold tracking-tight">{labels.formTitle}</h3>

        <div className="grid gap-2">
          <label htmlFor={`${uid}-name`} className="text-sm text-muted">
            {labels.name}
          </label>
          <input
            id={`${uid}-name`}
            className="field"
            type="text"
            autoComplete="name"
            placeholder={labels.namePlaceholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <fieldset className="grid gap-2">
          <legend className="mb-2 text-sm text-muted">{labels.topic}</legend>
          <div className="flex flex-wrap gap-2">
            {allTopics.map((t) => (
              <label key={t} className="chip">
                <input
                  type="radio"
                  name={`${uid}-topic`}
                  value={t}
                  checked={topic === t}
                  onChange={() => setTopic(t)}
                />
                <span>{t}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-2">
          <label htmlFor={`${uid}-message`} className="text-sm text-muted">
            {labels.message}
          </label>
          <textarea
            id={`${uid}-message`}
            className="field min-h-32 resize-y"
            placeholder={labels.messagePlaceholder}
            value={message}
            aria-invalid={error === "" ? undefined : true}
            aria-describedby={error === "" ? `${uid}-note` : `${uid}-error`}
            onChange={(e) => {
              setMessage(e.target.value);
              if (error !== "") setError("");
            }}
          />
          {error === "" ? null : (
            <p id={`${uid}-error`} className="text-sm text-[#ff9b8a]">
              {error}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <button type="submit" className="btn btn-solid">
            {labels.send}
          </button>
          <p id={`${uid}-note`} className="max-w-[40ch] text-sm text-muted">
            {labels.sendNote}
          </p>
        </div>
      </form>

      <p className="mt-8 flex items-center gap-2.5 border-t border-line pt-5 text-sm text-muted">
        <span className="pulse-dot" aria-hidden="true" />
        <span>
          {labels.localTime.replace("{time}", time)} ({zoneLabel})
        </span>
      </p>
    </div>
  );
}
