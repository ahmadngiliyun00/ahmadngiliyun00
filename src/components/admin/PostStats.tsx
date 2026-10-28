import { adminCopy } from "@/data/admin";
import type { ViewStats } from "@/server/views";

const t = adminCopy.stats;

function share(n: number, total: number): string {
  return total === 0 ? "0%" : `${Math.round((n / total) * 100)}%`;
}

// Panel statistik pembaca satu tulisan di halaman ubah CMS.
export default function PostStats({ stats, hasPage }: { stats: ViewStats; hasPage: boolean }) {
  const max = Math.max(1, ...stats.days.map((d) => d.n));
  const total = stats.total;
  return (
    <section className="admin-card" aria-labelledby="stats-title">
      <h2 id="stats-title" className="font-display text-lg font-bold tracking-tight">
        {t.title}
      </h2>

      <dl className="stats-tiles mt-4">
        {[
          { label: t.total, n: stats.total },
          { label: t.last7, n: stats.last7 },
          { label: t.last30, n: stats.last30 },
        ].map((tile) => (
          <div key={tile.label}>
            <dt>{tile.label}</dt>
            <dd>{tile.n.toLocaleString("id-ID")}</dd>
          </div>
        ))}
      </dl>

      {total === 0 ? (
        <p className="mt-4 text-sm text-muted">{hasPage ? t.empty : t.noPage}</p>
      ) : (
        <>
          <div
            className="stats-chart mt-5"
            role="img"
            aria-label={t.chart.replace("{total}", String(stats.last30)).replace("{max}", String(max))}
          >
            {stats.days.map((d) => (
              <span key={d.day} style={{ height: `${Math.max(4, (d.n / max) * 100)}%` }} data-zero={d.n === 0 ? "" : undefined} title={`${d.day}: ${d.n}`} />
            ))}
          </div>

          <h3 className="stats-sub">{t.sources}</h3>
          <ul className="stats-list">
            {stats.sources.map((s) => (
              <li key={s.name}>
                <span>{t.sourceNames[s.name] ?? s.name}</span>
                <span>
                  {s.n} <span className="text-muted">({share(s.n, total)})</span>
                </span>
              </li>
            ))}
          </ul>

          <h3 className="stats-sub">{t.devices}</h3>
          <ul className="stats-list">
            <li>
              <span>{t.mobile}</span>
              <span>{share(stats.devices.mobile, total)}</span>
            </li>
            <li>
              <span>{t.desktop}</span>
              <span>{share(stats.devices.desktop, total)}</span>
            </li>
          </ul>

          <h3 className="stats-sub">{t.langs}</h3>
          <ul className="stats-list">
            <li>
              <span>Indonesia</span>
              <span>{share(stats.langs.id, total)}</span>
            </li>
            <li>
              <span>English</span>
              <span>{share(stats.langs.en, total)}</span>
            </li>
          </ul>
        </>
      )}
      <p className="mt-4 text-xs text-muted">{t.note}</p>
    </section>
  );
}
