"use client";

import { useActionState, useEffect } from "react";
import { sendTestMailAction, type FormState } from "@/app/(admin)/admin/actions";
import Icon from "@/components/admin/Icon";
import { toast } from "@/components/Toaster";

export type MailTestLabels = { testTitle: string; testIntro: string; test: string; testing: string };

// Tombol kirim email uji di halaman pengaturan Email dan SMTP.
export default function MailTest({ labels }: { labels: MailTestLabels }) {
  const [state, action, pending] = useActionState<FormState, FormData>(sendTestMailAction, undefined);
  useEffect(() => {
    if (state?.message) toast(state.message, state.ok ? "success" : "error");
  }, [state]);
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
    </section>
  );
}
