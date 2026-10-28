// Ikon garis sederhana untuk bagian "Yang saya kerjakan".
export default function AreaIcon({ kind }: { kind: "teach" | "ai" | "web" | "server" }) {
  const common = {
    viewBox: "0 0 32 32",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-7 w-7",
    "aria-hidden": true,
  };

  if (kind === "teach") {
    return (
      <svg {...common}>
        <path d="M3 12 16 6l13 6-13 6Z" />
        <path d="M9 15v6c0 2 3.2 4 7 4s7-2 7-4v-6" />
        <path d="M29 12v8" />
      </svg>
    );
  }
  if (kind === "ai") {
    return (
      <svg {...common}>
        <circle cx="8" cy="9" r="2.5" />
        <circle cx="24" cy="9" r="2.5" />
        <circle cx="16" cy="23" r="2.5" />
        <circle cx="16" cy="13" r="1.5" />
        <path d="M10.2 10.2 14.7 12.3M21.8 10.2 17.3 12.3M16 14.5v6" />
        <path d="M6 20c-1.5 3 .5 6 4 6M26 20c1.5 3-.5 6-4 6" />
      </svg>
    );
  }
  if (kind === "web") {
    return (
      <svg {...common}>
        <rect x="3" y="6" width="20" height="15" rx="2.5" />
        <path d="M3 10h20" />
        <rect x="20" y="13" width="9" height="14" rx="2" />
        <path d="M23.5 24h2" />
        <path d="M8 15l-2 2 2 2M13 15l2 2-2 2" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <rect x="5" y="5" width="22" height="8" rx="2" />
      <rect x="5" y="19" width="22" height="8" rx="2" />
      <path d="M9 9h.01M9 23h.01M14 9h8M14 23h8M16 13v6" />
    </svg>
  );
}
