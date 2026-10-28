import type { ReactNode } from "react";
import Reveal from "@/components/Reveal";

// Satu bagian berjudul h2 dengan kalimat pengantar, dipakai beranda dan halaman dalam.
// action: tautan "Lihat semua" di samping judul.
export default function Section({
  id,
  title,
  intro,
  action,
  children,
  wide = false,
  className,
}: {
  id: string;
  title: string;
  intro?: string;
  action?: ReactNode;
  children: ReactNode;
  wide?: boolean;
  className?: string;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={className ? `section ${className}` : "section"}>
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className={action ? "section-head section-head-action" : wide ? "section-head" : "section-head max-w-3xl"}>
          <div className={action ? "max-w-3xl" : undefined}>
            <h2 id={`${id}-title`} className="section-title">
              {title}
            </h2>
            {intro ? <p className="section-intro">{intro}</p> : null}
          </div>
          {action}
        </Reveal>
        {children}
      </div>
    </section>
  );
}
