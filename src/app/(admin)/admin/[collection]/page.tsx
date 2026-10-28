import { notFound } from "next/navigation";
import { moveEntryAction, setVisibilityAction } from "@/app/(admin)/admin/actions";
import AdminShell from "@/components/admin/AdminShell";
import Icon from "@/components/admin/Icon";
import ListControls from "@/components/admin/ListControls";
import Pagination from "@/components/admin/Pagination";
import FlashToast from "@/components/FlashToast";
import { paginate } from "@/components/admin/paginate";
import { getCollection } from "@/content/collections";
import type { Achievement, Post } from "@/content/types";
import { adminCopy as t } from "@/data/admin";
import { byNewest } from "@/lib/achievements";
import { byPostDate } from "@/lib/posts";
import { requireAdmin } from "@/server/auth/session";
import { listEntries } from "@/server/content";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ collection: string }>;
  searchParams: Promise<{ q?: string; v?: string; per?: string; page?: string; deleted?: string; error?: string }>;
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
    list =
      cfg.key === "post"
        ? [...list].sort((a, b) => byPostDate(a.data as Post, b.data as Post))
        : [...list].sort((a, b) => byNewest(a.data as Achievement, b.data as Achievement));
  }
  const filtered = list
    .filter((e) => (v === "all" ? true : e.visibility === v))
    .filter((e) => (q === "" ? true : `${e.slug} ${JSON.stringify(e.data)}`.toLowerCase().includes(q)));
  const canMove = cfg.order === "position" ? q === "" ? v === "all" : false : false;
  const base = `/admin/${cfg.key}/`;
  const pg = paginate(filtered, sp.page, sp.per);
  const hrefFor = (n: number) => {
    const params = new URLSearchParams();
    if (sp.q) params.set("q", sp.q);
    if (v !== "all") params.set("v", v);
    if (pg.per !== 10) params.set("per", String(pg.per));
    if (n > 1) params.set("page", String(n));
    const qs = params.toString();
    return qs === "" ? base : `${base}?${qs}`;
  };

  return (
    <AdminShell session={session} active={cfg.key}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="admin-title">{cfg.label}</h1>
          <p className="admin-intro">{cfg.description}</p>
        </div>
        <a href={`${base}new/`} className="btn btn-solid">
          <Icon name="plus" />
          {t.list.add} {cfg.singular}
        </a>
      </div>

      {sp.deleted ? <FlashToast message={t.list.deleted} clear={["deleted"]} /> : null}
      {sp.error ? <FlashToast message={sp.error} kind="error" clear={["error"]} /> : null}

      <ListControls
        q={sp.q ?? ""}
        per={pg.per}
        visibility={v}
        labels={{ ...t.list, visibility: t.form.visibility }}
      />

      <p className="mt-6 text-sm text-muted" aria-live="polite">
        {pg.total === 0
          ? t.list.count.replace("{n}", "0")
          : t.list.range
              .replace("{from}", String(pg.from))
              .replace("{to}", String(pg.to))
              .replace("{total}", String(pg.total))}
      </p>

      {filtered.length === 0 ? (
        <p className="admin-empty">{t.list.empty}</p>
      ) : (
        <ul className="admin-rows">
          {pg.items.map((e, idx) => {
            const i = pg.from - 1 + idx;
            const data = e.data as Record<string, unknown>;
            const withPage = cfg.hasPage ? cfg.hasPage(data) : true;
            const publicHref = cfg.publicPath ? (e.visibility === "public" ? (withPage ? `${cfg.publicPath.id}${e.slug}/` : null) : null) : null;
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
                      <Icon name={e.visibility === "public" ? "eye-slash" : "eye"} />
                      {e.visibility === "public" ? t.list.unpublish : t.list.publish}
                    </button>
                  </form>
                  {canMove ? (
                    <>
                      <form action={moveEntryAction}>
                        <input type="hidden" name="collection" value={cfg.key} />
                        <input type="hidden" name="id" value={e.id} />
                        <input type="hidden" name="direction" value="up" />
                        <button
                          type="submit"
                          className="btn btn-line btn-small btn-icon"
                          disabled={i === 0}
                          aria-label={`${t.list.up}: ${cfg.title(data)}`}
                        >
                          <Icon name="arrow-up" />
                        </button>
                      </form>
                      <form action={moveEntryAction}>
                        <input type="hidden" name="collection" value={cfg.key} />
                        <input type="hidden" name="id" value={e.id} />
                        <input type="hidden" name="direction" value="down" />
                        <button
                          type="submit"
                          className="btn btn-line btn-small btn-icon"
                          disabled={i === filtered.length - 1}
                          aria-label={`${t.list.down}: ${cfg.title(data)}`}
                        >
                          <Icon name="arrow-down" />
                        </button>
                      </form>
                    </>
                  ) : null}
                  {publicHref ? (
                    <a href={publicHref} className="btn btn-line btn-small" target="_blank" rel="noopener noreferrer">
                      <Icon name="arrow-up-right-from-square" />
                      {t.list.view}
                    </a>
                  ) : null}
                  <a href={`${base}${e.id}/`} className="btn btn-solid btn-small">
                    <Icon name="pen" />
                    {t.list.edit}
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Pagination page={pg.page} pages={pg.pages} hrefFor={hrefFor} labels={t.pagination} />
    </AdminShell>
  );
}
