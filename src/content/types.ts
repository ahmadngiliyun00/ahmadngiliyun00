// Tipe semua konten yang dikelola lewat CMS.
// Berkas ini hanya berisi tipe dan label (tanpa impor nilai), karena juga dibaca skrip Node.

export type Lang = "id" | "en";
export type Localized<T> = Record<Lang, T>;
export type Visibility = "public" | "private";

export type PartialDate = { year: number; month?: number; day?: number };

// ---------- Capaian ----------

export type AchievementKind =
  | "sertifikat"
  | "pelatihan"
  | "beasiswa"
  | "hki"
  | "buku"
  | "hibah"
  | "publikasi"
  | "reviewer"
  | "keanggotaan"
  | "penghargaan";

// Posisi nama Mas Ilyun di daftar penulis.
export type Authorship = "sole" | "first" | "second" | "co";

export type RelatedLink = { label: Localized<string>; href: string };

export type Achievement = {
  kind: AchievementKind;
  title: Localized<string>; // title.id dipakai sebagai nama resmi di LinkedIn
  issuer: string;
  summary?: Localized<string>;
  issued: PartialDate | null;
  expires?: PartialDate;
  ongoing?: boolean;
  credentialId?: string;
  reference?: string;
  verifyUrl?: string;
  fileId?: string; // berkas unggahan di tabel files
  skills?: string[];
  authorship?: Authorship;
  related?: RelatedLink[];
  featured: boolean;
  showOnHome?: boolean;
  linkedin?: boolean;
};

// ---------- Proyek ----------

export type ProjectVisual = "cluster" | "sentiment" | "vision";

export type FeaturedProject = {
  name: string;
  repo: string;
  demo?: string;
  stack: string;
  visual: ProjectVisual;
  copyright: boolean;
  badge?: Localized<string>;
  tags: Localized<string[]>;
  summary: Localized<string>;
};

export type SystemProject = {
  name: string;
  full?: string;
  period: Localized<string>;
  role: Localized<string>;
  stack: string[];
  summary: Localized<string>;
  repo?: string; // hanya untuk repositori publik
};

// ---------- Mengajar ----------

export type Program = "inf" | "rmik" | "si" | "ti";

export type Term = { code: string; label: Localized<string>; current: boolean };

export type Institution = {
  name: string;
  role: Localized<string>;
  note: Localized<string>;
};

export type Course = {
  institution: string; // slug institusi
  name: Localized<string>;
  programs: Program[];
  terms: string[]; // kode semester
  repo?: string;
};

export type TeachingFocus = { title: Localized<string>; courses: Localized<string> };

// ---------- Profil dan bagian lain ----------

export type Area = {
  icon: "teach" | "ai" | "web" | "server";
  title: Localized<string>;
  body: Localized<string>;
  tools: string[];
};

export type Milestone = {
  when: Localized<string>;
  title: Localized<string>;
  body: Localized<string>;
  current?: boolean;
};

export type Contribution = {
  title: Localized<string>;
  body: Localized<string>;
  href?: string; // diawali "#" untuk tautan internal
  linkLabel?: Localized<string>;
};

export type Collab = { title: Localized<string>; body: Localized<string> };

export type Channel = { label: string; handle: string; href: string; note: Localized<string> };

export type ProfileLink = { label: string; href: string };

export type ProfileSettings = {
  status: Localized<string>;
  heroStatement: Localized<string>;
  heroLead: Localized<string>;
  aboutStatement: Localized<string>;
  facts: Localized<{ label: string; value: string }[]>;
  email: { user: string; domain: string };
  skills: string[];
  topics: Localized<string[]>;
  researchThemes: Localized<string[]>;
  researchProfiles: ProfileLink[];
  credentialProfiles: ProfileLink[];
  sameAs: string[]; // profil untuk JSON-LD Person
};

export type MetricSource = { name: string; url: string; asOf: string };

export type MetricsSettings = {
  scholar: { source: MetricSource; citations: number; hIndex: number; i10Index: number };
  sinta: { source: MetricSource; scoreOverall: number; score3Years: number; scholarArticles: number };
  garuda: { source: MetricSource; documents: number };
  msLearn: {
    source: MetricSource;
    badges: number;
    trophies: number;
    level: number;
    modules: number;
    paths: number;
    learningMinutes: number;
  };
};

// Verifikasi kepemilikan situs dan analitik. Semua opsional; kosong berarti tidak dipasang.
export type SeoSettings = {
  googleVerification?: string; // isi content dari meta google-site-verification
  googleHtmlFile?: string; // nama berkas verifikasi HTML, misalnya google1a2b3c4d5e6f7a8b.html
  bingVerification?: string; // isi content dari meta msvalidate.01
  gaMeasurementId?: string; // ID pengukuran Google Analytics 4, misalnya G-ABC123XYZ9
};

// Peta koleksi ke tipe datanya.
export type CollectionData = {
  achievement: Achievement;
  project: FeaturedProject;
  system: SystemProject;
  institution: Institution;
  course: Course;
  term: Term;
  focus: TeachingFocus;
  milestone: Milestone;
  area: Area;
  contribution: Contribution;
  collab: Collab;
  channel: Channel;
};

export type CollectionKey = keyof CollectionData;

// Satu baris konten seperti yang dipakai situs dan CMS.
export type Entry<K extends CollectionKey = CollectionKey> = {
  id: number;
  collection: K;
  slug: string;
  visibility: Visibility;
  position: number;
  data: CollectionData[K];
  shared: boolean;
  updatedAt: string;
};

// ---------- Label ----------

export const kindLabels: Record<AchievementKind, Localized<string>> = {
  sertifikat: { id: "Sertifikat", en: "Certificates" },
  pelatihan: { id: "Pelatihan", en: "Training" },
  beasiswa: { id: "Beasiswa", en: "Scholarships" },
  hki: { id: "Hak cipta", en: "Copyrights" },
  buku: { id: "Buku", en: "Books" },
  hibah: { id: "Hibah", en: "Grants" },
  publikasi: { id: "Publikasi", en: "Publications" },
  reviewer: { id: "Reviewer", en: "Reviewing" },
  keanggotaan: { id: "Keanggotaan", en: "Memberships" },
  penghargaan: { id: "Penghargaan", en: "Awards" },
};

export const kindSingular: Record<AchievementKind, Localized<string>> = {
  sertifikat: { id: "Sertifikat", en: "Certificate" },
  pelatihan: { id: "Pelatihan", en: "Training" },
  beasiswa: { id: "Beasiswa", en: "Scholarship" },
  hki: { id: "Hak cipta", en: "Copyright" },
  buku: { id: "Buku", en: "Book" },
  hibah: { id: "Hibah penelitian", en: "Research grant" },
  publikasi: { id: "Publikasi", en: "Publication" },
  reviewer: { id: "Reviewer", en: "Reviewer" },
  keanggotaan: { id: "Keanggotaan", en: "Membership" },
  penghargaan: { id: "Penghargaan", en: "Award" },
};

export const authorshipLabels: Record<Authorship, Localized<string>> = {
  sole: { id: "Penulis tunggal", en: "Sole author" },
  first: { id: "Penulis pertama", en: "First author" },
  second: { id: "Penulis kedua", en: "Second author" },
  co: { id: "Penulis pendamping", en: "Co-author" },
};

export const programLabels: Record<Program, Localized<string>> = {
  inf: { id: "Informatika", en: "Informatics" },
  rmik: { id: "RMIK", en: "Health Information Management" },
  si: { id: "Sistem Informasi", en: "Information Systems" },
  ti: { id: "Teknik Informatika", en: "Informatics Engineering" },
};
