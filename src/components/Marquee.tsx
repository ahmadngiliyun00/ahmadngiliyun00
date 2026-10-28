import type { CSSProperties } from "react";

// Running text. Salinan kedua hanya untuk menyambung putaran, jadi disembunyikan
// dari pembaca layar. Gerakan berhenti saat disorot dan saat "kurangi gerakan" aktif.
export default function Marquee({
  items,
  label,
  reverse = false,
  variant = "solid",
  seconds = 48,
  decorative = false,
}: {
  items: string[];
  label?: string;
  reverse?: boolean;
  variant?: "solid" | "outline" | "giant";
  seconds?: number;
  decorative?: boolean;
}) {
  const row = (hidden: boolean) => (
    <ul
      className={hidden ? "marquee-copy marquee-copy-2" : "marquee-copy"}
      aria-hidden={hidden ? true : undefined}
    >
      {items.map((item, i) => (
        <li key={`${item}-${i}`} className="marquee-item">
          <span>{item}</span>
          <span className="marquee-sep" aria-hidden="true" />
        </li>
      ))}
    </ul>
  );

  return (
    <div
      className={`marquee marquee-${variant}`}
      data-reverse={reverse ? "true" : undefined}
      role={decorative ? undefined : "group"}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative ? true : undefined}
      style={{ "--marquee-duration": `${seconds}s` } as CSSProperties}
    >
      <div className="marquee-track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
