import "server-only";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { sameToken } from "@/server/auth/github";
import { requireAdmin, secureCookies } from "@/server/auth/session";
import { appConfig, STATE_COOKIE, type AutoPlatform } from "@/server/social/config";
import { facebookAuthorizeUrl, facebookConnect, instagramAuthorizeUrl, instagramConnect } from "@/server/social/meta";
import { saveConnection } from "@/server/social/store";

// Alur OAuth untuk menghubungkan akun media sosial. Hanya admin yang sedang masuk yang boleh
// memulai dan menyelesaikannya; state acak di cookie mencegah callback palsu (CSRF).

const BACK = "/admin/settings/social/";

function back(params: Record<string, string>): never {
  redirect(`${BACK}?${new URLSearchParams(params).toString()}`);
}

export async function startOAuth(platform: AutoPlatform): Promise<never> {
  await requireAdmin();
  if (!appConfig(platform).enabled) back({ social: "off", platform });
  const state = randomBytes(24).toString("base64url");
  const jar = await cookies();
  jar.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: secureCookies(),
    sameSite: "lax",
    path: `/admin/auth/${platform}/`,
    maxAge: 600,
  });
  redirect(platform === "instagram" ? instagramAuthorizeUrl(state) : facebookAuthorizeUrl(state));
}

export async function finishOAuth(platform: AutoPlatform, req: NextRequest): Promise<never> {
  await requireAdmin();
  if (!appConfig(platform).enabled) back({ social: "off", platform });
  const params = req.nextUrl.searchParams;
  const jar = await cookies();
  const expected = jar.get(STATE_COOKIE)?.value ?? "";
  jar.delete({ name: STATE_COOKIE, path: `/admin/auth/${platform}/` });
  // Pengguna menekan Batal di layar izin.
  if (params.get("error") !== null) back({ social: "denied", platform });
  const code = params.get("code") ?? "";
  const state = params.get("state") ?? "";
  if (code === "" || state === "" || expected === "" || !sameToken(state, expected)) back({ social: "state", platform });

  let message = "";
  try {
    const grant = platform === "instagram" ? await instagramConnect(code) : await facebookConnect(code);
    if (grant.accountId === "") throw new Error("ID akun tidak diterima.");
    await saveConnection(platform, grant);
  } catch (err) {
    message = err instanceof Error ? err.message : "Gagal menghubungkan akun.";
  }
  if (message !== "") back({ social: "failed", platform, message: message.slice(0, 300) });
  back({ social: "connected", platform });
}
