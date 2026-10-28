import PortfolioPage from "@/components/PortfolioPage";

// Konten dibaca dari database (dengan cache memori), jadi halaman dirender saat diminta.
export const dynamic = "force-dynamic";

export default function EnglishHomePage() {
  return <PortfolioPage lang="en" />;
}
