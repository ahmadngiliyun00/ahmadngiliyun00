// Sumber tunggal untuk sertifikat, pelatihan, hak cipta, buku, publikasi, hibah, reviewer, dan keanggotaan.
// Dipakai oleh beranda, halaman arsip /sertifikat/ dan /en/certificates/, halaman detail, sitemap, dan README.
//
// Aturan:
// - visibility "draft" tidak dirender, tidak masuk sitemap, dan tidak masuk README
// - featured true = tampil di sorotan beranda (maksimal 6, diperiksa validator)
// - showOnHome true = HKI yang tampil di beranda (maksimal 5, diperiksa validator)
// - Jangan mengarang nomor, tanggal, atau ID. Kolom yang belum diketahui dikosongkan
// - Tanpa em dash dan tanpa simbol ampersand. Validator menolak keduanya
// - Berkas ini hanya boleh memuat "import type", karena juga dibaca skrip Node (scripts/lib/load-ts.mjs)
//
// Periksa dengan: npm run check:achievements

import type { Localized } from "./profile";

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

export type PartialDate = { year: number; month?: number; day?: number };

// Posisi nama Mas Ilyun di daftar penulis.
export type Authorship = "sole" | "first" | "second" | "co";

export type RelatedLink = { label: Localized<string>; href: string };

export type Achievement = {
  id: string; // slug unik, dipakai di URL
  kind: AchievementKind;
  title: Localized<string>; // title.id dipakai sebagai nama resmi di LinkedIn
  issuer: string; // penerbit, lembaga, atau terbitan
  summary?: Localized<string>; // satu sampai dua kalimat, wajib kecuali publikasi
  issued: PartialDate | null; // null bila tanggal belum diketahui
  expires?: PartialDate;
  ongoing?: boolean; // peran yang masih berjalan, misalnya reviewer
  credentialId?: string; // ID kredensial atau nomor pencatatan
  reference?: string; // nomor surat atau sertifikat tambahan yang tercetak
  verifyUrl?: string; // URL verifikasi RESMI penerbit
  file?: string; // path relatif dari public/, misalnya "sertifikat/pekerti-batch-30.pdf"
  skills?: string[];
  authorship?: Authorship; // khusus publikasi
  related?: RelatedLink[]; // tautan pendukung, misalnya repositori proyek akhir
  featured: boolean;
  showOnHome?: boolean; // khusus HKI
  visibility: "public" | "draft";
  linkedin?: boolean; // true = tombol Tambahkan ke LinkedIn
};

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

// Label satuan untuk satu item (dipakai di kartu dan halaman detail).
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

// ---------- Pembantu untuk sertifikat Dicoding ----------
// Sertifikat Dicoding berlaku tiga tahun sejak terbit dan punya halaman verifikasi resmi.

const DICODING = "Dicoding Indonesia";

function dicoding(
  id: string,
  title: Localized<string>,
  issued: [number, number, number],
  credentialId: string,
  summary: Localized<string>,
  skills: string[],
  extra: Partial<Achievement> = {},
): Achievement {
  const [year, month, day] = issued;
  return {
    id,
    kind: "sertifikat",
    title,
    issuer: DICODING,
    summary,
    issued: { year, month, day },
    expires: { year: year + 3, month, day },
    credentialId,
    verifyUrl: `https://www.dicoding.com/certificates/${credentialId}`,
    skills,
    featured: false,
    visibility: "public",
    linkedin: true,
    ...extra,
  };
}

const sameTitle = (text: string): Localized<string> => ({ id: text, en: text });

// ---------- Data ----------

