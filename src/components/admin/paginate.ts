// Pembagian halaman untuk daftar CMS. Default 10 data per halaman.
export const PER_PAGE_OPTIONS = [10, 25, 50, 100] as const;

export type Page<T> = { items: T[]; page: number; pages: number; per: number; from: number; to: number; total: number };

export function paginate<T>(list: T[], pageParam?: string, perParam?: string): Page<T> {
  const asked = Number(perParam);
  const per = (PER_PAGE_OPTIONS as readonly number[]).includes(asked) ? asked : 10;
  const total = list.length;
  const pages = Math.max(1, Math.ceil(total / per));
  const wanted = Math.floor(Number(pageParam));
  const page = Number.isFinite(wanted) ? Math.min(Math.max(wanted, 1), pages) : 1;
  const start = (page - 1) * per;
  const items = list.slice(start, start + per);
  return { items, page, pages, per, from: total === 0 ? 0 : start + 1, to: start + items.length, total };
}

// Nomor halaman yang ditampilkan: pertama, terakhir, dan dua di sekitar halaman aktif.
// null menandai celah (ditampilkan sebagai elipsis).
export function pageNumbers(page: number, pages: number): (number | null)[] {
  const out: (number | null)[] = [];
  for (let n = 1; n <= pages; n++) {
    const near = Math.abs(n - page) <= 1;
    if (n === 1 || n === pages || near) out.push(n);
    else if (out[out.length - 1] !== null) out.push(null);
  }
  return out;
}
