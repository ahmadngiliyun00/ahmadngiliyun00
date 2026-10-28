import type { NextRequest } from "next/server";
import { site } from "@/data/profile";
import { isBot, viewSource } from "@/lib/views";
import { getSession } from "@/server/auth/session";
import { clientIp, isLimited, recordFailure } from "@/server/auth/rate-limit";
import { loadSite } from "@/server/content";
import { recordView } from "@/server/views";

// Menerima satu kunjungan dari halaman tulisan (komponen ViewBeacon). Selalu membalas 204
// supaya peramban tidak mendapat informasi apa pun; yang tidak memenuhi syarat diabaikan diam-diam.
// Tidak dihitung: robot, admin yang sedang masuk, permintaan dari situs lain, tulisan yang
// tidak public atau tidak punya halaman, dan lebih dari 300 kiriman per IP per jam.

const LIMIT = { limit: 300, windowMs: 60 * 60 * 1000 };
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function done() {
  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
  // Hanya dari halaman situs ini sendiri.
  const origin = req.headers.get("origin") ?? "";
  const host = req.headers.get("host") ?? "";
  let sameOrigin = false;
  try {
    sameOrigin = origin === "" ? false : new URL(origin).host === host;
  } catch {
    sameOrigin = false;
  }
  if (!sameOrigin) return done();

  const userAgent = req.headers.get("user-agent") ?? "";
  if (isBot(userAgent)) return done();
  if ((await getSession()) !== null) return done();

  let body: { slug?: unknown; lang?: unknown; src?: unknown; ref?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return done();
  }
  const slug = typeof body.slug === "string" ? body.slug : "";
  if (!SLUG.test(slug)) return done();
  const lang = body.lang === "en" ? "en" : "id";

  const entry = (await loadSite()).post.find((e) => e.slug === slug);
  if (entry === undefined) return done();
  if (entry.visibility !== "public") return done();
  if ((entry.data.body?.[lang] ?? "") === "") return done();

  const ip = await clientIp();
  const keys = [`view:${ip}`];
  if (await isLimited(keys, LIMIT)) return done();
  await recordFailure(keys, LIMIT);

  const source = viewSource(
    typeof body.src === "string" ? body.src.slice(0, 40) : "",
    typeof body.ref === "string" ? body.ref.slice(0, 300) : "",
    new URL(site.url).hostname,
  );
  await recordView({ entryId: entry.id, ip, userAgent, lang, source });
  return done();
}
