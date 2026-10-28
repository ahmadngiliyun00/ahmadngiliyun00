import Analytics from "@/components/Analytics";
import ExternalLink from "@/components/ExternalLink";
import PageHead from "@/components/PageHead";
import Reveal from "@/components/Reveal";
import Section from "@/components/Section";
import SubpageShell from "@/components/SubpageShell";
import { programLabels, type Course, type Lang } from "@/content/types";
import { copy } from "@/data/profile";
import { pagePath } from "@/lib/nav";
import { loadSite } from "@/server/content";

// Tahun akademik unik dari daftar kode semester, misalnya "2024/2025, 2025/2026".
function termYears(course: Course, lang: Lang, currentTerm: string, terms: Map<string, { id: string; en: string }>): string {
  const labels = course.terms
    .filter((code) => code !== currentTerm)
    .map((code) => terms.get(code)?.[lang] ?? code);
  return [...new Set(labels)].sort().join(", ");
}

function programNames(course: Course, lang: Lang): string {
  return course.programs.map((p) => programLabels[p][lang]).join(", ");
}

// Halaman Mengajar (/mengajar/, /en/teaching/): dua kampus dengan mata kuliah semester ini
// dan yang pernah diampu, tautan materi, serta bidang keahlian mengajar.
export default async function TeachingPage({ lang }: { lang: Lang }) {
  const t = copy[lang];
  const other: Lang = lang === "id" ? "en" : "id";
  const content = await loadSite();
  const teachingFocus = content.focus.map((e) => e.data);
  const termMap = new Map(content.term.map((e) => [e.data.code, e.data.label]));
  const currentTerm = content.term.find((e) => e.data.current)?.data.code ?? "";
  const teaching = content.institution.map((inst) => ({
    ...inst.data,
    courses: content.course.filter((c) => c.data.institution === inst.slug).map((c) => c.data),
  }));

  return (
    <SubpageShell lang={lang} current="teaching" backHome otherHref={pagePath(other, "teaching")}>
      <Analytics />
      <div className="page-head mx-auto max-w-6xl px-5 sm:px-8">
        <PageHead
          lang={lang}
          id="page-title"
          title={t.pages.teaching.title}
          intro={t.pages.teaching.intro}
          path={pagePath(lang, "teaching")}
        />
      </div>

      <Section id="courses" title={t.teaching.campusesTitle} intro={t.teaching.intro}>
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-16">
          {teaching.map((inst, i) => {
            const now = inst.courses.filter((c) => c.terms.includes(currentTerm));
            const past = inst.courses.filter((c) => !c.terms.includes(currentTerm));
            return (
              <Reveal key={inst.name} delay={i * 120}>
                <div>
                  <h3 className="font-display text-2xl font-bold tracking-tight">{inst.name}</h3>
                  <p className="mt-1 text-muted">{inst.role[lang]}</p>
                  <p className="mt-3 max-w-[56ch] text-sm text-muted">{inst.note[lang]}</p>

                  <h4 className="term-title mt-8">
                    {t.teaching.current}
                    <span className="term-label">{termMap.get(currentTerm)?.[lang] ?? currentTerm}</span>
                  </h4>
                  {now.length === 0 ? (
                    <p className="mt-3 text-sm text-muted">{t.teaching.noneCurrent}</p>
                  ) : (
                    <ul className="courses mt-4">
                      {now.map((course) => (
                        <li key={course.name.id} className="course">
                          <span className="min-w-0">
                            <span className="course-name">{course.name[lang]}</span>
                            <span className="course-program">{programNames(course, lang)}</span>
                          </span>
                          {course.repo ? (
                            <ExternalLink href={course.repo} newTab={t.newTab} className="course-link">
                              {t.teaching.materials}
                            </ExternalLink>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  )}

                  {past.length === 0 ? null : (
                    <>
                      <h4 className="term-title mt-10">{t.teaching.past}</h4>
                      <ul className="past-courses mt-4">
                        {past.map((course) => (
                          <li key={course.name.id} className="past-course">
                            <span className="past-name">
                              {course.name[lang]}
                              {course.repo ? (
                                <>
                                  {" "}
                                  <ExternalLink href={course.repo} newTab={t.newTab} className="course-link">
                                    {t.teaching.materials}
                                  </ExternalLink>
                                </>
                              ) : null}
                            </span>
                            <span className="past-meta">
                              {programNames(course, lang)}, {termYears(course, lang, currentTerm, termMap)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      </Section>

      {teachingFocus.length === 0 ? null : (
        <Section id="focus" title={t.teaching.focusTitle} intro={t.teaching.focusIntro}>
          <ul className="beyond focus-grid">
            {teachingFocus.map((f, i) => (
              <li key={f.title.id}>
                <Reveal delay={i * 70} className="h-full">
                  <div className="beyond-item">
                    <h3 className="font-display text-lg font-bold tracking-tight">{f.title[lang]}</h3>
                    <p className="mt-2 text-sm text-muted">{f.courses[lang]}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </SubpageShell>
  );
}
