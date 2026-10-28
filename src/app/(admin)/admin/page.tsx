import AdminShell from "@/components/admin/AdminShell";
import { collections, settingsConfigs } from "@/content/collections";
import { adminCopy as t } from "@/data/admin";
import { db } from "@/db";
import { entries } from "@/db/schema";
import { requireAdmin } from "@/server/auth/session";
import { countMessages } from "@/server/messages";
import { count, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await requireAdmin();
  const rows = await db
    .select({ collection: entries.collection, visibility: entries.visibility, n: count() })
    .from(entries)
    .groupBy(entries.collection, entries.visibility)
    .orderBy(sql`1`);
  const inbox = await countMessages().catch(() => ({ new: 0, read: 0, archived: 0 }));
  const tally = (key: string, v: string) => rows.find((r) => r.collection === key ? r.visibility === v : false)?.n ?? 0;

  return (
    <AdminShell session={session} active="dashboard">
      <h1 className="admin-title">{t.dashboard.title}</h1>
      <p className="admin-intro">{t.dashboard.intro}</p>
      <ul className="admin-grid mt-8">
        <li>
          <a href="/admin/pesan/" className="admin-card admin-tile">
            <span className="text-sm text-muted">{t.messages.nav}</span>
            <span className="font-display text-xl font-bold tracking-tight">{t.messages.title}</span>
            <span className="text-sm text-muted">{t.messages.tile}</span>
            <span className="admin-tally">
              <span className="admin-badge" data-v={inbox.new > 0 ? "new" : undefined}>
                {t.messages.newCount.replace("{n}", String(inbox.new))}
              </span>
              <span className="admin-badge">
                {inbox.archived} {t.messages.tabs.archived.toLowerCase()}
              </span>
            </span>
          </a>
        </li>
        {collections.map((c) => (
          <li key={c.key}>
            <a href={`/admin/${c.key}/`} className="admin-card admin-tile">
              <span className="text-sm text-muted">{c.group}</span>
              <span className="font-display text-xl font-bold tracking-tight">{c.label}</span>
              <span className="text-sm text-muted">{c.description}</span>
              <span className="admin-tally">
                <span className="admin-badge" data-v="public">
                  {tally(c.key, "public")} {t.dashboard.public}
                </span>
                <span className="admin-badge" data-v="private">
                  {tally(c.key, "private")} {t.dashboard.private}
                </span>
              </span>
            </a>
          </li>
        ))}
        {settingsConfigs.map((s) => (
          <li key={s.key}>
            <a href={`/admin/settings/${s.key}/`} className="admin-card admin-tile">
              <span className="text-sm text-muted">{t.nav.settings}</span>
              <span className="font-display text-xl font-bold tracking-tight">{s.label}</span>
              <span className="text-sm text-muted">{s.description}</span>
            </a>
          </li>
        ))}
      </ul>
    </AdminShell>
  );
}
