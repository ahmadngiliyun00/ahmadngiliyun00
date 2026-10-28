// Data awal (seed) metrik riset dan pembelajaran. Setelah database terisi, ubah lewat CMS.
// Setiap angka wajib punya tanggal pengambilan (asOf) dan sumber. Jangan membulatkan ke atas.
// Berkas ini hanya boleh memuat "import type" karena dibaca skrip Node.

import type { MetricsSettings } from "../src/content/types";

export const metrics: MetricsSettings = {
  scholar: {
    source: { name: "Google Scholar", url: "https://scholar.google.com/citations?user=4N_lc7sAAAAJ", asOf: "2026-10-28" },
    citations: 14,
    hIndex: 2,
    i10Index: 0,
  },
  sinta: {
    source: { name: "SINTA", url: "https://sinta.kemdiktisaintek.go.id/authors/profile/6957752", asOf: "2026-10-28" },
    scoreOverall: 32,
    score3Years: 21,
    scholarArticles: 10,
  },
  garuda: {
    source: { name: "Garuda", url: "https://garuda.kemdiktisaintek.go.id/author/view/6741123", asOf: "2026-10-28" },
    documents: 11,
  },
  msLearn: {
    source: { name: "Microsoft Learn", url: "https://learn.microsoft.com/id-id/users/ahmadngiliyun00/", asOf: "2026-10-28" },
    badges: 223,
    trophies: 46,
    level: 13,
    modules: 222,
    paths: 45,
    learningMinutes: 188 * 60 + 31,
  },
};
