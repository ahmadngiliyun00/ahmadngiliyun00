import { disconnectSocialAction } from "@/app/(admin)/admin/actions";
import ConfirmButton from "@/components/admin/ConfirmButton";
import Icon from "@/components/admin/Icon";
import { LinkedinImport, SocialSync } from "@/components/admin/SocialActions";
import FlashToast from "@/components/FlashToast";
import { adminCopy } from "@/data/admin";
import { appConfig, AUTO_PLATFORMS, isAutoPlatform, type AutoPlatform } from "@/server/social/config";
import { connectionStatuses, type ConnectionStatus } from "@/server/social/store";

const t = adminCopy.settings.social;
const SOON_MS = 7 * 24 * 60 * 60 * 1000;

function when(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(iso));
}

function day(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeZone: "Asia/Jakarta" }).format(new Date(iso));
}

const fill = (text: string, values: Record<string, string | number>) =>
  Object.entries(values).reduce((out, [k, v]) => out.split(`{${k}}`).join(String(v)), text);

// Toast setelah kembali dari layar izin atau setelah memutus koneksi (?social=...).
function Flash({ social, platform, message }: { social?: string; platform?: string; message?: string }) {
  if (social === undefined) return null;
  if (!isAutoPlatform(platform)) return null;
  const known = t.flash[social as keyof typeof t.flash];
  if (known === undefined) return null;
  const name = t.platforms[platform].name;
  const text = social === "failed" ? `${fill(known, { name })} ${message ?? ""}`.trim() : fill(known, { name });
  const ok = social === "connected" ? true : social === "disconnected";
  return <FlashToast message={text} kind={ok ? "success" : "error"} clear={["social", "platform", "message"]} />;
}

function TokenNote({ platform, status }: { platform: AutoPlatform; status: ConnectionStatus }) {
  if (status.expiresAt === null) return null;
  const left = Date.parse(status.expiresAt) - Date.now();
  if (left <= 0) return <p className="admin-help admin-warn">{t.expired}</p>;
  if (platform === "instagram") {
    return (
      <p className="admin-help">
        {fill(t.expires, { date: day(status.expiresAt) })} {t.autoRefresh}
      </p>
    );
  }
  return <p className="admin-help">{fill(left < SOON_MS ? t.expiresSoon : t.expires, { date: day(status.expiresAt) })}</p>;
}

function LastSync({ status }: { status: ConnectionStatus }) {
  const s = status.lastSync;
  if (s === undefined) return null;
  if (s.error) return <p className="admin-help">{fill(t.lastSyncError, { date: when(s.at), error: s.error })}</p>;
  return (
    <p className="admin-help">
      {fill(t.lastSync, { date: when(s.at), added: s.added, images: s.images })}
      {s.skipped > 0 ? ` ${fill(t.lastSyncSkipped, { n: s.skipped })}` : ""}
    </p>
  );
}

function PlatformCard({ platform, status }: { platform: AutoPlatform; status: ConnectionStatus | undefined }) {
  const p = t.platforms[platform];
  const enabled = appConfig(platform).enabled;
  const prefix = platform === "instagram" ? "INSTAGRAM" : "FACEBOOK";
  return (
    <section className="admin-card social-card" aria-labelledby={`social-${platform}`}>
      <h3 id={`social-${platform}`} className="font-display text-base font-bold">
        {p.name}
      </h3>
      {status === undefined ? (
        <p className="mt-1 text-sm text-muted">{t.notConnected}</p>
      ) : (
        <p className="mt-1 text-sm">
          <strong>{fill(t.connectedAs, { name: status.name })}</strong>{" "}
          <span className="text-muted">{fill(t.since, { date: day(status.connectedAt) })}</span>
        </p>
      )}
      <p className="admin-help">{p.need}</p>
      {status ? <TokenNote platform={platform} status={status} /> : null}
      {status ? <LastSync status={status} /> : null}
      {enabled ? (
        <div className="social-actions mt-4">
          {status ? <SocialSync platform={platform} label={t.sync} pending={t.syncing} /> : null}
          <a href={`/admin/auth/${platform}/`} className={status ? "btn btn-line btn-small" : "btn btn-solid btn-small"}>
            <Icon name="link" />
            {status ? t.reconnect : t.connect}
          </a>
          {status ? (
            <form action={disconnectSocialAction}>
              <input type="hidden" name="platform" value={platform} />
              <ConfirmButton
                label={t.disconnect}
                confirm={fill(t.disconnectConfirm, { name: p.name })}
                className="btn btn-line btn-small"
              />
            </form>
          ) : null}
        </div>
      ) : (
        <p className="admin-help mt-3">{fill(t.off, { prefix })}</p>
      )}
    </section>
  );
}

// Panel di atas formulir Pengaturan, Media sosial. Tidak pernah mengirim token ke browser.
export default async function SocialConnections({ flash }: { flash: { social?: string; platform?: string; message?: string } }) {
  const statuses = await connectionStatuses();
  const cron = (process.env.SOCIAL_CRON_SECRET ?? "").trim().length >= 32;
  return (
    <section className="mt-6" aria-labelledby="social-title">
      <Flash {...flash} />
      <h2 id="social-title" className="font-display text-lg font-bold">
        {t.title}
      </h2>
      <p className="mt-1 text-sm text-muted">{t.intro}</p>
      <div className="social-grid mt-4">
        {AUTO_PLATFORMS.map((platform) => (
          <PlatformCard key={platform} platform={platform} status={statuses[platform]} />
        ))}
        <section className="admin-card social-card" aria-labelledby="social-linkedin">
          <h3 id="social-linkedin" className="font-display text-base font-bold">
            {t.linkedin.title}
          </h3>
          <p className="admin-help">{t.linkedin.intro}</p>
          <LinkedinImport labels={t.linkedin} />
        </section>
      </div>
      <p className="mt-4 text-sm text-muted">
        {cron ? t.cron : t.cronOff}{" "}
        <a href="/admin/social/" className="link">
          {t.manage}
        </a>
      </p>
    </section>
  );
}
