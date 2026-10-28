import { redirect } from "next/navigation";
import LoginForm from "@/components/admin/LoginForm";
import Monogram from "@/components/Monogram";
import { adminCopy as t } from "@/data/admin";
import { githubConfig } from "@/server/auth/github";
import { getSession } from "@/server/auth/session";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  if ((await getSession()) !== null) redirect("/admin/");
  const { error } = await searchParams;
  const message = error ? t.login.errors[error] : undefined;
  const github = githubConfig().enabled;

  return (
    <main className="admin-login">
      <div className="admin-card admin-login-card">
        <Monogram className="h-12 w-12" />
        <h1 className="mt-6 font-display text-3xl font-bold tracking-tight">{t.login.title}</h1>
        <p className="mt-2 text-muted">{t.login.intro}</p>
        {message ? (
          <p role="alert" className="admin-error mt-6">
            {message}
          </p>
        ) : null}
        {github ? (
          <>
            <a href="/admin/auth/github/" className="btn btn-line mt-8 w-full">
              {t.login.github}
            </a>
            <p className="admin-or">{t.login.or}</p>
          </>
        ) : (
          <div className="mt-8" />
        )}
        <LoginForm labels={t.login} />
      </div>
    </main>
  );
}
