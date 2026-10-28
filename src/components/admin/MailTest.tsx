"use client";

import { useActionState } from "react";
import { sendTestMailAction, type FormState } from "@/app/(admin)/admin/actions";
import Icon from "@/components/admin/Icon";

export type MailTestLabels = { testTitle: string; testIntro: string; test: string; testing: string };

// Tombol kirim email uji di halaman pengaturan Email dan SMTP.
export default function MailTest({ labels }: { labels: MailTestLabels }) {
  const [state, action, pending] = useActionState<FormState, FormData>(sendTestMailAction, undefined);
  return (
    <section className="admin-card mt-6" aria-labelledby="mail-test">
      <h2 id="mail-test" className="font-display text-lg font-bold">
        {labels.testTitle}
      </h2>
      <p className="mt-1 text-sm text-muted">{labels.testIntro}</p>
      <form action={action} className="mt-4">
        <button type="submit" className="btn btn-line btn-small" disabled={pending}>
          <Icon name="paper-plane" />
          {pending ? labels.testing : labels.test}
        </button>
      </form>
      {state?.message ? (
        <p role={state.ok ? "status" : "alert"} className={state.ok ? "admin-success mt-4" : "admin-error mt-4"}>
          {state.message}
        </p>
      ) : null}
    </section>
  );
}
