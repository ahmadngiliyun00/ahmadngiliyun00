import "server-only";

// Verifikasi Cloudflare Turnstile (pengganti CAPTCHA). Opsional: bila TURNSTILE_SECRET_KEY
// kosong, pemeriksaan dilewati dan form tetap dilindungi honeypot, jebakan waktu, dan batas per IP.

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export function turnstileEnabled(): boolean {
  return (process.env.TURNSTILE_SECRET_KEY ?? "") !== "";
}

export async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY ?? "";
  if (secret === "") return true;
  if (token === "") return false;
  const body = new URLSearchParams({ secret, response: token });
  if (ip !== "unknown") body.set("remoteip", ip);
  try {
    const res = await fetch(VERIFY_URL, { method: "POST", body, signal: AbortSignal.timeout(8000) });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
