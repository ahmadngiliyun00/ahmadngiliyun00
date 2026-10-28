// Indikator riset dan pembelajaran yang angkanya cepat berubah.
// Setiap angka wajib punya tanggal pengambilan (asOf) dan sumber. Tampilkan selalu bersama tanggalnya.
// Jangan menambahkan indikator yang tidak ada di sumber, dan jangan membulatkan ke atas.
// Berkas ini hanya boleh memuat "import type" karena juga dibaca skrip Node.

export type MetricSource = {
  name: string;
  url: string;
  asOf: string; // tanggal pengambilan, format YYYY-MM-DD
};

export const scholar = {
  source: {
    name: "Google Scholar",
    url: "https://scholar.google.com/citations?user=4N_lc7sAAAAJ",
    asOf: "2026-10-28",
  } satisfies MetricSource,
  citations: 14,
  hIndex: 2,
  i10Index: 0,
};

export const sinta = {
  source: {
    name: "SINTA",
    url: "https://sinta.kemdiktisaintek.go.id/authors/profile/6957752",
    asOf: "2026-10-28",
  } satisfies MetricSource,
  scoreOverall: 32,
  score3Years: 21,
  scholarArticles: 10,
};

export const garuda = {
  source: {
    name: "Garuda",
    url: "https://garuda.kemdiktisaintek.go.id/author/view/6741123",
    asOf: "2026-10-28",
  } satisfies MetricSource,
  documents: 11,
};

export const msLearn = {
  source: {
    name: "Microsoft Learn",
    url: "https://learn.microsoft.com/id-id/users/ahmadngiliyun00/",
    asOf: "2026-10-28",
  } satisfies MetricSource,
  badges: 223,
  trophies: 46,
  level: 13,
  modules: 222,
  paths: 45,
  learningMinutes: 188 * 60 + 31,
};
