"use client";

import AdminErrorPage from "@/components/admin/AdminErrorPage";

// 500 di CMS: galat saat merender halaman CMS.
export default function AdminError({ error, retry }: { error: unknown; retry: () => void }) {
  return <AdminErrorPage code={500} error={error} retry={retry} />;
}
