import { notFound } from "next/navigation";
import { saveSettingsAction } from "@/app/(admin)/admin/actions";
import AdminShell from "@/components/admin/AdminShell";
import EntryForm from "@/components/admin/EntryForm";
import type { FieldValue } from "@/components/admin/FieldInput";
import { formLabels } from "@/components/admin/labels";
import { getSettingsConfig } from "@/content/collections";
import { formValue } from "@/content/fields";
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
      <div className="mt-8 max-w-4xl">
        <EntryForm action={saveSettingsAction} hidden={{ key: cfg.key }} fields={cfg.fields} values={values} meta={null} labels={formLabels} />
      </div>
    </AdminShell>
  );
}
