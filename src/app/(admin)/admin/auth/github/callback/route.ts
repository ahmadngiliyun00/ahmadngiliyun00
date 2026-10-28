import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { db } from "@/db";
import { admins } from "@/db/schema";
import { exchangeCode, fetchGithubUser, githubConfig, sameToken, STATE_COOKIE } from "@/server/auth/github";
import { createSession } from "@/server/auth/session";

// Kembali dari GitHub: cocokkan state, tukar kode dengan token, pastikan akunnya diizinkan.
export async function GET(req: NextRequest) {
  const cfg = githubConfig();
  if (!cfg.enabled) redirect("/admin/login/?error=github-off");

  const code = req.nextUrl.searchParams.get("code") ?? "";
  const state = req.nextUrl.searchParams.get("state") ?? "";
  const jar = await cookies();
  const expected = jar.get(STATE_COOKIE)?.value ?? "";
  jar.delete({ name: STATE_COOKIE, path: "/admin/auth/github/" });
  if (code === "" || state === "" || expected === "" || !sameToken(state, expected)) {
    redirect("/admin/login/?error=github-state");
  }

  let login = "";
  let name = "";
  try {
    const user = await fetchGithubUser(await exchangeCode(code));
    login = user.login.toLowerCase();
    name = user.name ?? user.login;
  } catch {
    redirect("/admin/login/?error=github-failed");
  }
  if (login !== cfg.allowed) redirect("/admin/login/?error=github-denied");

  // Akun admin untuk login GitHub dibuat otomatis pada login pertama akun yang diizinkan.
  let rows = await db.select().from(admins).where(eq(admins.githubLogin, login)).limit(1);
  if (rows.length === 0) {
    await db.insert(admins).values({
      name,
      email: `${login}@users.noreply.github.com`,
      githubLogin: login,
      passwordHash: null,
      active: true,
      createdAt: new Date(),
    });
    rows = await db.select().from(admins).where(eq(admins.githubLogin, login)).limit(1);
  }
  const admin = rows[0];
  if (!admin?.active) redirect("/admin/login/?error=github-denied");
  await createSession(admin.id, "github");
  redirect("/admin/");
}
