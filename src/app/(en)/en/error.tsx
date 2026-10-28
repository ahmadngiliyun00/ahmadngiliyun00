"use client";

import ServerErrorPage from "@/components/ServerErrorPage";

// Halaman 500 untuk galat saat merender halaman di bawah segmen ini. Galat di layout ditangani global-error.
export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  return <ServerErrorPage lang="en" error={error} retry={retry} />;
}
