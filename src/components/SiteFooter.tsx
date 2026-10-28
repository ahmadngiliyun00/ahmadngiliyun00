import Monogram from "@/components/Monogram";
import { copy, site, type Lang } from "@/data/profile";

// Footer yang sama untuk beranda, arsip capaian, dan halaman detail.
export default function SiteFooter({ lang }: { lang: Lang }) {
  const t = copy[lang];
  return (
    <footer className="footer">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div className="flex items-center gap-4">
            <Monogram className="h-14 w-14" />
            <div>
              <p className="font-display text-xl font-bold tracking-tight">{site.fullName}</p>
              <p className="text-sm text-muted">{t.footer.built}</p>
            </div>
          </div>
          <a href="#main" className="btn btn-line btn-small">
            {t.footer.top}
          </a>
        </div>
        <p className="mt-10 border-t border-line pt-6 text-sm text-muted">
          © {new Date().getFullYear()} {site.name}. ngiliyun.my.id
        </p>
      </div>
    </footer>
  );
}
