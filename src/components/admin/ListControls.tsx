"use client";

import { usePathname, useRouter } from "next/navigation";
import { useRef, useTransition } from "react";
import Icon from "@/components/admin/Icon";
import { PER_PAGE_OPTIONS } from "@/components/admin/paginate";

export type ListControlLabels = {
  search: string;
  searchPlaceholder: string;
  visibility: string;
  all: string;
  public: string;
  private: string;
  perPage: string;
  perOption: string;
};

type Visibility = "all" | "public" | "private";

// Pencarian, saringan status, dan jumlah per halaman untuk daftar CMS.
// Hasil berganti saat mengetik (jeda 300 ms) tanpa menekan Cari atau Enter. Saringan dikirim
// lewat URL, jadi daftar tetap disaring di server dan alamatnya bisa disimpan.
export default function ListControls({
  q,
  per,
  visibility,
  keep = {},
  labels,
}: {
  q: string;
  per: number;
  visibility?: Visibility; // tanpa nilai ini, pilihan status tidak ditampilkan
  keep?: Record<string, string>; // parameter lain yang dipertahankan, misalnya tab pesan
  labels: ListControlLabels;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const form = useRef<HTMLFormElement>(null);

  function apply() {
    if (form.current === null) return;
    const data = new FormData(form.current);
    const params = new URLSearchParams(keep);
    const text = String(data.get("q") ?? "").trim();
    if (text !== "") params.set("q", text);
    const v = String(data.get("v") ?? "all");
    if (v !== "all") params.set("v", v);
    const n = String(data.get("per") ?? "10");
    if (n !== "10") params.set("per", n);
    const qs = params.toString();
    startTransition(() => router.replace(qs === "" ? pathname : `${pathname}?${qs}`, { scroll: false }));
  }

  function later() {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = setTimeout(apply, 300);
  }

  return (
    <form
      ref={form}
      method="get"
      role="search"
      className="admin-filter"
      data-visibility={visibility === undefined ? undefined : ""}
      aria-busy={pending}
      onSubmit={(e) => {
        e.preventDefault();
        apply();
      }}
    >
      {Object.entries(keep).map(([k, val]) => (
        <input key={k} type="hidden" name={k} value={val} />
      ))}
      <div className="grid gap-1">
        <label htmlFor="list-q" className="text-sm text-muted">
          {labels.search}
        </label>
        <div className="admin-search">
          <Icon name="magnifying-glass" />
          <input
            id="list-q"
            name="q"
            type="search"
            className="field"
            defaultValue={q}
            placeholder={labels.searchPlaceholder}
            autoComplete="off"
            onChange={later}
          />
        </div>
      </div>
      {visibility === undefined ? null : (
        <div className="grid gap-1">
          <label htmlFor="list-v" className="text-sm text-muted">
            {labels.visibility}
          </label>
          <select id="list-v" name="v" className="field" defaultValue={visibility} onChange={apply}>
            <option value="all">{labels.all}</option>
            <option value="public">{labels.public}</option>
            <option value="private">{labels.private}</option>
          </select>
        </div>
      )}
      <div className="grid gap-1">
        <label htmlFor="list-per" className="text-sm text-muted">
          {labels.perPage}
        </label>
        <select id="list-per" name="per" className="field" defaultValue={String(per)} onChange={apply}>
          {PER_PAGE_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {labels.perOption.replace("{n}", String(n))}
            </option>
          ))}
        </select>
      </div>
    </form>
  );
}
