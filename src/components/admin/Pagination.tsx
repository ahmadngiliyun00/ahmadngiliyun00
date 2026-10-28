import Icon from "@/components/admin/Icon";
import { pageNumbers } from "@/components/admin/paginate";

export type PaginationLabels = { label: string; prev: string; next: string; page: string };

// Navigasi halaman untuk daftar CMS. hrefFor membangun alamat halaman dengan saringan yang sama.
export default function Pagination({
  page,
  pages,
  hrefFor,
  labels,
}: {
  page: number;
  pages: number;
  hrefFor: (n: number) => string;
  labels: PaginationLabels;
}) {
  if (pages <= 1) return null;
  return (
    <nav className="admin-pages" aria-label={labels.label}>
      {page > 1 ? (
        <a href={hrefFor(page - 1)} className="btn btn-line btn-small" rel="prev">
          <Icon name="chevron-left" />
          {labels.prev}
        </a>
      ) : null}
      <ol>
        {pageNumbers(page, pages).map((n, i) =>
          n === null ? (
            <li key={`gap-${i}`} aria-hidden="true" className="admin-pages-gap">
              ...
            </li>
          ) : (
            <li key={n}>
              <a
                href={hrefFor(n)}
                className="admin-page"
                aria-current={n === page ? "page" : undefined}
                aria-label={labels.page.replace("{n}", String(n))}
              >
                {n}
              </a>
            </li>
          ),
        )}
      </ol>
      {page < pages ? (
        <a href={hrefFor(page + 1)} className="btn btn-line btn-small" rel="next">
          {labels.next}
          <Icon name="chevron-right" className="admin-icon-after" />
        </a>
      ) : null}
    </nav>
  );
}