export const achievements: Achievement[] = [
  // ----- Program dan pelatihan utama -----
  {
    id: "pijak-ai-engineer",
    kind: "pelatihan",
    title: {
      id: "Pijak in collaboration with IBM SkillsBuild: AI Engineer",
      en: "Pijak in collaboration with IBM SkillsBuild: AI Engineer",
    },
    issuer: "Dicoding Indonesia dan IBM SkillsBuild",
    summary: {
      id: "Lulus Penuh program AI Engineer (Februari sampai Juli 2026): 924 jam belajar, 20 SKS, IPK akhir 89,79 (A). Project Manager tim capstone RupiahVision.",
      en: "Completed the AI Engineer program in full (February to July 2026): 924 study hours, 20 credits, final GPA 89.79 (A). Project Manager of the RupiahVision capstone team.",
    },
    issued: { year: 2026, month: 7, day: 20 },
    skills: ["Machine learning", "Deep learning", "PyTorch", "MLOps", "Manajemen proyek"],
    related: [
      { label: { id: "Proyek capstone RupiahVision", en: "RupiahVision capstone project" }, href: "https://github.com/RupiahVision/RupiahVision" },
    ],
    featured: true,
    visibility: "public",
    linkedin: true,
  },
  {
    id: "aws-ai-academy-2026",
    kind: "sertifikat",
    title: {
      id: "AWS AI Academy 2026, Level Dasar dan Pemula",
      en: "AWS AI Academy 2026, Foundational and Beginner Level",
    },
    issuer: "Dicoding Indonesia dan AWS Training and Certification",
    summary: {
      id: "Program AWS AI Academy 2026 tingkat dasar dan pemula yang diselenggarakan Dicoding bersama AWS Training and Certification.",
      en: "The foundational and beginner level of AWS AI Academy 2026, run by Dicoding with AWS Training and Certification.",
    },
    issued: { year: 2026, month: 8, day: 7 },
    credentialId: "AWS2026/L1-AI-0105",
    skills: ["AWS", "Generative AI", "Spec-driven development"],
    featured: true,
    visibility: "public",
    linkedin: true,
  },
  {
    id: "pekerti-batch-30",
    kind: "pelatihan",
    title: {
      id: "PEKERTI Batch-30: Peningkatan Keterampilan Dasar Teknik Instruksional",
      en: "PEKERTI Batch 30: Basic Instructional Techniques Training",
    },
    issuer: "LP2AI Universitas Pasundan",
    summary: {
      id: "Pendidikan dan latihan PEKERTI untuk dosen, 22 sampai 27 Juli 2026, sebagai peserta. Hasil pendampingnya bahan ajar dan LKM K-Means berbasis notebook interaktif, serta peer teaching.",
      en: "PEKERTI training for lecturers, 22 to 27 July 2026, as a participant. Outputs included teaching material and a K-Means worksheet built as an interactive notebook, plus peer teaching.",
    },
    issued: { year: 2026, month: 7, day: 28 },
    credentialId: "b30pekerti",
    reference: "12446/Unpas.R/LP2AI/PEKERTI/VII/2026",
    skills: ["Desain pembelajaran", "Peer teaching", "Notebook interaktif"],
    featured: true,
    visibility: "public",
    linkedin: true,
  },

  // ----- Sertifikat Dicoding (urut tanggal terbit) -----
  dicoding(
    "dasar-pemrograman-web",
    { id: "Belajar Dasar Pemrograman Web", en: "Web Programming Fundamentals" },
    [2025, 4, 17],
    "1OP82EQJLPQK",
    {
      id: "Dasar pembuatan halaman web dengan HTML dan CSS.",
      en: "Building web pages with HTML and CSS.",
    },
    ["HTML", "CSS"],
  ),
  dicoding(
    "dasar-pemrograman-javascript",
    { id: "Belajar Dasar Pemrograman JavaScript", en: "JavaScript Programming Fundamentals" },
    [2025, 4, 18],
    "JMZVE5MMNPN9",
    {
      id: "Dasar bahasa JavaScript untuk pengembangan aplikasi.",
      en: "JavaScript language fundamentals for application development.",
    },
    ["JavaScript"],
  ),
  dicoding(
    "back-end-pemula-javascript",
    { id: "Belajar Back-End Pemula dengan JavaScript", en: "Back-End Development for Beginners with JavaScript" },
    [2025, 4, 18],
    "4EXGV2Y49XRL",
    {
      id: "Membangun RESTful API sederhana dengan Node.js.",
      en: "Building a simple RESTful API with Node.js.",
    },
    ["Node.js", "REST API"],
  ),
  dicoding(
    "dasar-cloud-gen-ai-aws",
    { id: "Belajar Dasar Cloud dan Gen AI di AWS", en: "Cloud and Generative AI Fundamentals on AWS" },
    [2025, 4, 29],
    "4EXGVRL41XRL",
    {
      id: "Dasar komputasi awan dan generative AI di AWS.",
      en: "Cloud computing and generative AI fundamentals on AWS.",
    },
    ["AWS", "Cloud", "Generative AI"],
  ),
  dicoding(
    "dasar-sql",
    { id: "Belajar Dasar Structured Query Language (SQL)", en: "Structured Query Language (SQL) Fundamentals" },
    [2025, 4, 30],
    "N9ZO918MRXG5",
    {
      id: "Dasar pengelolaan dan kueri basis data relasional dengan SQL.",
      en: "Managing and querying relational databases with SQL.",
    },
    ["SQL", "Basis data"],
  ),
  dicoding(
    "prinsip-pemrograman-solid",
    { id: "Belajar Prinsip Pemrograman SOLID", en: "SOLID Programming Principles" },
    [2025, 5, 4],
    "NVP75D74WXR0",
    {
      id: "Lima prinsip SOLID untuk kode berorientasi objek yang mudah dirawat.",
      en: "The five SOLID principles for maintainable object-oriented code.",
    },
    ["SOLID", "OOP"],
  ),
  dicoding(
    "prompt-engineering-software-developer",
    { id: "Prompt Engineering untuk Software Developer", en: "Prompt Engineering for Software Developers" },
    [2025, 12, 28],
    "98XWO7219ZM3",
    {
      id: "Teknik menyusun prompt untuk membantu pekerjaan pengembangan perangkat lunak.",
      en: "Prompting techniques that support software development work.",
    },
    ["Prompt engineering", "LLM"],
  ),
  // Duplikat dari sertifikat 18 Feb 2026 (MRZMWG9JKPYQ). Keputusan Mas Ilyun: jangan ditayangkan.
  dicoding(
    "machine-learning-pemula-2026-01",
    { id: "Belajar Machine Learning untuk Pemula", en: "Machine Learning for Beginners" },
    [2026, 1, 10],
    "72ZDKNJOVPYW",
    {
      id: "Terbitan pertama yang digantikan oleh terbitan 18 Februari 2026.",
      en: "First issue, superseded by the 18 February 2026 issue.",
    },
    ["Machine learning"],
    { visibility: "draft", linkedin: false },
  ),
  dicoding(
    "data-science-microsoft-fabric",
    { id: "Belajar Penerapan Data Science dengan Microsoft Fabric", en: "Applied Data Science with Microsoft Fabric" },
    [2026, 1, 22],
    "NVP7JRKOVXR0",
    {
      id: "Alur kerja data science dari pengolahan data sampai analisis di Microsoft Fabric.",
      en: "A data science workflow from data preparation to analysis in Microsoft Fabric.",
    },
    ["Microsoft Fabric", "Data science"],
  ),
  dicoding(
    "dasar-git-github",
    { id: "Belajar Dasar Git dengan GitHub", en: "Git Fundamentals with GitHub" },
    [2026, 1, 27],
    "GRX5J75GKX0M",
    {
      id: "Kontrol versi dengan Git dan kolaborasi lewat GitHub.",
      en: "Version control with Git and collaboration on GitHub.",
    },
    ["Git", "GitHub"],
  ),
  dicoding(
    "logika-pemrograman",
    {
      id: "Pengenalan ke Logika Pemrograman (Programming Logic 101)",
      en: "Introduction to Programming Logic (Programming Logic 101)",
    },
    [2026, 1, 28],
    "RVZKGVLDQXD5",
    {
      id: "Dasar berpikir komputasional dan logika pemrograman.",
      en: "Computational thinking and programming logic fundamentals.",
    },
    ["Logika pemrograman"],
  ),
  dicoding(
    "dasar-pemrograman-pengembang-software",
    {
      id: "Memulai Dasar Pemrograman untuk Menjadi Pengembang Software",
      en: "Programming Fundamentals for Aspiring Software Developers",
    },
    [2026, 1, 29],
    "RVZKGVW5OXD5",
    {
      id: "Dasar pemrograman dan peran pengembang perangkat lunak.",
      en: "Programming fundamentals and the role of a software developer.",
    },
    ["Dasar pemrograman"],
  ),
  // Catatan: deskripsi di halaman 2 berkas PDF membahas keamanan siber. Halaman verifikasi resmi
  // (diperiksa 28 Okt 2026) sudah benar: kelas ini tentang aplikasi chat dengan Azure AI Foundry.
  dicoding(
    "gen-ai-microsoft-azure",
    { id: "Membangun Aplikasi Gen AI dengan Microsoft Azure", en: "Building Generative AI Apps with Microsoft Azure" },
    [2026, 1, 30],
    "1OP8JQ7NVPQK",
    {
      id: "Aplikasi chat interaktif dengan language model, memakai Azure AI Foundry, Prompt Flow, dan RAG.",
      en: "An interactive chat app built on a language model with Azure AI Foundry, Prompt Flow, and RAG.",
    },
    ["Microsoft Azure", "Azure AI Foundry", "RAG"],
  ),
  dicoding(
    "dasar-ai",
    { id: "Belajar Dasar AI", en: "AI Fundamentals" },
    [2026, 2, 3],
    "1RXYQK4JQZVM",
    {
      id: "Konsep dasar kecerdasan buatan dan penerapannya.",
      en: "Core concepts of artificial intelligence and how it is applied.",
    },
    ["Kecerdasan buatan"],
  ),
  dicoding(
    "pemrograman-python",
    { id: "Memulai Pemrograman dengan Python", en: "Getting Started with Python Programming" },
    [2026, 2, 16],
    "6RPN7K7E8X2M",
    {
      id: "Dasar bahasa Python, dari tipe data sampai fungsi.",
      en: "Python language fundamentals, from data types to functions.",
    },
    ["Python"],
  ),
  dicoding(
    "fundamental-deep-learning",
    { id: "Belajar Fundamental Deep Learning", en: "Deep Learning Fundamentals" },
    [2026, 2, 17],
    "JMZVOM703XN9",
    {
      id: "Jaringan saraf tiruan dan deep learning, bagian dari jalur AI Engineer Pijak.",
      en: "Neural networks and deep learning, part of the Pijak AI Engineer track.",
    },
    ["Deep learning", "Neural network"],
    { featured: true },
  ),
  dicoding(
    "machine-learning-pemula",
    { id: "Belajar Machine Learning untuk Pemula", en: "Machine Learning for Beginners" },
    [2026, 2, 18],
    "MRZMWG9JKPYQ",
    {
      id: "Dasar machine learning dari data sampai model, bagian dari jalur AI Engineer Pijak.",
      en: "Machine learning foundations from data to model, part of the Pijak AI Engineer track.",
    },
    ["Machine learning", "Python"],
    { featured: true },
  ),
  dicoding(
    "sistem-machine-learning",
    { id: "Membangun Sistem Machine Learning", en: "Building Machine Learning Systems" },
    [2026, 3, 1],
    "L4PQ94O3OPO1",
    {
      id: "Eksperimen, workflow CI, dan penyajian model machine learning. Proyek akhirnya terbuka di GitHub.",
      en: "Experiments, CI workflows, and serving machine learning models. The final project is open on GitHub.",
    },
    ["MLOps", "CI", "Machine learning"],
    {
      featured: true,
      related: [
        { label: { id: "Proyek akhir SMSML", en: "SMSML final project" }, href: "https://github.com/ahmadngiliyun00/SMSML_Ahmad-Ngiliyun" },
        { label: { id: "Workflow CI", en: "CI workflow" }, href: "https://github.com/ahmadngiliyun00/Workflow-CI_Ahmad-Ngiliyun" },
        { label: { id: "Eksperimen", en: "Experiments" }, href: "https://github.com/ahmadngiliyun00/Eksperimen_SML_Ahmad-Ngiliyun" },
      ],
    },
  ),
  dicoding(
    "fundamental-pemrosesan-data",
    { id: "Belajar Fundamental Pemrosesan Data", en: "Data Processing Fundamentals" },
    [2026, 5, 10],
    "GRX5WWGN3Z0M",
    {
      id: "Pengolahan dan pembersihan data sebagai dasar analisis.",
      en: "Processing and cleaning data as a foundation for analysis.",
    },
    ["Pemrosesan data", "Python"],
  ),
  dicoding(
    "spec-driven-development-kiro",
    { id: "Spec-Driven Development dengan Kiro", en: "Spec-Driven Development with Kiro" },
    [2026, 7, 8],
    "N9ZON8D4YXG5",
    {
      id: "Pengembangan berbasis spesifikasi dengan Kiro, bagian dari AWS AI Academy 2026.",
      en: "Specification-driven development with Kiro, part of AWS AI Academy 2026.",
    },
    ["Kiro", "Spec-driven development"],
  ),
  dicoding(
    "dasar-visualisasi-data",
    { id: "Belajar Dasar Visualisasi Data", en: "Data Visualization Fundamentals" },
    [2026, 8, 9],
    "JMZVLQ29OXN9",
    {
      id: "Memilih dan membuat visualisasi data yang tepat untuk analisis.",
      en: "Choosing and building the right data visualizations for analysis.",
    },
    ["Visualisasi data"],
  ),

  // ----- Kredensial daring lain (Credly, Coursera, Microsoft Learn) -----
  {
    id: "google-it-support",
    kind: "sertifikat",
    title: sameTitle("Google IT Support Professional Certificate"),
    issuer: "Google (Coursera)",
    summary: {
      id: "Spesialisasi dukungan TI dari Google: troubleshooting, jaringan, sistem operasi, administrasi sistem, dan keamanan TI.",
      en: "Google's IT support specialization: troubleshooting, networking, operating systems, system administration, and IT security.",
    },
    issued: { year: 2023, month: 6, day: 16 },
    verifyUrl: "https://www.coursera.org/account/accomplishments/specialization/32FCRXDHQJ7A",
    credentialId: "32FCRXDHQJ7A",
    skills: ["IT support", "Jaringan", "Keamanan TI"],
    featured: false,
    visibility: "public",
    linkedin: true,
  },
  {
    id: "prompt-design-vertex-ai",
    kind: "sertifikat",
    title: sameTitle("Prompt Design in Vertex AI Skill Badge"),
    issuer: "Google Cloud",
    summary: {
      id: "Skill badge Google Cloud tentang desain prompt di Vertex AI.",
      en: "A Google Cloud skill badge on prompt design in Vertex AI.",
    },
    issued: { year: 2025, month: 2, day: 2 },
    verifyUrl: "https://www.credly.com/badges/d070f851-843f-48af-9da0-5545f7478967/public_url",
    skills: ["Vertex AI", "Prompt engineering"],
    featured: false,
    visibility: "public",
    linkedin: true,
  },
  {
    id: "gemini-imagen-real-world-ai",
    kind: "sertifikat",
    title: sameTitle("Build Real World AI Applications with Gemini and Imagen Skill Badge"),
    issuer: "Google Cloud",
    summary: {
      id: "Skill badge Google Cloud tentang membangun aplikasi AI dengan Gemini dan Imagen.",
      en: "A Google Cloud skill badge on building AI applications with Gemini and Imagen.",
    },
    issued: { year: 2025, month: 3, day: 22 },
    verifyUrl: "https://www.credly.com/badges/5c66dbad-07c6-46f5-b3ef-621482b4d0db/public_url",
    skills: ["Gemini", "Imagen", "Vertex AI"],
    featured: false,
    visibility: "public",
    linkedin: true,
  },
  {
    id: "ibm-career-management-essentials",
    kind: "sertifikat",
    title: sameTitle("Career Management Essentials"),
    issuer: "IBM SkillsBuild",
    summary: {
      id: "Badge IBM SkillsBuild tentang dasar pengelolaan karier.",
      en: "An IBM SkillsBuild badge on career management essentials.",
    },
    issued: { year: 2025, month: 10, day: 20 },
    verifyUrl: "https://www.credly.com/badges/9fd030b9-d0d9-4be5-9f3b-87de2ac3896b/public_url",
    skills: ["Pengembangan karier"],
    featured: false,
    visibility: "public",
    linkedin: true,
  },
  {
    id: "ms-learn-elevaite-dicoding",
    kind: "pelatihan",
    title: sameTitle("elevAIte with Dicoding Program (1)"),
    issuer: "Microsoft Learn",
    summary: {
      id: "Rencana belajar Microsoft Learn dalam program elevAIte bersama Dicoding.",
      en: "A Microsoft Learn learning plan in the elevAIte program with Dicoding.",
    },
    issued: { year: 2025, month: 2, day: 1 },
    verifyUrl: "https://learn.microsoft.com/api/achievements/share/id-id/ahmadngiliyun00/VDFWPR2M?sharingId=2655CA85F0EF937B",
    skills: ["Microsoft Azure", "AI"],
    featured: false,
    visibility: "public",
    linkedin: false,
  },
  // Judul di halaman Microsoft terpotong ("Azure AI Found"). Keputusan Mas Ilyun: lewati dulu.
  {
    id: "ms-learn-azure-ai-model-selection",
    kind: "pelatihan",
    title: sameTitle("Accelerate gen AI model selection, evaluation, and multimodal integration with Azure AI Found"),
    issuer: "Microsoft Learn",
    summary: {
      id: "Rencana belajar Microsoft Learn tentang pemilihan dan evaluasi model generative AI di Azure.",
      en: "A Microsoft Learn learning plan on selecting and evaluating generative AI models on Azure.",
    },
    issued: { year: 2026, month: 1, day: 29 },
    verifyUrl: "https://learn.microsoft.com/api/achievements/share/id-id/ahmadngiliyun00/NMJCB4ZF?sharingId=2655CA85F0EF937B",
    featured: false,
    visibility: "draft",
  },
  // Tanggal belum diketahui.
  {
    id: "ms-ai-skills-fest",
    kind: "pelatihan",
    title: sameTitle("Microsoft AI Skills Fest, Festival participation"),
    issuer: "Microsoft Learn",
    summary: {
      id: "Partisipasi dalam Microsoft AI Skills Fest.",
      en: "Participation in Microsoft AI Skills Fest.",
    },
    issued: null,
    verifyUrl: "https://learn.microsoft.com/api/achievements/share/id-id/ahmadngiliyun00/7KSE2VJZ?sharingId=2655CA85F0EF937B",
    featured: false,
    visibility: "draft",
  },

  // ----- Sertifikat lain dari folder (draft sampai dipilih Mas Ilyun) -----
  {
    id: "juara-vibe-coding",
    kind: "pelatihan",
    title: sameTitle("#JuaraVibeCoding: Vibe Coding Study Jam"),
    issuer: "Google",
    summary: {
      id: "Sertifikat peserta Vibe Coding Study Jam. Kode verifikasi dapat diperiksa di halaman verifikasi resmi.",
      en: "Participant certificate for the Vibe Coding Study Jam. The code can be checked on the official verifier.",
    },
    issued: { year: 2026 },
    credentialId: "JVC2605-DPB9-75DH",
    verifyUrl: "https://goo.gle/jvc-cert-verifier",
    featured: false,
    visibility: "draft",
    linkedin: true,
  },
  {
    id: "dicoding-developer-conference-2026",
    kind: "pelatihan",
    title: sameTitle("Dicoding Developer Conference 2026"),
    issuer: DICODING,
    summary: {
      id: "Peserta Dicoding Developer Conference 2026.",
      en: "Attendee of Dicoding Developer Conference 2026.",
    },
    issued: { year: 2026, month: 4, day: 25 },
    featured: false,
    visibility: "draft",
  },
  {
    id: "ibm-skillsbuild-ai",
    kind: "pelatihan",
    title: {
      id: "IBM SkillsBuild: AI Ethics, Introduction to Artificial Intelligence, Introduction to Generative AI",
      en: "IBM SkillsBuild: AI Ethics, Introduction to Artificial Intelligence, Introduction to Generative AI",
    },
    issuer: "IBM SkillsBuild",
    summary: {
      id: "Tiga kelas IBM SkillsBuild tentang etika AI, pengantar AI, dan pengantar generative AI.",
      en: "Three IBM SkillsBuild courses on AI ethics, an introduction to AI, and an introduction to generative AI.",
    },
    issued: { year: 2025 },
    featured: false,
    visibility: "draft",
  },
  {
    id: "lam-infokom-instrumen-2",
    kind: "pelatihan",
    title: {
      id: "Sosialisasi dan Pendalaman Instrumen Akreditasi 2.0 LAM INFOKOM",
      en: "LAM INFOKOM Accreditation Instrument 2.0 Briefing",
    },
    issuer: "LAM INFOKOM",
    summary: {
      id: "Sosialisasi dan pendalaman instrumen akreditasi 2.0 untuk program studi informatika dan komputer.",
      en: "A briefing on the 2.0 accreditation instrument for informatics and computing programs.",
    },
    issued: { year: 2025, month: 6 },
    featured: false,
    visibility: "draft",
  },
  {
    id: "petugas-it-lokal",
    kind: "pelatihan",
    title: {
      id: "Petugas IT Lokal, berbagai periode 2024 sampai 2026",
      en: "Local IT Officer, several periods from 2024 to 2026",
    },
    issuer: "Kemdiktisaintek",
    summary: {
      id: "Delapan penugasan berkala sebagai petugas IT lokal antara Maret 2024 dan Juni 2026.",
      en: "Eight recurring assignments as a local IT officer between March 2024 and June 2026.",
    },
    issued: { year: 2026, month: 6 },
    featured: false,
    visibility: "draft",
  },

  // ----- Hak cipta program komputer (DJKI) -----
  // Nomor pencatatan belum diberikan. showOnHome default: tiga yang terbaru.
  {
    id: "hki-suara-kampus",
    kind: "hki",
    title: { id: "Hak cipta program komputer: Suara Kampus", en: "Software copyright: Suara Kampus" },
    issuer: "Direktorat Jenderal Kekayaan Intelektual (DJKI)",
    summary: {
      id: "Kanal aspirasi mahasiswa dengan analisis sentimen otomatis. Saya tercatat sebagai salah satu pemegang hak cipta.",
      en: "A student feedback channel with automatic sentiment analysis. I am listed as one of the copyright holders.",
    },
    issued: { year: 2026, month: 8 },
    skills: ["Analisis sentimen", "Aplikasi seluler"],
    featured: false,
    showOnHome: true,
    visibility: "public",
  },
  {
    id: "hki-git-gud",
    kind: "hki",
    title: { id: "Hak cipta program komputer: Git Gud", en: "Software copyright: Git Gud" },
    issuer: "Direktorat Jenderal Kekayaan Intelektual (DJKI)",
    summary: {
      id: "Cheat sheet perintah Git berbahasa Indonesia. Saya tercatat sebagai salah satu pemegang hak cipta.",
      en: "An Indonesian-language cheat sheet for Git commands. I am listed as one of the copyright holders.",
    },
    issued: { year: 2026, month: 8 },
    skills: ["Git", "Aplikasi seluler"],
    featured: false,
    showOnHome: true,
    visibility: "public",
  },
  {
    id: "hki-sarpras",
    kind: "hki",
    title: { id: "Hak cipta program komputer: SARPRAS", en: "Software copyright: SARPRAS" },
    issuer: "Direktorat Jenderal Kekayaan Intelektual (DJKI)",
    summary: {
      id: "Pengelolaan aset sarana prasarana dan peminjaman ruang. Saya tercatat sebagai salah satu pemegang hak cipta.",
      en: "Facility asset management and room booking. I am listed as one of the copyright holders.",
    },
    issued: { year: 2026, month: 2 },
    skills: ["Laravel", "Manajemen aset"],
    featured: false,
    showOnHome: true,
    visibility: "public",
  },
  {
    id: "hki-diary-haid",
    kind: "hki",
    title: { id: "Hak cipta program komputer: Diary Haid", en: "Software copyright: Diary Haid" },
    issuer: "Direktorat Jenderal Kekayaan Intelektual (DJKI)",
    summary: {
      id: "Aplikasi kesehatan untuk mencatat siklus bulanan. Saya tercatat sebagai salah satu pemegang hak cipta.",
      en: "A health app for tracking the monthly cycle. I am listed as one of the copyright holders.",
    },
    issued: { year: 2025, month: 12 },
    skills: ["Aplikasi kesehatan"],
    featured: false,
    showOnHome: false,
    visibility: "public",
  },
  {
    id: "hki-ruang-pulih",
    kind: "hki",
    title: { id: "Hak cipta program komputer: Ruang Pulih", en: "Software copyright: Ruang Pulih" },
    issuer: "Direktorat Jenderal Kekayaan Intelektual (DJKI)",
    summary: {
      id: "Aplikasi dukungan kesehatan mental. Saya tercatat sebagai salah satu pemegang hak cipta.",
      en: "A mental health support app. I am listed as one of the copyright holders.",
    },
    issued: { year: 2025, month: 12 },
    skills: ["Aplikasi kesehatan"],
    featured: false,
    showOnHome: false,
    visibility: "public",
  },
  {
    id: "hki-clustermind",
    kind: "hki",
    title: { id: "Hak cipta program komputer: ClusterMind", en: "Software copyright: ClusterMind" },
    issuer: "Direktorat Jenderal Kekayaan Intelektual (DJKI)",
    summary: {
      id: "Aplikasi web clustering K-Means dengan TypeScript. Saya tercatat sebagai salah satu pemegang hak cipta.",
      en: "A K-Means clustering web app built with TypeScript. I am listed as one of the copyright holders.",
    },
    issued: { year: 2025, month: 7 },
    skills: ["K-Means", "TypeScript"],
    related: [{ label: { id: "Kode di GitHub", en: "Code on GitHub" }, href: "https://github.com/ahmadngiliyun00/ClusterMind" }],
    featured: false,
    showOnHome: false,
    visibility: "public",
  },
  {
    id: "hki-datacraft",
    kind: "hki",
    title: { id: "Hak cipta program komputer: DataCraft", en: "Software copyright: DataCraft" },
    issuer: "Direktorat Jenderal Kekayaan Intelektual (DJKI)",
    summary: {
      id: "Analisis sentimen dengan Python dan Flask memakai Naive Bayes dan SVM. Saya tercatat sebagai salah satu pemegang hak cipta.",
      en: "Sentiment analysis with Python and Flask using Naive Bayes and SVM. I am listed as one of the copyright holders.",
    },
    issued: { year: 2025, month: 2 },
    skills: ["Python", "Flask", "Naive Bayes", "SVM"],
    related: [{ label: { id: "Kode di GitHub", en: "Code on GitHub" }, href: "https://github.com/ahmadngiliyun00/datacraft" }],
    featured: false,
    showOnHome: false,
    visibility: "public",
  },

  // ----- Buku ber-ISBN (ditulis bersama kolega, nama rekan tidak ditampilkan) -----
  {
    id: "buku-pengantar-ilmu-komputer",
    kind: "buku",
    title: { id: "Pengantar Ilmu Komputer", en: "Pengantar Ilmu Komputer (Introduction to Computer Science)" },
    issuer: "CV. Malik Rizki Amanah",
    summary: {
      id: "Buku ajar ber-ISBN yang saya tulis bersama kolega.",
      en: "An ISBN textbook I co-wrote with colleagues.",
    },
    issued: { year: 2025 },
    featured: false,
    visibility: "public",
  },
  {
    id: "buku-e-government-smart-city",
    kind: "buku",
    title: { id: "E-Government dan Smart City", en: "E-Government dan Smart City (E-Government and Smart Cities)" },
    issuer: "CV. Malik Rizki Amanah",
    summary: {
      id: "Buku ber-ISBN yang saya tulis bersama kolega.",
      en: "An ISBN book I co-wrote with colleagues.",
    },
    issued: { year: 2025 },
    featured: false,
    visibility: "public",
  },

  // ----- Hibah penelitian -----
  {
    id: "hibah-pdp-neta-2026",
    kind: "hibah",
    title: {
      id: "Penelitian Dosen Pemula: NetA (Intelligent Network Agent)",
      en: "Beginner Lecturer Research Grant: NetA (Intelligent Network Agent)",
    },
    issuer: "Kemdiktisaintek",
    summary: {
      id: "Ketua peneliti dan system architect. NetA adalah sistem hibrida IoT dan large language model untuk membantu otomatisasi manajemen jaringan kampus, dengan perangkat edge, testbed MikroTik, backend Laravel, dan lapisan AI berbasis Gemini. Target TKT 3.",
      en: "Principal investigator and system architect. NetA is a hybrid IoT and large language model system that helps automate campus network management, with edge devices, a MikroTik testbed, a Laravel backend, and a Gemini-based AI layer. Target technology readiness level 3.",
    },
    issued: { year: 2026 },
    skills: ["IoT", "LLM", "Laravel", "MikroTik", "Gemini"],
    featured: false,
    visibility: "public",
  },

  // ----- Peran akademik dan keanggotaan -----
  {
    id: "reviewer-awatara-publisher",
    kind: "reviewer",
    title: { id: "Reviewer naskah jurnal", en: "Journal manuscript reviewer" },
    issuer: "Awatara Publisher",
    summary: {
      id: "Menelaah naskah secara blind review untuk jurnal terbitan Awatara Publisher, misalnya DEWANTECH.",
      en: "Blind-reviewing manuscripts for journals published by Awatara Publisher, such as DEWANTECH.",
    },
    issued: null,
    ongoing: true,
    featured: false,
    visibility: "public",
  },
  {
    id: "anggota-aptikom",
    kind: "keanggotaan",
    title: { id: "Anggota APTIKOM", en: "APTIKOM member" },
    issuer: "Asosiasi Pendidikan Tinggi Informatika dan Komputer (APTIKOM)",
    summary: {
      id: "Anggota asosiasi pendidikan tinggi informatika dan komputer di Indonesia.",
      en: "Member of the Indonesian association of informatics and computing higher education.",
    },
    issued: null,
    expires: { year: 2027, month: 8, day: 6 },
    featured: false,
    visibility: "public",
  },
  // Perlu bukti keanggotaan sebelum ditampilkan.
  {
    id: "anggota-ikapi",
    kind: "keanggotaan",
    title: { id: "Anggota IKAPI", en: "IKAPI member" },
    issuer: "Ikatan Penerbit Indonesia (IKAPI)",
    summary: {
      id: "Anggota perorangan Ikatan Penerbit Indonesia periode 2025 sampai 2027.",
      en: "Individual member of the Indonesian Publishers Association for 2025 to 2027.",
    },
    issued: { year: 2025 },
    expires: { year: 2027 },
    featured: false,
    visibility: "draft",
  },

  // ----- Publikasi (Google Scholar, SINTA, Garuda) -----
  // Judul ditulis persis seperti terbit. Tautan artikel resmi atau DOI belum diberikan.
  {
    id: "pub-2026-dota2-match-outcomes",
    kind: "publikasi",
    title: sameTitle(
      "Predicting Dota 2 Match Outcomes Using Machine Learning: A Single-Player Case Study and a Comparison of Pre-Match and Post-Match Models",
    ),
    issuer: "TECHNOVATAR 4(4), 50-60",
    issued: { year: 2026 },
    authorship: "sole",
    skills: ["Machine learning", "Klasifikasi"],
    featured: false,
    visibility: "public",
  },
  {
    id: "pub-2026-padel-rules-learning",
    kind: "publikasi",
    title: sameTitle("Development of a Scenario-Based Padel Rules Learning Application for Senior High School Students"),
    issuer: "DEWANTECH Jurnal Teknologi Pendidikan 4(1), 1-13",
    issued: { year: 2026 },
    authorship: "first",
    featured: false,
    visibility: "public",
  },
  {
    id: "pub-2026-traditional-arts-scoping-review",
    kind: "publikasi",
    title: sameTitle("Technology for Preserving Traditional Arts Through Learning: A Scoping Review of Approaches and Participation"),
    issuer: "DEWANTECH Jurnal Teknologi Pendidikan 4(1), 14-27",
    issued: { year: 2026 },
    authorship: "second",
    featured: false,
    visibility: "public",
  },
  {
    id: "pub-2026-fifa-world-cup-statsbomb",
    kind: "publikasi",
    title: sameTitle(
      "A Computational Exploration of Football Player Performance at the FIFA World Cup 2022 Using StatsBomb Event and 360 Spatial Data",
    ),
    issuer: "Indonesian Journal of Physical Education and Sport Science 6(3), 477-490",
    issued: { year: 2026 },
    authorship: "second",
    featured: false,
    visibility: "public",
  },
  {
    id: "pub-2026-big-data-online-promotion",
    kind: "publikasi",
    title: sameTitle(
      "Big Data Utilization and Online Promotion Strategy Impacting Customer Satisfaction Through Digital Experience and Buying Decision West Java",
    ),
    issuer: "Jurnal Bisnis dan Kewirausahaan 3(2), 92-108",
    issued: { year: 2026 },
    authorship: "second",
    featured: false,
    visibility: "public",
  },
  {
    id: "pub-2026-hipertensi-ifls5",
    kind: "publikasi",
    title: sameTitle(
      "Perbandingan Algoritma Machine Learning dalam Prediksi Hipertensi Berbasis Data Indonesian Family Life Survey (IFLS5)",
    ),
    issuer: "Jurnal Ilmu Kesehatan dan Keperawatan 4(1), 301-312",
    issued: { year: 2026 },
    authorship: "second",
    skills: ["Machine learning", "Klasifikasi"],
    featured: false,
    visibility: "public",
  },
  {
    id: "pub-2025-itil-v4-incident-management",
    kind: "publikasi",
    title: sameTitle(
      "Optimizing Incident Management With ITIL V4 Framework For Internet Network Stability At Mahardika Institute Of Technology And Health Cirebon",
    ),
    issuer: "Journal of Innovative and Creativity 5(2), 18487-18491",
    issued: { year: 2025 },
    authorship: "first",
    skills: ["ITIL v4", "Tata kelola TI"],
    featured: false,
    visibility: "public",
  },
  {
    id: "pub-2025-datacraft-sentimen",
    kind: "publikasi",
    title: sameTitle(
      "Pengembangan Aplikasi DataCraft untuk Analisis Sentimen Media Sosial sebagai Upaya Pemberdayaan Digital Masyarakat",
    ),
    issuer: "Aspirasi Masyarakat 2(1), 74-81",
    issued: { year: 2025 },
    authorship: "first",
    skills: ["Analisis sentimen", "Pengabdian masyarakat"],
    featured: false,
    visibility: "public",
  },
  {
    id: "pub-2025-literasi-digital-desa",
    kind: "publikasi",
    title: sameTitle(
      "Meningkatkan Literasi Digital dan Optimalkan Pemanfaatan Komputer melalui Digitalisasi Layanan Pemerintahan Desa Kota Cirebon",
    ),
    issuer: "Aspirasi Masyarakat 2(2), 96-109",
    issued: { year: 2025 },
    authorship: "second",
    skills: ["Pengabdian masyarakat"],
    featured: false,
    visibility: "public",
  },
  {
    id: "pub-2025-raci-bpmn-academic-service",
    kind: "publikasi",
    title: sameTitle("Academic Service Governance Using RACI Matrix and BPMN: A Higher Education Case Study"),
    issuer: "TECHNOVATAR",
    issued: { year: 2025 },
    authorship: "second",
    skills: ["RACI", "BPMN", "Tata kelola TI"],
    featured: false,
    visibility: "public",
  },
  {
    id: "pub-2024-rsa-book-publishing",
    kind: "publikasi",
    title: sameTitle("The Application of RSA Cryptography to Prevent Counterfeiting in the Book Publishing Industry"),
    issuer: "TECHNOVATAR",
    issued: { year: 2024 },
    authorship: "first",
    skills: ["Kriptografi RSA", "Keamanan data"],
    featured: false,
    visibility: "public",
  },
  {
    id: "pub-2024-panti-yauma",
    kind: "publikasi",
    title: sameTitle("Sistem Informasi Manajemen Administrasi Panti Yauma dan Dhu'afa Cirebon Berbasis Website"),
    issuer: "TECHNOVATAR",
    issued: { year: 2024 },
    authorship: "second",
    featured: false,
    visibility: "public",
  },
  {
    id: "pub-2023-digitalisasi-ukm-karangampel",
    kind: "publikasi",
    title: sameTitle(
      "Sosialisasi Pengembangan Digitalisasi UKM Menuju Masyarakat Mandiri dalam Menyongsong Era Society 5.0 di Desa Karangampel Kidul",
    ),
    issuer: "ADIMA Jurnal Awatara Pengabdian kepada Masyarakat 1(1), 31-35",
    issued: { year: 2023 },
    authorship: "first",
    skills: ["Pengabdian masyarakat"],
    featured: false,
    visibility: "public",
  },
  {
    id: "pub-2023-etika-bermedia-digital",
    kind: "publikasi",
    title: sameTitle("Upaya Meningkatkan Etika Bermedia Digital bagi Siswa di SMP PGRI Karangampel"),
    issuer: "ADIMA Jurnal Awatara Pengabdian kepada Masyarakat 1(1), 25-30",
    issued: { year: 2023 },
    authorship: "second",
    skills: ["Pengabdian masyarakat"],
    featured: false,
    visibility: "public",
  },
];
