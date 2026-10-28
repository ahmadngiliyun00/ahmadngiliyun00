"use client";

// Tombol kirim yang meminta konfirmasi lebih dulu (misalnya hapus permanen).
export default function ConfirmButton({ label, confirm, className }: { label: string; confirm: string; className?: string }) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!window.confirm(confirm)) e.preventDefault();
      }}
    >
      {label}
    </button>
  );
}
