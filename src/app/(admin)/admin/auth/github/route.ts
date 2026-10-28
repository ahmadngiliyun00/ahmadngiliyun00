import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { githubConfig, STATE_COOKIE } from "@/server/auth/github";
import { secureCookies } from "@/server/auth/session";

// Memulai login GitHub: simpan state acak di cookie, lalu arahkan ke halaman izin GitHub.
export async function GET() {
  const cfg = githubConfig();
  if (!cfg.enabled) redirect("/admin/login/?error=github-off");
  const state = randomBytes(24).toString("base64url");
  const jar = await cookies();
  jar.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: secureCookies(),
    sameSite: "lax",
    path: "/admin/auth/github/",
    maxAge: 600,
  });
  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", cfg.clientId);
  url.searchParams.set("redirect_uri", cfg.callback);
  url.searchParams.set("scope", "read:user");
  url.searchParams.set("state", state);
  url.searchParams.set("allow_signup", "false");
  redirect(url.toString());
}
