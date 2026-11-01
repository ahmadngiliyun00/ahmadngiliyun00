import "server-only";
import { createHmac } from "node:crypto";
import { appConfig, graphVersion, type AutoPlatform } from "@/server/social/config";

// Klien kecil Graph API Meta untuk Instagram (Instagram Login) dan Facebook (profil pribadi).
// Hanya membaca postingan milik akun yang menghubungkan; tidak pernah memposting apa pun.

const TIMEOUT_MS = 20000;
const IG_GRAPH = "https://graph.instagram.com";
const FB_GRAPH = "https://graph.facebook.com";

// Kesalahan dari Meta. code 190 berarti token tidak sah atau kedaluwarsa.
export class MetaError extends Error {
  constructor(
    message: string,
    readonly code: number | null,
  ) {
    super(message);
  }
  get expired(): boolean {
    return this.code === 190;
  }
}

type GraphError = { error?: { message?: string; code?: number } | string; error_message?: string; error_type?: string };

// Token beserta akun pemiliknya, hasil menghubungkan akun.
export type AccountGrant = { token: string; expiresAt: string | null; accountId: string; name: string };

async function call<T>(url: string | URL, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS), cache: "no-store" });
  } catch {
    throw new MetaError("Server Meta tidak bisa dihubungi. Coba lagi beberapa saat lagi.", null);
  }
  const body = (await res.json().catch(() => ({}))) as GraphError;
  if (!res.ok) {
    const err = body.error;
    const message = typeof err === "object" ? err?.message : (body.error_message ?? err);
    const code = typeof err === "object" ? (err?.code ?? null) : null;
    throw new MetaError(message ? `Meta menolak permintaan: ${message}` : `Meta menolak permintaan (HTTP ${res.status}).`, code);
  }
  return body as T;
}

// Item postingan yang sudah diseragamkan dari kedua platform.
export type RemotePost = {
  sourceId: string;
  url: string;
  text: string;
  timestamp: string;
  imageUrl?: string;
  isPublic: boolean;
};

export type Page = { items: RemotePost[]; next: string | null };

export type TokenGrant = { token: string; expiresAt: string | null };

function expiry(seconds: unknown): string | null {
  const n = Number(seconds);
  return Number.isFinite(n) ? (n > 0 ? new Date(Date.now() + n * 1000).toISOString() : null) : null;
}

// Tautan halaman berikutnya hanya diikuti bila tetap di host Graph API yang sama.
function sameHost(next: unknown, base: string): string | null {
  if (typeof next !== "string") return null;
  return next.startsWith(`${base}/`) ? next : null;
}

// ---------- Instagram ----------

export function instagramAuthorizeUrl(state: string): string {
  const cfg = appConfig("instagram");
  const url = new URL("https://www.instagram.com/oauth/authorize");
  url.searchParams.set("client_id", cfg.appId);
  url.searchParams.set("redirect_uri", cfg.callback);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "instagram_business_basic");
  url.searchParams.set("state", state);
  return url.toString();
}

// Kode dari Instagram ditukar dengan token singkat (1 jam), lalu dengan token panjang (60 hari).
export async function instagramConnect(code: string): Promise<AccountGrant> {
  const cfg = appConfig("instagram");
  const form = new URLSearchParams({
    client_id: cfg.appId,
    client_secret: cfg.appSecret,
    grant_type: "authorization_code",
    redirect_uri: cfg.callback,
    code: code.replace(/#_$/, ""),
  });
  type Short = { access_token?: string; data?: { access_token?: string }[] };
  const short = await call<Short>("https://api.instagram.com/oauth/access_token", { method: "POST", body: form });
  const shortToken = short.access_token ?? short.data?.[0]?.access_token;
  if (!shortToken) throw new MetaError("Instagram tidak mengirim token.", null);

  const long = new URL(`${IG_GRAPH}/access_token`);
  long.searchParams.set("grant_type", "ig_exchange_token");
  long.searchParams.set("client_secret", cfg.appSecret);
  long.searchParams.set("access_token", shortToken);
  const grant = await call<{ access_token?: string; expires_in?: number }>(long);
  if (!grant.access_token) throw new MetaError("Instagram tidak mengirim token jangka panjang.", null);

  const me = await instagramProfile(grant.access_token);
  return { token: grant.access_token, expiresAt: expiry(grant.expires_in), ...me };
}

async function instagramProfile(token: string): Promise<{ accountId: string; name: string }> {
  const url = new URL(`${IG_GRAPH}/${graphVersion()}/me`);
  url.searchParams.set("fields", "user_id,username");
  url.searchParams.set("access_token", token);
  const me = await call<{ user_id?: string; id?: string; username?: string }>(url);
  return { accountId: String(me.user_id ?? me.id ?? ""), name: me.username ? `@${me.username}` : "Instagram" };
}

// Token panjang Instagram bisa diperpanjang 60 hari lagi, asal umurnya sudah lebih dari 24 jam
// dan belum kedaluwarsa.
export async function instagramRefresh(token: string): Promise<TokenGrant> {
  const url = new URL(`${IG_GRAPH}/refresh_access_token`);
  url.searchParams.set("grant_type", "ig_refresh_token");
  url.searchParams.set("access_token", token);
  const grant = await call<{ access_token?: string; expires_in?: number }>(url);
  if (!grant.access_token) throw new MetaError("Instagram tidak mengirim token baru.", null);
  return { token: grant.access_token, expiresAt: expiry(grant.expires_in) };
}

type IgMedia = {
  id: string;
  caption?: string;
  media_type?: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
  timestamp?: string;
};

export async function instagramPage(token: string, next: string | null): Promise<Page> {
  let url: string | URL;
  if (next !== null) url = next;
  else {
    url = new URL(`${IG_GRAPH}/${graphVersion()}/me/media`);
    url.searchParams.set("fields", "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp");
    url.searchParams.set("limit", "50");
    url.searchParams.set("access_token", token);
  }
  const body = await call<{ data?: IgMedia[]; paging?: { next?: string } }>(url);
  const items = (body.data ?? [])
    .filter((m) => typeof m.permalink === "string")
    .map((m) => ({
      sourceId: m.id,
      url: m.permalink as string,
      text: m.caption ?? "",
      timestamp: m.timestamp ?? "",
      // Video dan Reels memakai gambar sampulnya.
      imageUrl: m.media_type === "VIDEO" ? m.thumbnail_url : m.media_url,
      isPublic: true,
    }));
  return { items, next: sameHost(body.paging?.next, IG_GRAPH) };
}

// ---------- Facebook ----------

// appsecret_proof mengikat setiap panggilan ke rahasia aplikasi, jadi token yang bocor saja
// tidak bisa dipakai dari tempat lain.
function proof(token: string): string {
  return createHmac("sha256", appConfig("facebook").appSecret).update(token).digest("hex");
}

export function facebookAuthorizeUrl(state: string): string {
  const cfg = appConfig("facebook");
  const url = new URL(`https://www.facebook.com/${graphVersion()}/dialog/oauth`);
  url.searchParams.set("client_id", cfg.appId);
  url.searchParams.set("redirect_uri", cfg.callback);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "user_posts");
  url.searchParams.set("state", state);
  return url.toString();
}

