import { notFound } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import Icon from "@/components/admin/Icon";
import ImportForm from "@/components/admin/ImportForm";
import { getCollection } from "@/content/collections";
import { adminCopy } from "@/data/admin";
import { requireAdmin } from "@/server/auth/session";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ collection: string }> };

export default async function AdminImport({ params }: Props) {
  const session = await requireAdmin();
  const cfg = getCollection((await params).collection);
  if (cfg === undefined) notFound();
  const t = adminCopy.transfer;
  const base = `/admin/${cfg.key}/`;
  return (
    <AdminShell session={session} active={cfg.key}>
      <p>
        <a href={base} className="link text-sm">
          <Icon name="chevron-left" /> {t.back}
        </a>
      </p>
      <h1 className="admin-title mt-3">{t.title.replace("{name}", cfg.label.toLowerCase())}</h1>
      <p className="admin-intro">{t.intro}</p>
      <ol className="admin-steps">
        {t.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <p className="mt-4">
        <a href={`${base}export/`} className="btn btn-line btn-small" download>
          <Icon name="file-arrow-down" />
          {t.export}
        </a>
      </p>
      <ImportForm collection={cfg.key} listHref={base} labels={t} />
    </AdminShell>
  );
}
