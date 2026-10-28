import { notFound } from "next/navigation";
import { moveEntryAction, setVisibilityAction } from "@/app/(admin)/admin/actions";
import AdminShell from "@/components/admin/AdminShell";
import { getCollection } from "@/content/collections";
import type { Achievement } from "@/content/types";
import { adminCopy as t } from "@/data/admin";
import { byNewest } from "@/lib/achievements";
import { requireAdmin } from "@/server/auth/session";
import { listEntries } from "@/server/content";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ collection: string }>;
  searchParams: Promise<{ q?: string; v?: string; deleted?: string; error?: string }>;
};

export default async function AdminList({ params, searchParams }: Props) {
  const session = await requireAdmin();
  const cfg = getCollection((await params).collection);
  if (cfg === undefined) notFound();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().toLowerCase();
  const v = sp.v === "public" ? "public" : sp.v === "private" ? "private" : "all";

  let list = await listEntries(cfg.key, { publicOnly: false });
  if (cfg.order === "date") {
    list = [...list].sort((a, b) => byNewest(a.data as Achievement, b.data as Achievement));
  }
  const filtered = list
    .filter((e) => (v === "all" ? true : e.visibility === v))
    .filter((e) => (q === "" ? true : `${e.slug} ${JSON.stringify(e.data)}`.toLowerCase().includes(q)));
  const canMove = cfg.order === "position" ? q === "" ? v === "all" : false : false;
  const base = `/admin/${cfg.key}/`;

  return (
    <AdminShell session={session} active={cfg.key}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="admin-title">{cfg.label}</h1>
          <p className="admin-intro">{cfg.description}</p>
        </div>
        <a href={`${base}new/`} className="btn btn-solid">
          {t.list.add} {cfg.singular}
        </a>
      </div>

      {sp.deleted ? (
        <p role="status" className="admin-success mt-6">
          {t.list.deleted}
        </p>
      ) : null}
      {sp.error ? (
        <p role="alert" className="admin-error mt-6">
          {sp.error}
        </p>
      ) : null}

      <form className="admin-filter" method="get">
        <div className="grid gap-1">
          <label htmlFor="q" className="text-sm text-muted">
            {t.list.search}
          </label>
          <input id="q" name="q" type="search" className="field" defaultValue={sp.q ?? ""} placeholder={t.list.searchPlaceholder} />
        </div>
        <div className="grid gap-1">
          <label htmlFor="v" className="text-sm text-muted">
            {t.form.visibility}
          </label>
          <select id="v" name="v" className="field" defaultValue={v}>
            <option value="all">{t.list.all}</option>
            <option value="public">{t.list.public}</option>
            <option value="private">{t.list.private}</option>
          </select>
        </div>
        <button type="submit" className="btn btn-line">
          {t.list.search}
        </button>
      </form>

      <p className="mt-6 text-sm text-muted" aria-live="polite">
        {t.list.count.replace("{n}", String(filtered.length))}
      </p>

      {filtered.length === 0 ? (
        <p className="admin-empty">{t.list.empty}</p>
      ) : (
        <ul className="admin-rows">
          {filtered.map((e, i) => {
            const data = e.data as Record<string, unknown>;
            const publicHref = cfg.publicPath ? (e.visibility === "public" ? `${cfg.publicPath.id}${e.slug}/` : null) : null;
            return (
              <li key={e.id} className="admin-row">
                <div className="min-w-0">
                  <a href={`${base}${e.id}/`} className="admin-row-title">
                    {cfg.title(data) || e.slug}
                  </a>
                  {cfg.subtitle ? <p className="admin-row-sub">{cfg.subtitle(data)}</p> : null}
                  <p className="admin-row-badges">
                    <span className="admin-badge" data-v={e.visibility}>
                      {e.visibility === "public" ? t.list.public : t.list.private}
                    </span>
                    {e.shared ? <span className="admin-badge" data-v="shared">{t.list.shared}</span> : null}
                  </p>
                </div>
                <div className="admin-row-actions">
                  <form action={setVisibilityAction}>
                    <input type="hidden" name="collection" value={cfg.key} />
                    <input type="hidden" name="id" value={e.id} />
                    <input type="hidden" name="visibility" value={e.visibility === "public" ? "private" : "public"} />
                    <button type="submit" className="btn btn-line btn-small">
                      {e.visibility === "public" ? t.list.unpublish : t.list.publish}
                    </button>
                  </form>
                  {canMove ? (
                    <>
                      <form action={moveEntryAction}>
                        <input type="hidden" name="collection" value={cfg.key} />
                        <input type="hidden" name="id" value={e.id} />
                        <input type="hidden" name="direction" value="up" />
                        <button type="submit" className="btn btn-line btn-small" disabled={i === 0} aria-label={`${t.list.up}: ${cfg.title(data)}`}>
                          ↑
                        </button>
                      </form>
                      <form action={moveEntryAction}>
                        <input type="hidden" name="collection" value={cfg.key} />
                        <input type="hidden" name="id" value={e.id} />
                        <input type="hidden" name="direction" value="down" />
                        <button
                          type="submit"
                          className="btn btn-line btn-small"
                          disabled={i === filtered.length - 1}
                          aria-label={`${t.list.down}: ${cfg.title(data)}`}
                        >
                          ↓
                        </button>
                      </form>
                    </>
                  ) : null}
                  {publicHref ? (
                    <a href={publicHref} className="btn btn-line btn-small" target="_blank" rel="noopener noreferrer">
                      {t.list.view}
                    </a>
                  ) : null}
                  <a href={`${base}${e.id}/`} className="btn btn-solid btn-small">
                    {t.list.edit}
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </AdminShell>
  );
}