// Token Facebook untuk profil pribadi berlaku sekitar 60 hari dan tidak bisa diperpanjang
// tanpa login ulang. CMS mengingatkan saat masa berlakunya hampir habis.
export async function facebookConnect(code: string): Promise<AccountGrant> {
  const cfg = appConfig("facebook");
  const v = graphVersion();
  const short = new URL(`${FB_GRAPH}/${v}/oauth/access_token`);
  short.searchParams.set("client_id", cfg.appId);
  short.searchParams.set("client_secret", cfg.appSecret);
  short.searchParams.set("redirect_uri", cfg.callback);
  short.searchParams.set("code", code);
  const first = await call<{ access_token?: string }>(short);
  if (!first.access_token) throw new MetaError("Facebook tidak mengirim token.", null);

  const long = new URL(`${FB_GRAPH}/${v}/oauth/access_token`);
  long.searchParams.set("grant_type", "fb_exchange_token");
  long.searchParams.set("client_id", cfg.appId);
  long.searchParams.set("client_secret", cfg.appSecret);
  long.searchParams.set("fb_exchange_token", first.access_token);
  const grant = await call<{ access_token?: string; expires_in?: number }>(long);
  const token = grant.access_token ?? first.access_token;

  const me = new URL(`${FB_GRAPH}/${v}/me`);
  me.searchParams.set("fields", "id,name");
  me.searchParams.set("access_token", token);
  me.searchParams.set("appsecret_proof", proof(token));
  const profile = await call<{ id?: string; name?: string }>(me);

  // Pastikan izin user_posts benar-benar diberikan, bukan dilewati di layar izin.
  const perms = new URL(`${FB_GRAPH}/${v}/me/permissions`);
  perms.searchParams.set("access_token", token);
  perms.searchParams.set("appsecret_proof", proof(token));
  const granted = await call<{ data?: { permission?: string; status?: string }[] }>(perms);
  const ok = (granted.data ?? []).some((p) => (p.permission === "user_posts" ? p.status === "granted" : false));
  if (!ok) throw new MetaError("Izin membaca postingan (user_posts) tidak diberikan. Hubungkan ulang dan izinkan akses postingan.", null);

  return { token, expiresAt: expiry(grant.expires_in), accountId: String(profile.id ?? ""), name: profile.name ?? "Facebook" };
}

type FbPost = {
  id: string;
  message?: string;
  created_time?: string;
  permalink_url?: string;
  full_picture?: string;
  privacy?: { value?: string };
};

export async function facebookPage(token: string, next: string | null): Promise<Page> {
  let url: URL;
  if (next !== null) url = new URL(next);
  else {
    url = new URL(`${FB_GRAPH}/${graphVersion()}/me/posts`);
    url.searchParams.set("fields", "id,message,created_time,permalink_url,full_picture,privacy");
    url.searchParams.set("limit", "50");
  }
  url.searchParams.set("access_token", token);
  url.searchParams.set("appsecret_proof", proof(token));
  const body = await call<{ data?: FbPost[]; paging?: { next?: string } }>(url);
  const items = (body.data ?? [])
    // Postingan tanpa teks dan tanpa gambar (misalnya ganti foto sampul tanpa keterangan) dilewati.
    .filter((p) => typeof p.permalink_url === "string")
    .filter((p) => (p.message ?? "").trim() !== "" || typeof p.full_picture === "string")
    .map((p) => ({
      sourceId: p.id,
      url: p.permalink_url as string,
      text: p.message ?? "",
      timestamp: p.created_time ?? "",
      imageUrl: p.full_picture,
      // Bila Meta tidak mengirim info audiens, anggap publik; hasilnya tetap masuk sebagai data privat.
      isPublic: p.privacy?.value === undefined ? true : p.privacy.value === "EVERYONE",
    }));
  return { items, next: sameHost(body.paging?.next, FB_GRAPH) };
}

export async function fetchPage(platform: AutoPlatform, token: string, next: string | null): Promise<Page> {
  return platform === "instagram" ? instagramPage(token, next) : facebookPage(token, next);
}
