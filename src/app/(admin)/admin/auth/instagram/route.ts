import { startOAuth } from "@/server/social/oauth";

// Memulai koneksi Instagram untuk menarik postingan (Pengaturan, Media sosial). Hanya admin.
export async function GET() {
  return startOAuth("instagram");
}
