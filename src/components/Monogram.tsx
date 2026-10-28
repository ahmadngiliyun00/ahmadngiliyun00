// Monogram AN yang mengikuti logo pribadi: A hijau, N biru.
export default function Monogram({
  className,
  title,
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <path d="M6 54 L24 10 H34 L22 54 Z" fill="var(--color-leaf)" />
      <path d="M24 10 H34 L44 54 H34 Z" fill="var(--color-leaf)" opacity="0.72" />
      <path d="M30 10 H40 L50 40 V10 H58 V54 H48 L38 24 V54 H30 Z" fill="var(--color-sky)" />
    </svg>
  );
}
