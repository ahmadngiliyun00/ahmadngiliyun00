// Ilustrasi kecil untuk proyek unggulan, digambar dengan SVG agar ringan dan tajam.

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CLUSTER_COLORS = ["var(--color-leaf)", "var(--color-sky)", "var(--color-paper)"];

function ClusterVisual({ label }: { label: string }) {
  const rand = mulberry32(7);
  const centers: [number, number][] = [
    [88, 78],
    [236, 82],
    [160, 176],
  ];
  const points = centers.flatMap(([cx, cy], k) =>
    Array.from({ length: 22 }, () => {
      const a = rand() * Math.PI * 2;
      const r = 8 + Math.sqrt(rand()) * 42;
      return {
        x: Math.round((cx + Math.cos(a) * r) * 10) / 10,
        y: Math.round((cy + Math.sin(a) * r * 0.8) * 10) / 10,
        k,
      };
    }),
  );

  return (
    <svg viewBox="0 0 320 240" role="img" aria-label={label} className="project-visual-svg">
      {points.map((p, i) => (
        <line
          key={`l${i}`}
          x1={p.x}
          y1={p.y}
          x2={centers[p.k][0]}
          y2={centers[p.k][1]}
          stroke={CLUSTER_COLORS[p.k]}
          strokeOpacity="0.18"
        />
      ))}
      {points.map((p, i) => (
        <circle
          key={`p${i}`}
          className="pv-dot"
          cx={p.x}
          cy={p.y}
          r="4"
          fill={CLUSTER_COLORS[p.k]}
          style={{ transitionDelay: `${(i % 22) * 14}ms` }}
        />
      ))}
      {centers.map(([cx, cy], k) => (
        <g key={`c${k}`} className="pv-center">
          <circle cx={cx} cy={cy} r="13" fill={CLUSTER_COLORS[k]} fillOpacity="0.16" />
          <circle cx={cx} cy={cy} r="13" fill="none" stroke={CLUSTER_COLORS[k]} strokeWidth="2" />
          <circle cx={cx} cy={cy} r="5" fill={CLUSTER_COLORS[k]} stroke="var(--color-ink)" strokeWidth="2" />
        </g>
      ))}
    </svg>
  );
}

function SentimentVisual({ label, names }: { label: string; names: [string, string, string] }) {
  const rows = [
    { name: names[0], value: 0.62, color: "var(--color-leaf)" },
    { name: names[1], value: 0.24, color: "var(--color-paper)" },
    { name: names[2], value: 0.14, color: "var(--color-sky)" },
  ];

  return (
    <svg viewBox="0 0 320 240" role="img" aria-label={label} className="project-visual-svg">
      <g>
        <rect x="28" y="30" width="148" height="34" rx="17" fill="var(--color-line)" />
        <rect x="40" y="43" width="86" height="8" rx="4" fill="var(--color-muted)" fillOpacity="0.55" />
        <rect x="132" y="43" width="30" height="8" rx="4" fill="var(--color-leaf)" />
        <rect x="144" y="74" width="148" height="34" rx="17" fill="var(--color-line)" />
        <rect x="156" y="87" width="54" height="8" rx="4" fill="var(--color-sky)" />
        <rect x="216" y="87" width="62" height="8" rx="4" fill="var(--color-muted)" fillOpacity="0.55" />
      </g>
      {rows.map((r, i) => {
        const y = 136 + i * 32;
        const w = 196 * r.value;
        return (
          <g key={r.name}>
            <text x="28" y={y + 13} fill="var(--color-muted)" fontSize="12" fontFamily="var(--font-sans)">
              {r.name}
            </text>
            <rect x="96" y={y} width="196" height="18" rx="9" fill="var(--color-line)" fillOpacity="0.6" />
            <rect
              className="pv-bar"
              x="96"
              y={y}
              width={w}
              height="18"
              rx="9"
              fill={r.color}
              style={{ transitionDelay: `${i * 90}ms` }}
            />
            <text
              x={96 + w + 8}
              y={y + 13}
              fill="var(--color-fg)"
              fontSize="12"
              fontWeight="600"
              fontFamily="var(--font-sans)"
            >
              {Math.round(r.value * 100)}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function ProjectVisual({
  kind,
  label,
  sentimentNames,
}: {
  kind: "cluster" | "sentiment";
  label: string;
  sentimentNames: [string, string, string];
}) {
  return kind === "cluster" ? (
    <ClusterVisual label={label} />
  ) : (
    <SentimentVisual label={label} names={sentimentNames} />
  );
}
