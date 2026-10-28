import { deleteEntryAction, saveEntryAction } from "@/app/(admin)/admin/actions";
import ConfirmButton from "@/components/admin/ConfirmButton";
import EntryForm from "@/components/admin/EntryForm";
import type { FieldValue } from "@/components/admin/FieldInput";
import { formLabels } from "@/components/admin/labels";
import PostStats from "@/components/admin/PostStats";
import ShareBox from "@/components/admin/ShareBox";
import type { CollectionConfig } from "@/content/collections";
import { formValue, type Doc, type Option } from "@/content/fields";
import type { Entry } from "@/content/types";
import { adminCopy as t } from "@/data/admin";
import { site } from "@/data/profile";
import { listEntries, primaryLang } from "@/server/content";
import { getFileMeta } from "@/server/files";
import { viewStats } from "@/server/views";

// Halaman tambah atau ubah satu data (server component).
export default async function EntryEditor({
  cfg,
  entry,
}: {
  cfg: CollectionConfig;
  entry: Entry | null;
}) {
  const saved = (entry?.data ?? {}) as Doc;
  const data = entry !== null ? (cfg.fill ? cfg.fill(entry.slug, saved) : saved) : saved;
  const values: Record<string, FieldValue> = {};
  for (const f of cfg.fields) values[f.name] = formValue(f, data);

  const references: Record<string, Option[]> = {};
  for (const f of cfg.fields) {
    if (f.type !== "reference") continue;
    const list = await listEntries(f.collection as "institution", { publicOnly: false });
    references[f.collection] = list.map((e) => ({ value: e.slug, label: String((e.data as Doc).name ?? e.slug) }));
  }

  const fileId = typeof data.fileId === "string" ? data.fileId : "";
  const meta = fileId === "" ? undefined : await getFileMeta(fileId);
  const siteUrl = (process.env.SITE_URL ?? site.url).replace(/\/+$/, "");
  const withPage = cfg.hasPage ? cfg.hasPage(data) : true;
  const publicUrl =
    entry !== null
      ? cfg.publicPath
        ? entry.visibility === "public"
          ? withPage
            ? `${siteUrl}${cfg.publicPath.id}${entry.slug}/`
            : null
          : null
        : null
      : null;
  const stats = entry !== null ? (cfg.key === "post" ? await viewStats(entry.id).catch(() => null) : null) : null;
  const heading = (entry === null ? t.form.newTitle : t.form.editTitle).replace("{name}", cfg.singular);

  return (
    <>
      <p>
        <a href={`/admin/${cfg.key}/`} className="link text-sm">
          {t.form.back}
        </a>
      </p>
      <h1 className="admin-title mt-3">{heading}</h1>
      {entry !== null ? <p className="admin-intro">{cfg.title(data)}</p> : null}

      <div className="admin-editor" data-side={entry !== null ? "" : undefined}>
        <EntryForm
          action={saveEntryAction}
          hidden={{ collection: cfg.key, id: entry === null ? "" : String(entry.id) }}
          fields={cfg.fields}
          values={values}
          meta={{
            slug: entry?.slug ?? "",
            visibility: entry?.visibility ?? "private",
            position: entry?.position ?? 0,
          }}
          references={references}
          file={meta ? { url: `/files/${meta.id}/`, name: meta.originalName } : null}
          labels={formLabels}
          primary={await primaryLang()}
        />

        {entry !== null ? (
          <aside className="admin-editor-side">
            {stats === null ? null : <PostStats stats={stats} hasPage={entry.visibility === "public" ? withPage : false} />}
            {cfg.key === "achievement" ? (
              <ShareBox id={entry.id} active={entry.shared} siteUrl={siteUrl} publicUrl={publicUrl} labels={t.share} />
            ) : null}
            <form action={deleteEntryAction} className="admin-card">
              <input type="hidden" name="collection" value={cfg.key} />
              <input type="hidden" name="id" value={entry.id} />
              <ConfirmButton label={t.form.delete} confirm={t.form.deleteConfirm} className="btn btn-line btn-small admin-danger" />
            </form>
          </aside>
        ) : null}
      </div>
    </>
  );
}
