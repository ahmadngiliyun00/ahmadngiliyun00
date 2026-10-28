import { notFound } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import EntryEditor from "@/components/admin/EntryEditor";
import { getCollection } from "@/content/collections";
import { requireAdmin } from "@/server/auth/session";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ collection: string }> };

export default async function AdminNew({ params }: Props) {
  const session = await requireAdmin();
  const cfg = getCollection((await params).collection);
  if (cfg === undefined) notFound();
  return (
    <AdminShell session={session} active={cfg.key}>
      <EntryEditor cfg={cfg} entry={null} />
    </AdminShell>
  );
}
