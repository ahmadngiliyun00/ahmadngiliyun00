import "@fortawesome/fontawesome-free/css/brands.min.css";
import { redirect } from "next/navigation";
import Icon from "@/components/admin/Icon";
import LoginForm from "@/components/admin/LoginForm";
import FlashToast from "@/components/FlashToast";
import Monogram from "@/components/Monogram";
import Wordmark from "@/components/Wordmark";
import { adminCopy as t } from "@/data/admin";
import { githubConfig } from "@/server/auth/github";
import { getSession } from "@/server/auth/session";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ error?: string }> };

// Titik hiasan bergaya plot K-Means di beranda: tiga kluster dengan pusatnya.
// Acak dengan benih tetap supaya server selalu menghasilkan gambar yang sama.
const CLUSTERS = [
  { cx: 92, cy: 78, color: "var(--color-leaf)" },
  { cx: 236, cy: 64, color: "var(--color-sky)" },
  { cx: 170, cy: 168, color: "var(--color-paper)" },
];

function clusterDots() {
  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  return CLUSTERS.flatMap((c, k) =>
    Array.from({ length: 16 }, (_, i) => {
      const angle = rand() * Math.PI * 2;
      const radius = 8 + rand() * 34;
      return {
        key: `${k}-${i}`,
        x: Math.round(c.cx + Math.cos(angle) * radius),
        y: Math.round(c.cy + Math.sin(angle) * radius * 0.8),
        color: c.color,
        delay: Math.round(rand() * 3000),
      };
    }),
  );
}

export default async function LoginPage({ searchParams }: Props) {
  if ((await getSession()) !== null) redirect("/admin/");
  const { error } = await searchParams;
  // Hanya kode yang dikenal. Kunci bawaan objek (constructor, __proto__) bukan pesan dan membuat render gagal.
  const message = error ? (Object.hasOwn(t.login.errors, error) ? t.login.errors[error] : undefined) : undefined;
  const github = githubConfig().enabled;
  const dots = clusterDots();

  return (
    <main className="login">

      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-card">
          <Monogram className="login-card-logo h-11 w-11" />
          <h1 id="login-title" className="font-display text-3xl font-bold tracking-tight">
            {t.login.title}
          </h1>
          <p className="mt-2 text-muted">{t.login.intro}</p>
          {message ? <FlashToast message={message} kind="error" clear={["error"]} /> : null}

          <div className="mt-8">
            <LoginForm labels={t.login} />
          </div>

          {github ? (
            <>
              <p className="login-or">
                <span>{t.login.or}</span>
              </p>
              <a href="/admin/auth/github/" className="btn btn-line login-github">
                <i className="fa-brands fa-github" aria-hidden="true" />
                {t.login.github}
              </a>
            </>
          ) : null}

          <p className="login-note">
            <Icon name="shield-halved" />
            {t.login.secureNote}
          </p>
        </div>
      </section>

      {/* Setelah formulir di DOM supaya Tab pertama langsung ke isian email; tampil di kiri atau atas lewat CSS order. */}
      <aside className="login-brand" aria-labelledby="login-brand-title">
        <div className="login-brand-grid" aria-hidden="true" />
        <a href="/" className="login-home">
          <Monogram className="h-10 w-10" />
          <Wordmark className="login-wordmark" />
        </a>

        <div className="login-brand-body">
          <svg viewBox="0 0 320 220" className="login-plot" aria-hidden="true">
            {CLUSTERS.map((c) => (
              <g key={c.color}>
                {dots
                  .filter((d) => d.color === c.color)
                  .map((d) => (
                    <line key={`l${d.key}`} x1={c.cx} y1={c.cy} x2={d.x} y2={d.y} className="login-plot-link" />
                  ))}
              </g>
            ))}
            {dots.map((d) => (
              <circle
                key={d.key}
                cx={d.x}
                cy={d.y}
                r={3.2}
                fill={d.color}
                className="login-plot-dot"
                style={{ animationDelay: `${d.delay}ms` }}
              />
            ))}
            {CLUSTERS.map((c) => (
              <g key={`c${c.color}`} className="login-plot-center">
                <circle cx={c.cx} cy={c.cy} r={9} fill="none" stroke={c.color} strokeWidth={2} />
                <circle cx={c.cx} cy={c.cy} r={3} fill={c.color} />
              </g>
            ))}
          </svg>

          <p id="login-brand-title" className="login-brand-title">
            {t.login.brandTitle}
          </p>
          <p className="login-brand-text">{t.login.brandBody}</p>
          <ul className="login-features">
            {t.login.features.map((f) => (
              <li key={f.icon}>
                <span className="login-feature-icon">
                  <Icon name={f.icon} />
                </span>
                {f.text}
              </li>
            ))}
          </ul>
        </div>

        <a href="/" className="login-back">
          <Icon name="arrow-left" />
          {t.login.backToSite}
        </a>
      </aside>
    </main>
  );
}
