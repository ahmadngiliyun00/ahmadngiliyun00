// Ilustrasi halaman error, turunan plot K-Means di hero.
// "lost" (404): satu titik tersesat di luar tiga kluster dan garis putus-putus mencari pusat terdekat.
// "broken" (500): titik bergetar dan pusat kluster berkedip seperti perhitungan yang gagal.
// Hanya hiasan; animasinya di globals.css (bagian Halaman error) dan mati bila "kurangi gerakan" aktif.

const CLUSTERS = [
  { cx: 78, cy: 70, color: "var(--color-leaf)" },
  { cx: 214, cy: 58, color: "var(--color-sky)" },
  { cx: 150, cy: 158, color: "var(--color-paper)" },
];

function dots() {
  let seed = 11;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  return CLUSTERS.flatMap((c, k) =>
    Array.from({ length: 13 }, (_, i) => {
      const angle = rand() * Math.PI * 2;
      const radius = 7 + rand() * 30;
      return {
        key: `${k}-${i}`,
        k,
        x: Math.round(c.cx + Math.cos(angle) * radius),
        y: Math.round(c.cy + Math.sin(angle) * radius * 0.8),
        delay: Math.round(rand() * 2400),
      };
    }),
  );
}

const DOTS = dots();

export default function ErrorPlot({ variant }: { variant: "lost" | "broken" }) {
  return (
    <svg viewBox="0 0 300 220" className="error-plot" data-variant={variant} aria-hidden="true">
      {DOTS.map((d) => (
        <line key={`l${d.key}`} x1={CLUSTERS[d.k].cx} y1={CLUSTERS[d.k].cy} x2={d.x} y2={d.y} className="error-plot-link" />
      ))}
      {DOTS.map((d) => (
        <circle
          key={d.key}
          cx={d.x}
          cy={d.y}
          r={3}
          fill={CLUSTERS[d.k].color}
          className="error-plot-dot"
          style={{ animationDelay: `${d.delay}ms` }}
        />
      ))}
      {CLUSTERS.map((c, k) => (
        <g key={c.color} className="error-plot-center" style={{ animationDelay: `${k * 400}ms` }}>
          <circle cx={c.cx} cy={c.cy} r={9} fill="none" stroke={c.color} strokeWidth={2} />
          <circle cx={c.cx} cy={c.cy} r={3} fill={c.color} />
        </g>
      ))}
      {variant === "lost" ? (
        <g className="error-plot-stray">
          {CLUSTERS.map((c) => (
            <line key={`s${c.color}`} x1={262} y1={170} x2={c.cx} y2={c.cy} className="error-plot-search" />
          ))}
          <circle cx={262} cy={170} r={13} className="error-plot-halo" />
          <circle cx={262} cy={170} r={5} className="error-plot-lost" />
        </g>
      ) : null}
    </svg>
  );
}
