import "server-only";
import { timingSafeEqual } from "node:crypto";

// Login GitHub (OAuth App). Hanya akun di GITHUB_ALLOWED_LOGIN yang boleh masuk.

export const STATE_COOKIE = "ngp_oauth_state";

export function githubConfig() {
  const clientId = process.env.GITHUB_CLIENT_ID ?? "";
  const clientSecret = process.env.GITHUB_CLIENT_SECRET ?? "";
  const allowed = (process.env.GITHUB_ALLOWED_LOGIN ?? "").trim().toLowerCase();
  const site = (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
  const enabled = clientId !== "" ? clientSecret !== "" ? allowed !== "" : false : false;
  return { enabled, clientId, clientSecret, allowed, callback: `${site}/admin/auth/github/callback/` };
}

export function sameToken(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length ? timingSafeEqual(x, y) : false;
}

export async function exchangeCode(code: string): Promise<string> {
  const cfg = githubConfig();
  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: cfg.clientId, client_secret: cfg.clientSecret, code, redirect_uri: cfg.callback }),
    signal: AbortSignal.timeout(15000),
  });
  const body = (await res.json()) as { access_token?: string; error?: string };
  if (!body.access_token) throw new Error(body.error ?? "token tidak diterima");
  return body.access_token;
}

export async function fetchGithubUser(token: string): Promise<{ login: string; name: string | null; id: number }> {
  const res = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "User-Agent": "ngiliyun-portfolio-cms" },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  return (await res.json()) as { login: string; name: string | null; id: number };
}
