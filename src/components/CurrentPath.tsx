"use client";

import { useEffect, useState } from "react";

// Alamat yang sedang dibuka, untuk rincian halaman error. Dibaca setelah halaman tampil,
// karena halaman not-found dan error tidak menerima alamat dari server.
export default function CurrentPath() {
  const [path, setPath] = useState("");
  useEffect(() => {
    setPath(decodeURI(window.location.pathname + window.location.search));
  }, []);
  return <code className="error-path">{path === "" ? "..." : path}</code>;
}
