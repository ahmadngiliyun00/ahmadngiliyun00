import Script from "next/script";
import { getSession } from "@/server/auth/session";
import { loadSite } from "@/server/content";

// Google Analytics 4, aktif bila ID pengukuran diisi di CMS. Hanya dipasang di halaman publik
// (beranda, arsip, detail), tidak di CMS dan tidak di tautan berbagi rahasia, supaya token
// berbagi tidak pernah terkirim ke Google. Kunjungan admin yang sedang masuk tidak dihitung.
export default async function Analytics() {
  const id = (await loadSite()).seo.gaMeasurementId;
  if (!id) return null;
  if ((await getSession()) !== null) return null;
  const init = [
    "window.dataLayer=window.dataLayer||[];",
    "function gtag(){dataLayer.push(arguments);}",
    "gtag('js',new Date());",
    `gtag('config',${JSON.stringify(id)});`,
  ].join("");
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {init}
      </Script>
    </>
  );
}
