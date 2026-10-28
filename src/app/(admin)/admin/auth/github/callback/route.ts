import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { db } from "@/db";
import { admins } from "@/db/schema";
import { exchangeCode, fetchGithubUser, githubConfig, sameToken, STATE_COOKIE } from "@/server/auth/github";
import { createSession } from "@/server/auth/session";

// Kembali dari GitHub: cocokkan state, tukar kode dengan token, pastikan akunnya diizinkan.
// Nama pengguna dicocokkan dengan GITHUB_ALLOWED_LOGIN, lalu ID numerik GitHub dikunci pada
// login pertama. Bila akun pemilik berganti nama dan orang lain mendaftar nama lamanya,
// ID-nya berbeda sehingga tetap ditolak.
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
  let githubId = 0;
  try {
    const user = await fetchGithubUser(await exchangeCode(code));
    login = user.login.toLowerCase();
    name = user.name ?? user.login;
    githubId = user.id;
    if (!Number.isSafeInteger(githubId) || githubId <= 0) throw new Error("ID GitHub tidak valid");
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
      githubId,
      passwordHash: null,
      active: true,
      createdAt: new Date(),
    });
    rows = await db.select().from(admins).where(eq(admins.githubLogin, login)).limit(1);
  }
  const admin = rows[0];
  if (!admin?.active) redirect("/admin/login/?error=github-denied");
  if (admin.githubId === null) {
    // Akun lama sebelum kolom github_id ada: kunci ID pada login pertama ini.
    await db.update(admins).set({ githubId }).where(eq(admins.id, admin.id));
  } else if (admin.githubId !== githubId) {
    redirect("/admin/login/?error=github-denied");
  }
  await createSession(admin.id, "github");
  redirect("/admin/");
}
