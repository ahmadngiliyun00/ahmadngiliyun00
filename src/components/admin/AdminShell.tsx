import type { ReactNode } from "react";
import { logout } from "@/app/(admin)/admin/actions";
import AdminSidebar, { type NavGroup, type NavLink } from "@/components/admin/AdminSidebar";
import Icon from "@/components/admin/Icon";
import Monogram from "@/components/Monogram";
import { collections, settingsConfigs } from "@/content/collections";
import { adminCopy as t } from "@/data/admin";
import type { AdminSession } from "@/server/auth/session";
import { countMessages } from "@/server/messages";

const GROUPS = [
  { key: "Capaian", icon: "award" },
  { key: "Proyek", icon: "code" },
  { key: "Mengajar", icon: "chalkboard-user" },
  { key: "Profil", icon: "user" },
] as const;

// Jumlah pesan belum dibaca untuk lencana di menu. Bila tabel pesan belum dimigrasi, anggap nol.
async function unreadMessages(): Promise<number> {
  try {
    return (await countMessages()).new;
  } catch {
    return 0;
  }
}

// Kerangka halaman admin: navigasi samping, konten, tombol keluar.
export default async function AdminShell({
  session,
  active,
  children,
}: {
  session: AdminSession;
  active: string;
  children: ReactNode;
}) {
  const unread = await unreadMessages();
  const link = (href: string, label: string, key: string): NavLink => ({ href, label, current: active === key });
  const inbox = link("/admin/pesan/", t.messages.nav, "messages");
  if (unread > 0) inbox.count = { n: unread, label: t.messages.newCount.replace("{n}", String(unread)) };
  const groups: NavGroup[] = [
    ...GROUPS.map((g) => ({
      key: g.key,
      label: g.key,
      icon: g.icon,
      links: collections.filter((c) => c.group === g.key).map((c) => link(`/admin/${c.key}/`, c.label, c.key)),
    })),
    {
      key: "settings",
      label: t.nav.settings,
      icon: "gear",
      links: settingsConfigs.map((s) => link(`/admin/settings/${s.key}/`, s.label, `settings-${s.key}`)),
    },
  ];

  return (
    <div className="admin-shell">
      <a href="#admin-main" className="skip-link">
        {t.skip}
      </a>
      <AdminSidebar
        brand={
          <a href="/admin/" className="admin-brand">
            <Monogram className="h-8 w-8" />
            <span>{t.brand}</span>
          </a>
        }
        label={t.nav.label}
        menuLabel={t.nav.menu}
        top={[
          { link: link("/admin/", t.nav.dashboard, "dashboard"), icon: "gauge-high" },
          { link: inbox, icon: "inbox" },
        ]}
        groups={groups}
        footer={
          <div className="admin-user">
            <p className="text-sm text-muted">
              {t.nav.signedInAs} <strong className="text-fg">{session.name}</strong>
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href="/" className="btn btn-line btn-small" target="_blank" rel="noopener noreferrer">
                <Icon name="arrow-up-right-from-square" />
                {t.nav.viewSite}
              </a>
              <form action={logout}>
                <button type="submit" className="btn btn-line btn-small">
                  <Icon name="right-from-bracket" />
                  {t.nav.logout}
                </button>
              </form>
            </div>
          </div>
        }
      />
      <main id="admin-main" className="admin-main">
        {children}
      </main>
    </div>
  );
}
