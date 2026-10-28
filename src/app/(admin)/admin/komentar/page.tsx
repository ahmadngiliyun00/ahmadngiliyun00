import { deleteCommentAction, replyCommentAction, setCommentStatusAction } from "@/app/(admin)/admin/actions";
import AdminShell from "@/components/admin/AdminShell";
import ConfirmButton from "@/components/admin/ConfirmButton";
import Icon from "@/components/admin/Icon";
import ListControls from "@/components/admin/ListControls";
import Pagination from "@/components/admin/Pagination";
import { paginate } from "@/components/admin/paginate";
import FlashToast from "@/components/FlashToast";
import { adminCopy } from "@/data/admin";
import { postPath } from "@/lib/posts";
import { requireAdmin } from "@/server/auth/session";
import { countComments, listComments, type AdminComment, type CommentStatus } from "@/server/comments";

export const dynamic = "force-dynamic";

const t = adminCopy.comments;
const FILTERS: CommentStatus[] = ["pending", "approved", "spam"];

const dateFormat = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" });

type Props = { searchParams: Promise<{ f?: string; q?: string; per?: string; page?: string; done?: string }> };

function toFilter(value: string | undefined): CommentStatus {
  return value === "approved" ? "approved" : value === "spam" ? "spam" : "pending";
}

function StatusButton({ c, filter, status, label, solid }: { c: AdminComment; filter: CommentStatus; status: CommentStatus; label: string; solid?: boolean }) {
  return (
    <form action={setCommentStatusAction}>
      <input type="hidden" name="id" value={c.id} />
      <input type="hidden" name="status" value={status} />
      <input type="hidden" name="filter" value={filter} />
      <button type="submit" className={solid ? "btn btn-solid btn-small" : "btn btn-line btn-small"}>
        {status === "approved" ? <Icon name="check" /> : null}
        {label}
      </button>
    </form>
  );
}

