import Analytics from "@/components/Analytics";
import CopyButton from "@/components/CopyButton";
import ExternalLink from "@/components/ExternalLink";
import SubpageShell from "@/components/SubpageShell";
import { authorshipLabels, type ProfileLink, type PartialDate } from "@/content/types";
import { copy, site, type Lang } from "@/data/profile";
import {
  type AchievementItem,
  archivePath,
  detailPath,
  detailUrl,
  formatPartialDate,
  hasLinkedInForm,
  kindName,
  linkedInUrl,
} from "@/lib/achievements";
import { formatPasteText } from "@/lib/linkedin";
import { homePath } from "@/lib/nav";

function isoDate(d: PartialDate): string {
  const parts = [String(d.year)];
  if (d.month !== undefined) parts.push(String(d.month).padStart(2, "0"));
  if (d.month !== undefined) {
    if (d.day !== undefined) parts.push(String(d.day).padStart(2, "0"));
  }
  return parts.join("-");
}

const CREDENTIAL_KINDS = ["sertifikat", "pelatihan", "beasiswa", "keanggotaan"];

// Data terstruktur schema.org sesuai jenis capaian.
function jsonLd(item: AchievementItem, lang: Lang) {
  const url = detailUrl(lang, item.id);
  const person = { "@type": "Person", name: site.name, url: site.url };
  const summary = item.summary ? item.summary[lang] : undefined;

  if (item.kind === "publikasi") {
    return {
      "@context": "https://schema.org",
      "@type": "ScholarlyArticle",
      headline: item.title[lang],
      author: person,
      datePublished: item.issued ? isoDate(item.issued) : undefined,
      isPartOf: { "@type": "Periodical", name: item.issuer },
      url,
    };
  }
  if (item.kind === "buku") {
    return {
      "@context": "https://schema.org",
      "@type": "Book",
      name: item.title[lang],
      author: person,
      publisher: { "@type": "Organization", name: item.issuer },
      datePublished: item.issued ? isoDate(item.issued) : undefined,
      url,
    };
  }
  if (CREDENTIAL_KINDS.includes(item.kind)) {
    return {
      "@context": "https://schema.org",
      "@type": "EducationalOccupationalCredential",
      name: item.title[lang],
      description: summary,
      credentialCategory: kindName(item.kind, lang),
      recognizedBy: { "@type": "Organization", name: item.issuer },
      dateCreated: item.issued ? isoDate(item.issued) : undefined,
      validUntil: item.expires ? isoDate(item.expires) : undefined,
      identifier: item.credentialId,
      url: item.verifyUrl ?? url,
    };
  }
  return null;
}

export type DetailFile = { url: string; mime: string };

