import type { NextRequest } from "next/server";
import { finishOAuth } from "@/server/social/oauth";

// Kembali dari layar izin Instagram: cocokkan state, tukar kode dengan token, simpan terenkripsi.
export async function GET(req: NextRequest) {
  return finishOAuth("instagram", req);
}
