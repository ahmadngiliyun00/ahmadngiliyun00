import AdminErrorPage from "@/components/admin/AdminErrorPage";

// 404 di CMS: data atau koleksi yang dicari tidak ada (notFound() di halaman CMS).
export default function AdminNotFound() {
  return <AdminErrorPage code={404} />;
}