// mode "shared": dibuka lewat tautan berbagi rahasia (item bisa privat). Tidak ada JSON-LD,
// tombol LinkedIn, atau tautan ke arsip, karena halaman ini tidak untuk mesin pencari.
export default function DetailPage({
  lang,
  item,
  file,
  researchProfiles,
  mode = "public",
  otherHref,
}: {
  lang: Lang;
  item: AchievementItem;
  file?: DetailFile;
  researchProfiles: ProfileLink[];
  mode?: "public" | "shared";
  otherHref?: string;
}) {
  const shared = mode === "shared";
  const t = copy[lang];
  const other: Lang = lang === "id" ? "en" : "id";
  const kind = kindName(item.kind, lang);
  const title = item.title[lang];
  const summary = item.summary ? item.summary[lang] : "";
  const issued = item.issued ? formatPartialDate(item.issued, lang) : "";
  const linkedin = shared ? null : linkedInUrl(item);
  const structured = shared ? null : jsonLd(item, lang);

  const pasteText = formatPasteText({
    title,
    kindLabel: kind,
    issuer: item.issuer,
    date: issued === "" ? undefined : issued,
    credentialId: item.credentialId,
    summary: summary === "" ? undefined : summary,
    url: item.verifyUrl ?? (shared ? undefined : detailUrl(lang, item.id)),
    labels: t.detail.paste,
  });

  const facts: { label: string; value: string }[] = [{ label: t.detail.issuer, value: item.issuer }];
  if (item.ongoing) facts.push({ label: t.detail.status, value: t.detail.ongoing });
  if (item.issued) facts.push({ label: t.detail.issued, value: issued });
  if (item.expires) facts.push({ label: t.detail.expires, value: formatPartialDate(item.expires, lang) });
  if (item.credentialId) facts.push({ label: t.detail.credentialId, value: item.credentialId });
  if (item.reference) facts.push({ label: t.detail.reference, value: item.reference });
  if (item.authorship) facts.push({ label: t.detail.authorship, value: authorshipLabels[item.authorship][lang] });

  const isPdf = file ? file.mime === "application/pdf" : false;
  const fileHref = file ? file.url : "";

  return (
    <SubpageShell lang={lang} otherHref={otherHref ?? detailPath(other, item.id)}>
      {shared ? null : <Analytics />}
      {structured === null ? null : (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured) }} />
      )}
      <article aria-labelledby="detail-title" className="section subpage-section">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <nav aria-label={t.archive.crumbs} className="crumbs">
            <ol>
              <li>
                <a href={homePath(lang)} className="link">
                  {t.archive.home}
                </a>
              </li>
              {shared ? null : (
                <li>
                  <a href={archivePath(lang)} className="link">
                    {t.archive.title}
                  </a>
                </li>
              )}
              <li aria-current="page">{kind}</li>
            </ol>
          </nav>

          <div className="detail-layout">
            <div>
              <p className="cred-kind">{kind}</p>
              <h1 id="detail-title" className="detail-title">
                {title}
              </h1>
              {summary === "" ? null : <p className="section-intro">{summary}</p>}

              <dl className="facts mt-10">
                {facts.map((f) => (
                  <div key={f.label}>
                    <dt>{f.label}</dt>
                    <dd>{f.value}</dd>
                  </div>
                ))}
              </dl>

              {item.skills ? (
                <div className="mt-8">
                  <h2 className="text-sm text-muted">{t.detail.skills}</h2>
                  <ul className="tags mt-3">
                    {item.skills.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {file ? (
                <div className="mt-12">
                  <h2 className="sub-title">{t.detail.file}</h2>
                  <div className="file-preview mt-5">
                    {isPdf ? (
                      <object data={fileHref} type="application/pdf" aria-label={`${t.detail.file}: ${title}`}>
                        <p className="p-6 text-muted">{t.detail.fileFallback}</p>
                      </object>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={fileHref} alt={`${t.detail.file}: ${title}`} loading="lazy" />
                    )}
                  </div>
                  <p className="mt-4">
                    <ExternalLink href={fileHref} newTab={t.newTab} className="link text-sm">
                      {t.detail.fileOpen}
                    </ExternalLink>
                  </p>
                </div>
              ) : null}
            </div>

            <aside className="detail-aside">
              <div className="detail-panel">
                <h2 className="font-display text-lg font-bold tracking-tight">{t.detail.verifyTitle}</h2>
                {item.verifyUrl ? (
                  <p className="mt-4">
                    <ExternalLink href={item.verifyUrl} newTab={t.newTab} className="btn btn-solid btn-small">
                      {t.detail.verify}
                    </ExternalLink>
                  </p>
                ) : (
                  <p className="mt-3 text-sm text-muted">{t.detail.verifyNone}</p>
                )}
              </div>

              <div className="detail-panel">
                <h2 className="font-display text-lg font-bold tracking-tight">{t.detail.shareTitle}</h2>
                {linkedin === null ? null : (
                  <div className="mt-4">
                    <ExternalLink href={linkedin} newTab={t.newTab} className="btn btn-solid btn-small">
                      {t.detail.linkedin}
                    </ExternalLink>
                    <p id="linkedin-note" className="mt-3 text-sm text-muted">
                      {t.detail.linkedinNote}
                    </p>
                  </div>
                )}
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <CopyButton
                    text={pasteText}
                    label={t.detail.copy}
                    copied={t.detail.copied}
                    failed={t.detail.copyFailed}
                    describedBy="copy-note"
                  />
                </div>
                <p id="copy-note" className="mt-3 text-sm text-muted">
                  {hasLinkedInForm(item) ? t.detail.linkedinPending : t.detail.copyNote}
                </p>
                <pre className="paste-box mt-4">{pasteText}</pre>
              </div>

              {item.related ? (
                <div className="detail-panel">
                  <h2 className="font-display text-lg font-bold tracking-tight">{t.detail.related}</h2>
                  <ul className="mt-3 grid gap-2">
                    {item.related.map((r) => (
                      <li key={r.href}>
                        <ExternalLink href={r.href} newTab={t.newTab} className="link text-sm">
                          {r.label[lang]}
                        </ExternalLink>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {item.kind === "publikasi" ? (
                <div className="detail-panel">
                  <h2 className="font-display text-lg font-bold tracking-tight">{t.detail.profiles}</h2>
                  <p className="mt-2 text-sm text-muted">{t.research.noLink}</p>
                  <ul className="profile-links mt-4">
                    {researchProfiles.map((p) => (
                      <li key={p.label}>
                        <ExternalLink href={p.href} newTab={t.newTab} className="btn btn-line btn-small">
                          {p.label}
                        </ExternalLink>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </aside>
          </div>

          {shared ? null : (
            <p className="mt-16">
              <a href={archivePath(lang)} className="btn btn-line btn-small">
                {t.detail.back}
              </a>
            </p>
          )}
        </div>
      </article>
    </SubpageShell>
  );
}
