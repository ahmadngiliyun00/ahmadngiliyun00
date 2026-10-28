import type { ReactNode } from "react";

export default function ExternalLink({
  href,
  newTab,
  className,
  children,
}: {
  href: string;
  newTab: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
      <span className="sr-only"> ({newTab})</span>
    </a>
  );
}