// Moderasi komentar: setujui, balas, tandai spam, atau hapus.
export default async function AdminComments({ searchParams }: Props) {
  const session = await requireAdmin();
  const sp = await searchParams;
  const filter = toFilter(sp.f);

  let list: AdminComment[] = [];
  let counts: Record<CommentStatus, number> = { pending: 0, approved: 0, spam: 0 };
  let missing = false;
  try {
    [list, counts] = await Promise.all([listComments(filter), countComments()]);
  } catch (err) {
    console.error("[admin] Gagal membaca komentar", err instanceof Error ? err.message : err);
    missing = true;
  }
  const q = (sp.q ?? "").trim().toLowerCase();
  const found = q === "" ? list : list.filter((c) => `${c.name} ${c.email} ${c.postTitle} ${c.body}`.toLowerCase().includes(q));
  const pg = paginate(found, sp.page, sp.per);
  const hrefFor = (n: number) => {
    const params = new URLSearchParams({ f: filter });
    if (sp.q) params.set("q", sp.q);
    if (pg.per !== 10) params.set("per", String(pg.per));
    if (n > 1) params.set("page", String(n));
    return `/admin/komentar/?${params.toString()}`;
  };
  const flash = sp.done ? (Object.hasOwn(t.flash, sp.done) ? t.flash[sp.done] : undefined) : undefined;

  return (
    <AdminShell session={session} active="comments">
      <h1 className="admin-title">{t.title}</h1>
      <p className="admin-intro">{t.intro}</p>
      {flash ? <FlashToast message={flash} clear={["done"]} /> : null}
      {missing ? <p className="admin-note mt-6">{t.tableMissing}</p> : null}

      <nav className="admin-tabs" aria-label={t.tabsLabel}>
        {FILTERS.map((f) => (
          <a key={f} href={`/admin/komentar/?f=${f}`} aria-current={f === filter ? "page" : undefined}>
            {t.tabs[f]} <span className="admin-tab-count">{counts[f]}</span>
          </a>
        ))}
      </nav>

      <ListControls q={sp.q ?? ""} per={pg.per} keep={{ f: filter }} labels={{ ...adminCopy.list, searchPlaceholder: t.searchPlaceholder }} />

      <p className="mt-6 text-sm text-muted" aria-live="polite">
        {pg.total === 0
          ? t.count.replace("{n}", "0")
          : t.range.replace("{from}", String(pg.from)).replace("{to}", String(pg.to)).replace("{total}", String(pg.total))}
      </p>

      {pg.total === 0 ? (
        <p className="admin-empty">{t.empty}</p>
      ) : (
        <ul className="admin-messages">
          {pg.items.map((c) => (
            <li key={c.id} className="admin-card admin-message" data-status={c.status === "pending" ? "new" : undefined}>
              <div className="admin-message-head">
                <div className="min-w-0">
                  <p className="admin-row-title">{c.name}</p>
                  <p className="admin-row-sub">
                    <a className="link" href={`mailto:${c.email}`}>
                      {c.email}
                    </a>
                  </p>
                </div>
                <time className="text-sm text-muted" dateTime={c.createdAt.toISOString()}>
                  {dateFormat.format(c.createdAt)}
                </time>
              </div>
              <p className="admin-row-badges">
                <span className="admin-badge" data-v={c.status === "approved" ? "public" : c.status === "pending" ? "new" : undefined}>
                  {t.tabs[c.status]}
                </span>
                <span className="admin-badge">{t.lang[c.lang]}</span>
              </p>
              <p className="mt-2 text-sm text-muted">
                {t.on}:{" "}
                {c.postSlug === "" ? (
                  c.postTitle
                ) : (
                  <a className="link" href={postPath(c.lang, c.postSlug)} target="_blank" rel="noopener noreferrer">
                    {c.postTitle || c.postSlug}
                  </a>
                )}
              </p>
              <p className="admin-message-body">{c.body}</p>
              {c.reply ? (
                <div className="admin-comment-reply">
                  <p className="text-xs font-semibold text-muted">{t.yourReply}</p>
                  <p className="admin-message-body mt-1">{c.reply}</p>
                </div>
              ) : null}

              <div className="admin-row-actions mt-4">
                {c.status === "approved" ? null : <StatusButton c={c} filter={filter} status="approved" label={t.approve} solid />}
                {c.status === "approved" ? <StatusButton c={c} filter={filter} status="pending" label={t.hide} /> : null}
                {c.status === "spam" ? (
                  <StatusButton c={c} filter={filter} status="pending" label={t.notSpam} />
                ) : (
                  <StatusButton c={c} filter={filter} status="spam" label={t.spam} />
                )}
                <form action={deleteCommentAction}>
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="filter" value={filter} />
                  <ConfirmButton label={t.delete} confirm={t.deleteConfirm} className="btn btn-line btn-small admin-danger" />
                </form>
              </div>

              {c.status === "spam" ? null : (
                <details className="admin-reply mt-4">
                  <summary className="btn btn-line btn-small">
                    <Icon name="reply" />
                    {c.reply ? t.editReply : t.reply}
                  </summary>
                  <form action={replyCommentAction} className="mt-3 grid gap-2">
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="filter" value={filter} />
                    <label htmlFor={`reply-${c.id}`} className="admin-sublabel">
                      {t.replyLabel}
                    </label>
                    <textarea
                      id={`reply-${c.id}`}
                      name="reply"
                      className="field"
                      rows={3}
                      maxLength={2000}
                      defaultValue={c.reply ?? ""}
                      placeholder={t.replyPlaceholder}
                    />
                    <div className="flex flex-wrap items-center gap-3">
                      <button type="submit" className="btn btn-solid btn-small">
                        {t.saveReply}
                      </button>
                      <span className="text-xs text-muted">{t.replyNote}</span>
                    </div>
                  </form>
                </details>
              )}
            </li>
          ))}
        </ul>
      )}

      <Pagination page={pg.page} pages={pg.pages} hrefFor={hrefFor} labels={adminCopy.pagination} />
    </AdminShell>
  );
}
