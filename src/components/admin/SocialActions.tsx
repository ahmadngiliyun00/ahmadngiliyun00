"use client";

import { useActionState, useEffect, useRef } from "react";
import { importLinkedinAction, syncSocialAction, type FormState } from "@/app/(admin)/admin/actions";
import FileDrop from "@/components/admin/FileDrop";
import Icon from "@/components/admin/Icon";
import { toast } from "@/components/Toaster";

// Tombol Tarik sekarang untuk satu akun yang terhubung. Hasilnya diumumkan lewat toast.
export function SocialSync({ platform, label, pending: pendingLabel }: { platform: string; label: string; pending: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(syncSocialAction, undefined);
  useEffect(() => {
    if (state?.message) toast(state.message, state.ok ? "success" : "error");
  }, [state]);
  return (
    <form action={action}>
      <input type="hidden" name="platform" value={platform} />
      <button type="submit" className="btn btn-solid btn-small" disabled={pending}>
        <Icon name="rotate" className={pending ? "fa-spin" : undefined} />
        {pending ? pendingLabel : label}
      </button>
    </form>
  );
}

// Unggah Shares.csv dari ekspor data LinkedIn.
export function LinkedinImport({ labels }: { labels: { file: string; submit: string; submitting: string; dropHint: string } }) {
  const [state, action, pending] = useActionState<FormState, FormData>(importLinkedinAction, undefined);
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.message) toast(state.message, state.ok ? "success" : "error");
    if (state?.ok) form.current?.reset();
  }, [state]);
  return (
    <form ref={form} action={action} className="mt-4">
      <div className="admin-field">
        <label htmlFor="linkedin-shares">{labels.file}</label>
        <FileDrop id="linkedin-shares" name="shares" accept=".csv,text/csv" required hint={labels.dropHint} maxBytes={5 * 1024 * 1024} />
      </div>
      <div className="mt-3">
        <button type="submit" className="btn btn-line btn-small" disabled={pending}>
          <Icon name="file-import" />
          {pending ? labels.submitting : labels.submit}
        </button>
      </div>
    </form>
  );
}
