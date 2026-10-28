import { notFound } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import EntryEditor from "@/components/admin/EntryEditor";
import { getCollection } from "@/content/collections";
import { adminCopy as t } from "@/data/admin";
import { requireAdmin } from "@/server/auth/session";
import { getEntryById } from "@/server/content";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ collection: string; id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
};

export default async function AdminEdit({ params, searchParams }: Props) {
  const session = await requireAdmin();
  const p = await params;
  const cfg = getCollection(p.collection);
  const id = Number(p.id);
  if (cfg === undefined || !Number.isInteger(id)) notFound();
  const entry = await getEntryById(id);
  if (entry === undefined || entry.collection !== cfg.key) notFound();
  const sp = await searchParams;
  return (
    <AdminShell session={session} active={cfg.key}>
      {sp.error ? (
        <p role="alert" className="admin-error mb-4">
          {sp.error}
        </p>
      ) : null}
      <EntryEditor cfg={cfg} entry={entry} notice={sp.saved ? t.form.created : undefined} />
    </AdminShell>
  );
}
