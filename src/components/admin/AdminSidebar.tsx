"use client";

import { useState, type ReactNode } from "react";
import Icon from "@/components/admin/Icon";

export type NavLink = { href: string; label: string; current: boolean; count?: { n: number; label: string } };
export type NavGroup = { key: string; label: string; icon: string; links: NavLink[] };

function Link({ link, icon }: { link: NavLink; icon?: string }) {
  return (
    <a href={link.href} aria-current={link.current ? "page" : undefined}>
      {icon ? <Icon name={icon} className="admin-nav-icon" /> : null}
      <span>{link.label}</span>
      {link.count ? (
        <span className="admin-nav-count" aria-label={link.count.label}>
          {link.count.n}
        </span>
      ) : null}
    </a>
  );
}

// Navigasi samping CMS. Grup bisa dilipat; grup yang memuat halaman aktif terbuka sejak awal.
// Di layar sempit seluruh menu tersembunyi di balik tombol Menu.
export default function AdminSidebar({
  brand,
  label,
  menuLabel,
  top,
  groups,
  footer,
}: {
  brand: ReactNode;
  label: string;
  menuLabel: string;
  top: { link: NavLink; icon: string }[];
  groups: NavGroup[];
  footer: ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(groups.map((g) => [g.key, g.links.some((l) => l.current)])),
  );

  return (
    <aside className="admin-side" data-open={menuOpen ? "" : undefined}>
      <div className="admin-side-head">
        {brand}
        <button
          type="button"
          className="btn btn-line btn-small admin-menu-toggle"
          aria-expanded={menuOpen}
          aria-controls="admin-menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <Icon name={menuOpen ? "xmark" : "bars"} />
          {menuLabel}
        </button>
      </div>
      <div id="admin-menu" className="admin-menu">
        <nav aria-label={label} className="admin-nav">
          {top.map((t) => (
            <Link key={t.link.href} link={t.link} icon={t.icon} />
          ))}
          {groups.map((g) => {
            const expanded = open[g.key] === true;
            const panel = `admin-nav-${g.key}`;
            return (
              <div key={g.key} className="admin-nav-group">
                <button
                  type="button"
                  className="admin-nav-toggle"
                  aria-expanded={expanded}
                  aria-controls={panel}
                  onClick={() => setOpen((s) => ({ ...s, [g.key]: !expanded }))}
                >
                  <Icon name={g.icon} className="admin-nav-icon" />
                  <span>{g.label}</span>
                  <Icon name="chevron-down" className="admin-nav-chevron" />
                </button>
                <div id={panel} className="admin-nav-links" hidden={!expanded}>
                  {g.links.map((l) => (
                    <Link key={l.href} link={l} />
                  ))}
                </div>
              </div>
            );
          })}
        </nav>
        {footer}
      </div>
    </aside>
  );
}
