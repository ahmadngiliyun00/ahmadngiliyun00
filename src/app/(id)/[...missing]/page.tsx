import { notFound } from "next/navigation";

// Alamat yang tidak cocok dengan rute mana pun. Situs punya beberapa root layout, jadi 404 untuk
// alamat tak dikenal dibuat lewat rute penampung ini supaya memakai not-found.tsx berbahasa sesuai.
export default function Missing() {
  notFound();
}
