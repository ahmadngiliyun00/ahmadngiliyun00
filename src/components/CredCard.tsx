import ExternalLink from "@/components/ExternalLink";
import type { AchievementCard } from "@/lib/achievements";

export type CredCardLabels = { verify: string; details: string; newTab: string };

// Kartu satu capaian. Dipakai di sorotan beranda dan halaman arsip.
export default function CredCard({
  item,
  labels,
  headingLevel = 3,
}: {
  item: AchievementCard;
  labels: CredCardLabels;
  headingLevel?: 3 | 4;
}) {
  const Heading = headingLevel === 3 ? "h3" : "h4";
  return (
    <article className="cred" data-spot data-kind={item.kind}>
      <p className="cred-meta">
        <span className="cred-kind">{item.kindName}</span>
        <span>{item.date}</span>
      </p>
      <Heading className="cred-title">
        <a href={item.href} className="cred-link">
          {item.title}
        </a>
      </Heading>
      <p className="cred-issuer">{item.issuer}</p>
      {item.authorship ? <p className="cred-author">{item.authorship}</p> : null}
      {item.summary ? <p className="cred-summary">{item.summary}</p> : null}
      <div className="cred-actions">
        <a href={item.href} className="link text-sm" aria-hidden="true" tabIndex={-1}>
          {labels.details}
        </a>
        {item.verifyUrl ? (
          <ExternalLink href={item.verifyUrl} newTab={labels.newTab} className="cred-verify">
            {labels.verify}
            <span className="sr-only">: {item.title}</span>
          </ExternalLink>
        ) : null}
      </div>
    </article>
  );
}
