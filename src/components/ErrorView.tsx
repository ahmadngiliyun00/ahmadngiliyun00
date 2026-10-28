import type { CSSProperties, ReactNode } from "react";
import CurrentPath from "@/components/CurrentPath";
import ErrorPlot from "@/components/ErrorPlot";
import type { ErrorCopy, ErrorPageCopy } from "@/data/profile";

// Isi halaman error yang sama untuk situs ID dan EN, CMS, dan global-error: kode besar beranimasi,
// kalimat jelas bahwa ini halaman error, penyebabnya, rincian (kode, alamat, kode referensi), dan tombol.
// Tanpa hook, jadi bisa dipakai dari komponen server (not-found) maupun klien (error).
export default function ErrorView({
  code,
  page,
  labels,
  reference,
  actions,
  children,
}: {
  code: number;
  page: ErrorPageCopy;
  labels: ErrorCopy;
  reference?: string; // error.digest dari Next.js, untuk dicocokkan dengan log server
  actions: ReactNode;
  children?: ReactNode; // misalnya daftar halaman yang mungkin dicari
}) {
  const digits = String(code).split("");
  return (
    <section className="error-page" aria-labelledby="error-title">
      <div className="error-glow" aria-hidden="true" />
      <div className="error-layout mx-auto max-w-6xl px-5 sm:px-8">
        <div className="error-copy">
          <p className="status error-badge">
            <span className="pulse-dot error-dot" aria-hidden="true" />
            {labels.badge.replace("{code}", String(code))}
          </p>
          <p className="error-code" aria-hidden="true">
            {digits.map((digit, i) => (
              <span key={i} className="error-digit" style={{ "--d": `${120 + i * 110}ms` } as CSSProperties}>
                {digit}
              </span>
            ))}
          </p>
          <h1 id="error-title" className="error-title">
            {page.title}
          </h1>
          <p className="error-lead">{page.lead}</p>
          <div className="error-actions">{actions}</div>
        </div>

        <div className="error-side">
          <div className="error-plot-wrap">
            <ErrorPlot variant={code === 404 ? "lost" : "broken"} />
          </div>
          <div className="error-details">
            <h2 className="error-details-title">{labels.details}</h2>
            <dl className="error-facts">
              <div>
                <dt>{labels.codeLabel}</dt>
                <dd>
                  <code>{page.status}</code>
                </dd>
              </div>
              <div>
                <dt>{labels.pathLabel}</dt>
                <dd>
                  <CurrentPath />
                </dd>
              </div>
              {reference ? (
                <div>
                  <dt>{labels.refLabel}</dt>
                  <dd>
                    <code>{reference}</code>
                    <span className="error-ref-note">{labels.refNote}</span>
                  </dd>
                </div>
              ) : null}
            </dl>
            <h3 className="error-causes-title">{labels.causesTitle}</h3>
            <ul className="error-causes">
              {page.causes.map((cause) => (
                <li key={cause}>{cause}</li>
              ))}
            </ul>
            <p className="error-hint">{page.hint}</p>
          </div>
        </div>
      </div>
      {children}
    </section>
  );
}
