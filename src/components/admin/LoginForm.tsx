"use client";

import { useActionState } from "react";
import { loginWithPassword, type FormState } from "@/app/(admin)/admin/actions";

export type LoginLabels = { email: string; password: string; submit: string };

export default function LoginForm({ labels }: { labels: LoginLabels }) {
  const [state, action, pending] = useActionState<FormState, FormData>(loginWithPassword, undefined);
  return (
    <form action={action} className="grid gap-4">
      <div className="grid gap-2">
        <label htmlFor="login-email" className="text-sm text-muted">
          {labels.email}
        </label>
        <input id="login-email" name="email" type="email" autoComplete="username" required className="field" />
      </div>
      <div className="grid gap-2">
        <label htmlFor="login-password" className="text-sm text-muted">
          {labels.password}
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="field"
        />
      </div>
      {state?.message ? (
        <p role="alert" className="admin-error">
          {state.message}
        </p>
      ) : null}
      <button type="submit" className="btn btn-solid" disabled={pending}>
        {labels.submit}
      </button>
    </form>
  );
}
