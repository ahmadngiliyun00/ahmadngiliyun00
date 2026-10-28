// Monogram "A di dalam N". Huruf N solid; batang kiri, diagonal, dan palang hijau membentuk A.
// Hijau menandai A, biru menandai N. Rasional ada di docs/logo-options/v2/IDENTITAS_LOGO_v2.md.
export default function Monogram({
  className,
  title,
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="96 96 320 320"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <path
        d="M120 400 L120 112 L176 112 L336 312 L336 135.5 L392 205.5 L392 400 L336 400 L176 200 L176 400 Z"
        fill="var(--color-fg)"
      />
      <path d="M176 268 L336 268 L336 300 L176 300 Z" fill="var(--color-leaf)" />
      <path d="M336 112 L392 112 L392 182 Z" fill="var(--color-sky)" />
    </svg>
  );
}
