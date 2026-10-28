import ExternalLink from "@/components/ExternalLink";
import ProjectVisual from "@/components/ProjectVisual";
import type { FeaturedProject } from "@/content/types";
import { copy, type Lang } from "@/data/profile";
import { languageColors } from "@/lib/github";

export function visualLabel(project: FeaturedProject, lang: Lang): string {
  const t = copy[lang].projects;
  if (project.visual === "cluster") return t.visualCluster;
  if (project.visual === "vision") return t.visualVision;
  return t.visualSentiment;
}

// Kartu proyek unggulan. "full" untuk halaman Proyek (ilustrasi besar, tag, demo, kode),
// "compact" untuk beranda (ilustrasi kecil, ringkasan, satu tautan).
export default function ProjectFeature({
  project,
  lang,
  variant,
  flip = false,
}: {
  project: FeaturedProject;
  lang: Lang;
  variant: "full" | "compact";
  flip?: boolean;
}) {
  const t = copy[lang];
  const visual = (
    <ProjectVisual
      kind={project.visual}
      label={visualLabel(project, lang)}
      sentimentNames={t.projects.sentimentLabels}
      visionOther={t.projects.visionOther}
    />
  );
  const meta = (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
      <span className="lang-dot">
        <span style={{ background: languageColors[project.stack] ?? "var(--color-muted)" }} />
        {project.stack}
      </span>
      {project.copyright ? <span className="badge">{t.projects.copyright}</span> : null}
      {project.badge ? <span className="badge badge-sky">{project.badge[lang]}</span> : null}
    </div>
  );

  if (variant === "compact") {
    return (
      <article className="project-card" data-spot>
        <div className="project-card-visual">{visual}</div>
        <div className="project-card-body">
          {meta}
          <h3 className="mt-3 font-display text-2xl font-bold tracking-tight">{project.name}</h3>
          <p className="mt-2 text-sm text-muted">{project.summary[lang]}</p>
          <p className="mt-auto pt-4">
            <ExternalLink href={project.demo ?? project.repo} newTab={t.newTab} className="link text-sm">
              {project.demo ? t.projects.demo : t.projects.code}
            </ExternalLink>
          </p>
        </div>
      </article>
    );
  }

  return (
    <article className="feature" data-spot data-flip={flip ? "true" : undefined}>
      <div className="feature-visual">{visual}</div>
      <div className="feature-body">
        {meta}
        <h3 className="mt-4 font-display text-[clamp(2rem,4vw,2.9rem)] font-bold leading-none tracking-tight">
          {project.name}
        </h3>
        <p className="mt-4 max-w-[52ch] text-muted">{project.summary[lang]}</p>
        <ul className="tags mt-5">
          {project.tags[lang].map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
        <div className="mt-7 flex flex-wrap gap-3">
          {project.demo ? (
            <ExternalLink href={project.demo} newTab={t.newTab} className="btn btn-solid btn-small">
              {t.projects.demo}
            </ExternalLink>
          ) : null}
          <ExternalLink href={project.repo} newTab={t.newTab} className="btn btn-line btn-small">
            {t.projects.code}
          </ExternalLink>
        </div>
      </div>
    </article>
  );
}
