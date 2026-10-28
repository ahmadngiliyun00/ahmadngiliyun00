"use client";

import { useActionState, useEffect } from "react";
import { loginWithPassword, type FormState } from "@/app/(admin)/admin/actions";
import { toast } from "@/components/Toaster";

export type LoginLabels = {
  email: string;
  emailPlaceholder: string;
  password: string;
  passwordPlaceholder: string;
  submit: string;
};

export default function LoginForm({ labels }: { labels: LoginLabels }) {
  const [state, action, pending] = useActionState<FormState, FormData>(loginWithPassword, undefined);
  useEffect(() => {
    if (state?.message) toast(state.message, "error");
  }, [state]);
  return (
    <form action={action} className="grid gap-4">
      <div className="grid gap-2">
        <label htmlFor="login-email" className="text-sm text-muted">
          {labels.email}
          <span className="admin-required" aria-hidden="true">
            {" *"}
          </span>
        </label>
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
      <div className="grid gap-2">
        <label htmlFor="login-password" className="text-sm text-muted">
          {labels.password}
          <span className="admin-required" aria-hidden="true">
            {" *"}
          </span>
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="field"
          placeholder={labels.passwordPlaceholder}
        />
      </div>
      <button type="submit" className="btn btn-solid" disabled={pending}>
        {labels.submit}
      </button>
    </form>
  );
}
