import { deleteMessageAction, setMessageStatusAction } from "@/app/(admin)/admin/actions";
import AdminShell from "@/components/admin/AdminShell";
import ConfirmButton from "@/components/admin/ConfirmButton";
import Icon from "@/components/admin/Icon";
import ListControls from "@/components/admin/ListControls";
import Pagination from "@/components/admin/Pagination";
import { paginate } from "@/components/admin/paginate";
import { adminCopy } from "@/data/admin";
import { requireAdmin } from "@/server/auth/session";
import { mailConfigured } from "@/server/mail";
import { countMessages, listMessages, type Message, type MessageFilter } from "@/server/messages";

export const dynamic = "force-dynamic";

const t = adminCopy.messages;
const FILTERS: MessageFilter[] = ["inbox", "new", "archived"];

const dateFormat = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

type Props = { searchParams: Promise<{ f?: string; q?: string; per?: string; page?: string; deleted?: string }> };

function toFilter(value: string | undefined): MessageFilter {
  return value === "new" ? "new" : value === "archived" ? "archived" : "inbox";
}

// Tautan balas: hanya satu parameter (subject), jadi tidak perlu pemisah parameter.
function replyHref(m: Message): string {
  return `mailto:${m.email}?subject=${encodeURIComponent(t.replySubject.replace("{topic}", m.topic))}`;
}

function StatusButton({ m, filter, status, label }: { m: Message; filter: MessageFilter; status: Message["status"]; label: string }) {
  return (
    <form action={setMessageStatusAction}>
      <input type="hidden" name="id" value={m.id} />
      <input type="hidden" name="status" value={status} />
      <input type="hidden" name="filter" value={filter} />
      <button type="submit" className="btn btn-line btn-small">
        {label}
      </button>
    </form>
  );
}

export default async function AdminMessages({ searchParams }: Props) {
  const session = await requireAdmin();
  const sp = await searchParams;
  const filter = toFilter(sp.f ?? sp.deleted);

  let list: Message[] = [];
  let counts = { new: 0, read: 0, archived: 0 };
  let missing = false;
  try {
    [list, counts] = await Promise.all([listMessages(filter), countMessages()]);
  } catch (err) {
    console.error("[admin] Gagal membaca pesan", err instanceof Error ? err.message : err);
    missing = true;
  }
  const mailReady = await mailConfigured();
  const q = (sp.q ?? "").trim().toLowerCase();
  const found = q === "" ? list : list.filter((m) => `${m.name} ${m.email} ${m.topic} ${m.body}`.toLowerCase().includes(q));
  const pg = paginate(found, sp.page, sp.per);
  const hrefFor = (n: number) => {
    const params = new URLSearchParams({ f: filter });
    if (sp.q) params.set("q", sp.q);
    if (pg.per !== 10) params.set("per", String(pg.per));
    if (n > 1) params.set("page", String(n));
    return `/admin/pesan/?${params.toString()}`;
  };
  const tabCount: Record<MessageFilter, number> = {
    inbox: counts.new + counts.read,
    new: counts.new,
    archived: counts.archived,
  };

  return (
    <AdminShell session={session} active="messages">
      <h1 className="admin-title">{t.title}</h1>
      <p className="admin-intro">{t.intro}</p>

      {sp.deleted ? (
        <p role="status" className="admin-success mt-6">
          {t.deleted}
        </p>
      ) : null}
      {missing ? (
        <p role="alert" className="admin-error mt-6">
          {t.tableMissing}
        </p>
      ) : null}
      {missing ? null : mailReady ? null : (
        <p className="admin-note mt-6">
          {t.mailOff}{" "}
          <a href="/admin/settings/mail/" className="link">
            {t.mailOffLink}
          </a>
        </p>
      )}

      <nav className="admin-tabs" aria-label={t.tabsLabel}>
        {FILTERS.map((f) => (
          <a key={f} href={`/admin/pesan/?f=${f}`} aria-current={f === filter ? "page" : undefined}>
            {t.tabs[f]} <span className="admin-tab-count">{tabCount[f]}</span>
          </a>
        ))}
      </nav>

      <ListControls
        q={sp.q ?? ""}
        per={pg.per}
        keep={{ f: filter }}
        labels={{ ...adminCopy.list, searchPlaceholder: t.searchPlaceholder }}
      />

      <p className="mt-6 text-sm text-muted" aria-live="polite">
        {pg.total === 0
          ? t.count.replace("{n}", "0")
          : t.range
              .replace("{from}", String(pg.from))
              .replace("{to}", String(pg.to))
              .replace("{total}", String(pg.total))}
      </p>

      {pg.total === 0 ? (
        <p className="admin-empty">{t.empty}</p>
      ) : (
        <ul className="admin-messages">
          {pg.items.map((m) => (
            <li key={m.id} className="admin-card admin-message" data-status={m.status}>
              <div className="admin-message-head">
                <div className="min-w-0">
                  <p className="admin-row-title">{m.name}</p>
                  <p className="admin-row-sub">
                    <a className="link" href={replyHref(m)}>
                      {m.email}
                    </a>
                  </p>
                </div>
                <time className="text-sm text-muted" dateTime={m.createdAt.toISOString()}>
                  {dateFormat.format(m.createdAt)}
                </time>
              </div>
              <p className="admin-row-badges">
                <span className="admin-badge" data-v={m.status}>
                  {t.status[m.status]}
                </span>
                <span className="admin-badge">{m.topic}</span>
                <span className="admin-badge">{t.lang[m.lang]}</span>
                <span className="admin-badge" data-v={m.notified ? "public" : undefined}>
                  {m.notified ? t.notified : t.notNotified}
                </span>
              </p>
              <p className="admin-message-body">{m.body}</p>
              <div className="admin-row-actions mt-4">
                <a className="btn btn-solid btn-small" href={replyHref(m)}>
                  <Icon name="reply" />
                  {t.reply}
                </a>
                {m.status === "new" ? <StatusButton m={m} filter={filter} status="read" label={t.markRead} /> : null}
                {m.status === "read" ? <StatusButton m={m} filter={filter} status="new" label={t.markNew} /> : null}
                {m.status === "archived" ? (
                  <StatusButton m={m} filter={filter} status="read" label={t.restore} />
                ) : (
                  <StatusButton m={m} filter={filter} status="archived" label={t.archive} />
                )}
                <form action={deleteMessageAction}>
                  <input type="hidden" name="id" value={m.id} />
                  <input type="hidden" name="filter" value={filter} />
                  <ConfirmButton label={t.delete} confirm={t.deleteConfirm} className="btn btn-line btn-small admin-danger" />
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Pagination page={pg.page} pages={pg.pages} hrefFor={hrefFor} labels={adminCopy.pagination} />
    </AdminShell>
  );
}
