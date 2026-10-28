"use client";

import { type KeyboardEvent, useActionState, useEffect, useState } from "react";
import { loginWithPassword, type FormState } from "@/app/(admin)/admin/actions";
import Icon from "@/components/admin/Icon";
import { toast } from "@/components/Toaster";

export type LoginLabels = {
  email: string;
  emailPlaceholder: string;
  password: string;
  passwordPlaceholder: string;
  submit: string;
  submitting: string;
  showPassword: string;
  hidePassword: string;
  capsLock: string;
};

export default function LoginForm({ labels }: { labels: LoginLabels }) {
  const [state, action, pending] = useActionState<FormState, FormData>(loginWithPassword, undefined);
  const [visible, setVisible] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  useEffect(() => {
    if (state?.message) toast(state.message, "error");
  }, [state]);

  // Peringatan Caps Lock hanya saat mengetik kata sandi, karena huruf yang tersembunyi tidak terlihat salah.
  const checkCaps = (e: KeyboardEvent<HTMLInputElement>) => setCapsOn(e.getModifierState("CapsLock"));

  return (
    // Kata sandi disembunyikan lagi saat dikirim, supaya tidak tetap terlihat bila login gagal.
    <form action={action} onSubmit={() => setVisible(false)} className="grid gap-5">
      <div className="grid gap-2">
        <label htmlFor="login-email" className="text-sm text-muted">
          {labels.email}
          <span className="admin-required" aria-hidden="true">
            {" *"}
          </span>
        </label>
        <div className="login-input">
          <Icon name="envelope" className="login-input-icon" />
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="username"
            required
            className="field"
            placeholder={labels.emailPlaceholder}
          />
        </div>
      </div>
      <div className="grid gap-2">
        <label htmlFor="login-password" className="text-sm text-muted">
          {labels.password}
          <span className="admin-required" aria-hidden="true">
            {" *"}
          </span>
        </label>
        <div className="login-input">
          <Icon name="lock" className="login-input-icon" />
          <input
            id="login-password"
            name="password"
            type={visible ? "text" : "password"}
            autoComplete="current-password"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            required
            className="field login-password"
            placeholder={labels.passwordPlaceholder}
            aria-describedby={capsOn ? "login-caps" : undefined}
            onKeyDown={checkCaps}
            onKeyUp={checkCaps}
            onBlur={() => setCapsOn(false)}
          />
          <button
            type="button"
            className="login-toggle"
            aria-controls="login-password"
            aria-pressed={visible}
            aria-label={visible ? labels.hidePassword : labels.showPassword}
            title={visible ? labels.hidePassword : labels.showPassword}
            onClick={() => setVisible((v) => !v)}
          >
            <Icon name={visible ? "eye-slash" : "eye"} />
          </button>
        </div>
        {capsOn ? (
          <p id="login-caps" className="login-caps" role="status">
            <Icon name="triangle-exclamation" />
            {labels.capsLock}
          </p>
        ) : null}
      </div>
      <button type="submit" className="btn btn-solid login-submit" disabled={pending} aria-busy={pending}>
        {pending ? labels.submitting : labels.submit}
        <Icon name={pending ? "spinner" : "arrow-right"} className={pending ? "fa-spin" : undefined} />
      </button>
    </form>
  );
}
