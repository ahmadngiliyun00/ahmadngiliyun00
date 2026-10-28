import { notFound } from "next/navigation";
import { saveSettingsAction } from "@/app/(admin)/admin/actions";
import AdminShell from "@/components/admin/AdminShell";
import EntryForm from "@/components/admin/EntryForm";
import type { FieldValue } from "@/components/admin/FieldInput";
import { formLabels } from "@/components/admin/labels";
import { getSettingsConfig } from "@/content/collections";
import { formValue } from "@/content/fields";
import { adminCopy } from "@/data/admin";
import { site } from "@/data/profile";
import { requireAdmin } from "@/server/auth/session";
import { getSettingDoc } from "@/server/content";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ key: string }> };

export default async function AdminSettings({ params }: Props) {
  const session = await requireAdmin();
  const cfg = getSettingsConfig((await params).key);
  if (cfg === undefined) notFound();
  const doc = await getSettingDoc(cfg.key);
  const values: Record<string, FieldValue> = {};
  for (const f of cfg.fields) values[f.name] = formValue(f, doc);
  return (
    <AdminShell session={session} active={`settings-${cfg.key}`}>
      <h1 className="admin-title">{cfg.label}</h1>
      <p className="admin-intro">{cfg.description}</p>
      {cfg.key === "seo" ? <SeoLinks htmlFile={typeof doc.googleHtmlFile === "string" ? doc.googleHtmlFile : undefined} /> : null}
      <div className="mt-8 max-w-4xl">
        <EntryForm action={saveSettingsAction} hidden={{ key: cfg.key }} fields={cfg.fields} values={values} meta={null} labels={formLabels} />
      </div>
    </AdminShell>
  );
}

// Alamat yang diminta Search Console, supaya tidak perlu diketik ulang.
function SeoLinks({ htmlFile }: { htmlFile?: string }) {
  const t = adminCopy.settings.seo;
  const rows = [
    { label: t.sitemap, href: `${site.url}/sitemap.xml` },
    { label: t.robots, href: `${site.url}/robots.txt` },
  ];
  if (htmlFile) rows.push({ label: t.htmlFile, href: `${site.url}/${htmlFile}` });
  return (
    <section className="admin-card mt-6 max-w-4xl" aria-labelledby="seo-links">
      <h2 id="seo-links" className="font-display text-lg font-bold">
        {t.title}
      </h2>
      <dl className="mt-3 grid gap-2 text-sm">
        {rows.map((r) => (
          <div key={r.href}>
            <dt className="text-muted">{r.label}</dt>
            <dd>
              <code>{r.href}</code>
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-sm text-muted">{t.note}</p>
    </section>
  );
}
