import type { ReactNode } from "react";
import { logout } from "@/app/(admin)/admin/actions";
import Monogram from "@/components/Monogram";
import { collections, settingsConfigs } from "@/content/collections";
import { adminCopy as t } from "@/data/admin";
import type { AdminSession } from "@/server/auth/session";

const GROUPS = ["Capaian", "Proyek", "Mengajar", "Profil"] as const;

// Kerangka halaman admin: navigasi samping, konten, tombol keluar.
export default function AdminShell({
  session,
  active,
  children,
}: {
  session: AdminSession;
  active: string;
  children: ReactNode;
}) {
  return (
    <div className="admin-shell">
      <a href="#admin-main" className="skip-link">
        {t.skip}
      </a>
      <aside className="admin-side">
        <a href="/admin/" className="admin-brand">
          <Monogram className="h-8 w-8" />
          <span>{t.brand}</span>
        </a>
        <nav aria-label={t.nav.label} className="admin-nav">
          <a href="/admin/" aria-current={active === "dashboard" ? "page" : undefined}>
            {t.nav.dashboard}
          </a>
          {GROUPS.map((g) => (
            <div key={g} className="admin-nav-group">
              <p>{g}</p>
              {collections
                .filter((c) => c.group === g)
                .map((c) => (
                  <a key={c.key} href={`/admin/${c.key}/`} aria-current={active === c.key ? "page" : undefined}>
                    {c.label}
                  </a>
                ))}
            </div>
          ))}
          <div className="admin-nav-group">
            <p>{t.nav.settings}</p>
            {settingsConfigs.map((s) => (
              <a key={s.key} href={`/admin/settings/${s.key}/`} aria-current={active === `settings-${s.key}` ? "page" : undefined}>
                {s.label}
              </a>
            ))}
          </div>
        </nav>
        <div className="admin-user">
          <p className="text-sm text-muted">
            {t.nav.signedInAs} <strong className="text-fg">{session.name}</strong>
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a href="/" className="btn btn-line btn-small" target="_blank" rel="noopener noreferrer">
              {t.nav.viewSite}
            </a>
            <form action={logout}>
              <button type="submit" className="btn btn-line btn-small">
                {t.nav.logout}
              </button>
            </form>
          </div>
        </div>
      </aside>
      <main id="admin-main" className="admin-main">
        {children}
      </main>
    </div>
  );
}
