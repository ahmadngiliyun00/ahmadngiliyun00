// Semua konten situs ada di file ini. Ubah teks di sini, bukan di komponen.
// Aturan gaya: tanpa em dash, tanpa simbol ampersand (tulis "dan" atau "and").
// Data GitHub (kontribusi dan repositori) ada di github.json, diperbarui otomatis saat build.
// Sertifikat, hak cipta, publikasi, dan capaian lain ada di achievements.ts.
// Berkas ini tidak boleh mengimpor apa pun, karena juga dibaca skrip README (scripts/readme-sections.mjs).

export type Lang = "id" | "en";
export type Localized<T> = Record<Lang, T>;

export const site = {
  url: "https://ngiliyun.my.id",
  name: "Ahmad Ngiliyun",
  fullName: "Ahmad Ngiliyun, M.Kom.",
  // Email disimpan terpisah (nama dan domain) supaya tidak mudah dipanen bot.
  // Ganti ke alamat domain sendiri setelah aktif, misalnya user "ahmad" dan domain "ngiliyun.my.id".
  // Kosongkan user ("") untuk menyembunyikan email dan formulir pesan.
  email: { user: "ahmadngiliyun", domain: "gmail.com" },
  timeZone: "Asia/Jakarta",
  timeZoneLabel: "WIB",
  city: "Cirebon",
};

export const links = {
  github: "https://github.com/ahmadngiliyun00",
  linkedin: "https://www.linkedin.com/in/ahmadngiliyun00/",
  orcid: "https://orcid.org/0009-0006-2688-722X",
  scholar: "https://scholar.google.com/citations?user=4N_lc7sAAAAJ",
  sinta: "https://sinta.kemdiktisaintek.go.id/authors/profile/6957752",
  garuda: "https://garuda.kemdiktisaintek.go.id/author/view/6741123",
  researchgate: "https://www.researchgate.net/profile/Ahmad-Ngiliyun",
  credly: "https://www.credly.com/users/ahmadngiliyun00",
  msLearn: "https://learn.microsoft.com/id-id/users/ahmadngiliyun00/",
  youtube: "https://www.youtube.com/@ahmadngiliyun00",
  x: "https://x.com/ahmadngiliyun00",
  instagram: "https://www.instagram.com/ahmadngiliyun00/",
  facebook: "https://www.facebook.com/ahmadngiliyun00",
};

// Profil riset, tampil di bagian Riset dan di halaman detail publikasi.
export const researchProfiles: { label: string; href: string }[] = [
  { label: "Google Scholar", href: links.scholar },
  { label: "SINTA", href: links.sinta },
  { label: "Garuda", href: links.garuda },
  { label: "ORCID", href: links.orcid },
  { label: "ResearchGate", href: links.researchgate },
];

// Profil kredensial daring, tampil sebagai "lihat semua kredensial".
export const credentialProfiles: { label: string; href: string }[] = [
  { label: "Credly", href: links.credly },
  { label: "Microsoft Learn", href: links.msLearn },
];

export type Channel = {
  label: string;
  handle: string;
  href: string;
  note: Localized<string>;
};

export const channels: Channel[] = [
  {
    label: "LinkedIn",
    handle: "ahmadngiliyun00",
    href: links.linkedin,
    note: { id: "Kerja sama profesional", en: "Professional enquiries" },
  },
  {
    label: "GitHub",
    handle: "ahmadngiliyun00",
    href: links.github,
    note: { id: "Kode dan proyek terbuka", en: "Code and open projects" },
  },
  {
    label: "ORCID",
    handle: "0009-0006-2688-722X",
    href: links.orcid,
    note: { id: "Rekam jejak publikasi", en: "Publication record" },
  },
  {
    label: "YouTube",
    handle: "@ahmadngiliyun00",
    href: links.youtube,
    note: { id: "Video materi dan tutorial", en: "Lessons and tutorials" },
  },
  {
    label: "Instagram",
    handle: "ahmadngiliyun00",
    href: links.instagram,
    note: { id: "Keseharian", en: "Day to day" },
  },
  {
    label: "X",
    handle: "@ahmadngiliyun00",
    href: links.x,
    note: { id: "Catatan singkat", en: "Short notes" },
  },
  {
    label: "Facebook",
    handle: "ahmadngiliyun00",
    href: links.facebook,
    note: { id: "Kabar dan komunitas", en: "News and community" },
  },
];

// Baris status kecil di atas nama pada hero. Perbarui tiap semester.
export const status: Localized<string> = {
  id: "Sedang mengajar semester ganjil 2026/2027",
  en: "Teaching the odd semester of 2026/2027",
};

// Pita teknologi (baris pertama running text).
export const skills: string[] = [
  "Next.js",
  "React",
  "TypeScript",
  "Tailwind CSS",
  "Laravel",
  "Expo",
  "React Native",
  "Python",
  "PyTorch",
  "FastAPI",
  "Jupyter",
  "Docker",
  "AlmaLinux",
  "Ubuntu",
  "Nginx",
  "Cloudflare",
  "Moodle",
];

// Pita topik (baris kedua running text, bergerak berlawanan arah).
export const topics: Localized<string[]> = {
  id: [
    "Klasifikasi",
    "Clustering K-Means",
    "Analisis sentimen",
    "Deep learning",
    "Computer vision",
    "Sistem rekomendasi",
    "AI agent",
    "REST API",
    "Aplikasi seluler",
    "Keamanan server",
    "LMS",
    "Data warehouse",
  ],
  en: [
    "Classification",
    "K-Means clustering",
    "Sentiment analysis",
    "Deep learning",
    "Computer vision",
    "Recommender systems",
    "AI agents",
    "REST APIs",
    "Mobile apps",
    "Server security",
    "LMS",
    "Data warehousing",
  ],
};

export type Area = {
  icon: "teach" | "ai" | "web" | "server";
  title: Localized<string>;
  body: Localized<string>;
  tools: string[];
};

// Bagian "Yang saya kerjakan".
export const areas: Area[] = [
  {
    icon: "teach",
    title: { id: "Mengajar dan membimbing", en: "Teaching and mentoring" },
    body: {
      id: "Mengampu mata kuliah AI dan pemrograman di dua kampus, menyusun RPS berbasis OBE, dan membagikan materi praktikum secara terbuka di GitHub.",
      en: "Teaching AI and programming courses at two universities, designing outcome-based syllabi, and publishing lab materials openly on GitHub.",
    },
    tools: ["Moodle", "GitHub", "Python", "Google Colab"],
  },
  {
    icon: "ai",
    title: { id: "Riset AI dan machine learning", en: "AI and machine learning research" },
    body: {
      id: "Klasifikasi, clustering, analisis sentimen, deep learning, dan integrasi AI agent ke dalam aplikasi yang dipakai sehari-hari.",
      en: "Classification, clustering, sentiment analysis, deep learning, and bringing AI agents into applications people use every day.",
    },
    tools: ["Python", "PyTorch", "Jupyter", "Naive Bayes", "SVM", "K-Means"],
  },
  {
    icon: "web",
    title: { id: "Pengembangan web dan seluler", en: "Web and mobile development" },
    body: {
      id: "Membangun sistem kampus dan aplikasi produksi dari skema data sampai antarmuka, untuk web maupun ponsel.",
      en: "Building campus systems and production apps from data schema to interface, on the web and on phones.",
    },
    tools: ["Next.js", "Laravel", "Tailwind CSS", "Expo"],
  },
  {
    icon: "server",
    title: { id: "Server dan infrastruktur", en: "Servers and infrastructure" },
    body: {
      id: "Mengelola VPS, LMS Moodle, dan keamanan server supaya layanan akademik tetap cepat, aman, dan tersedia.",
      en: "Running VPS hosts, Moodle LMS, and server security so academic services stay fast, safe, and available.",
    },
    tools: ["AlmaLinux", "Ubuntu", "Docker", "Nginx", "Cloudflare"],
  },
];

export type FeaturedProject = {
  name: string;
  repo: string;
  demo?: string;
  stack: string;
  visual: "cluster" | "sentiment" | "vision";
  copyright: boolean;
  badge?: Localized<string>;
  tags: Localized<string[]>;
  summary: Localized<string>;
};

// Proyek unggulan. Urutan array adalah urutan tampil. Tambah proyek baru di sini.
export const featured: FeaturedProject[] = [
  {
    name: "RupiahVision",
    repo: "https://github.com/RupiahVision/RupiahVision",
    stack: "Python",
    visual: "vision",
    copyright: false,
    badge: { id: "Capstone Pijak AI Engineer", en: "Pijak AI Engineer capstone" },
    tags: {
      id: ["MobileNetV2", "Transfer learning", "FastAPI", "React Native Expo"],
      en: ["MobileNetV2", "Transfer learning", "FastAPI", "React Native Expo"],
    },
    summary: {
      id: "Aplikasi pengenal nominal uang kertas Rupiah dari foto secara real-time, dengan 8 kelas: 7 nominal dan 1 kelas bukan uang. Saya menjadi Project Manager tim empat orang; akurasi uji internal 92,99 persen dan nilai capstone 93,6.",
      en: "A real-time app that recognizes Rupiah banknote denominations from a photo, with 8 classes: 7 denominations and 1 non-banknote class. I was Project Manager of a four-person team; internal test accuracy was 92.99 percent and the capstone score 93.6.",
    },
  },
  {
    name: "ClusterMind",
    repo: "https://github.com/ahmadngiliyun00/ClusterMind",
    demo: "https://scintillating-manatee-97b7c0.netlify.app/",
    stack: "TypeScript",
    visual: "cluster",
    copyright: true,
    tags: {
      id: ["K-Means", "Normalisasi Z-score", "Jarak Euclidean"],
      en: ["K-Means", "Z-score normalization", "Euclidean distance"],
    },
    summary: {
      id: "Aplikasi web interaktif untuk mengelompokkan data dengan K-Means. Unggah data, pilih jumlah kluster, dan lihat hasilnya langsung tanpa menulis kode.",
      en: "An interactive web app for clustering data with K-Means. Upload a dataset, pick the number of clusters, and see the result right away without writing code.",
    },
  },
  {
    name: "DataCraft",
    repo: "https://github.com/ahmadngiliyun00/datacraft",
    stack: "Python",
    visual: "sentiment",
    copyright: true,
    tags: {
      id: ["Naive Bayes", "Support Vector Machine", "Text mining"],
      en: ["Naive Bayes", "Support Vector Machine", "Text mining"],
    },
    summary: {
      id: "Aplikasi berbasis web untuk analisis sentimen dengan Naive Bayes dan SVM, lengkap dengan pemrosesan teks otomatis dari data mentah sampai hasil klasifikasi.",
      en: "A web app for sentiment analysis with Naive Bayes and SVM, with automatic text processing from raw data to classification results.",
    },
  },
];

export type SystemProject = {
  name: string;
  full?: string;
  period: Localized<string>;
  role: Localized<string>;
  stack: string[];
  summary: Localized<string>;
  repo?: string; // hanya untuk repositori publik
  visibility: "public" | "draft";
};

// Sistem yang dikembangkan. Sebagian besar repositori privat, jadi tanpa tautan kode.
// Status publik atau privat diperiksa dengan: gh repo view <owner>/<repo> --json isPrivate
export const systems: SystemProject[] = [
  {
    name: "NetA",
    full: "Intelligent Network Agent",
    period: { id: "Agustus 2026 sampai sekarang", en: "August 2026 to present" },
    role: { id: "Ketua peneliti dan system architect", en: "Principal investigator and system architect" },
    stack: ["Laravel", "Livewire", "IoT", "MikroTik", "Gemini"],
    summary: {
      id: "Sistem hibrida IoT dan large language model untuk membantu otomatisasi manajemen jaringan kampus. Didanai hibah Penelitian Dosen Pemula Kemdiktisaintek 2026.",
      en: "A hybrid IoT and large language model system that helps automate campus network management. Funded by the 2026 Kemdiktisaintek Beginner Lecturer Research grant.",
    },
    visibility: "public",
  },
  {
    name: "SIJAMU V2",
    full: "Sistem Informasi Penjaminan Mutu",
    period: { id: "April 2026 sampai sekarang", en: "April 2026 to present" },
    role: { id: "Software engineer", en: "Software engineer" },
    stack: ["Laravel 12", "Filament", "Livewire"],
    summary: {
      id: "Platform penjaminan mutu internal perguruan tinggi: dokumen SPMI, audit mutu internal, dan rapat tinjauan manajemen dalam siklus PPEPP.",
      en: "An internal quality assurance platform for universities: quality documents, internal audits, and management reviews across the PPEPP cycle.",
    },
    visibility: "public",
  },
  {
    name: "SAKU",
    full: "Sistem Administrasi Keuangan",
    period: { id: "2025 sampai sekarang", en: "2025 to present" },
    role: { id: "Pengembang", en: "Developer" },
    stack: ["React", "Vite", "Laravel"],
    summary: {
      id: "Sistem administrasi keuangan Universitas Insan Mahardika. Versi terbaru dibangun ulang sebagai aplikasi React dan Vite dengan API Laravel.",
      en: "The financial administration system of Universitas Insan Mahardika, rebuilt in its latest version as a React and Vite app with a Laravel API.",
    },
    visibility: "public",
  },
  {
    name: "CERDAS PAUD",
    full: "Catatan Evaluasi dan Rapor Anak Usia Dini Berbasis AI",
    period: { id: "Agustus sampai Desember 2025", en: "August to December 2025" },
    role: { id: "Pengembang full-stack", en: "Full-stack developer" },
    stack: ["Next.js", "Firebase", "Gemini"],
    summary: {
      id: "Pemantauan perkembangan dan rapor anak usia dini berbasis AI, mengikuti Kurikulum Merdeka PAUD.",
      en: "AI-assisted progress tracking and report cards for early childhood education, following the Kurikulum Merdeka PAUD.",
    },
    visibility: "public",
  },
  // Draft: sistem ini dipakai untuk penelitian disertasi orang lain yang belum terbit.
  {
    name: "Serenicare",
    period: { id: "Mei 2026 sampai sekarang", en: "May 2026 to present" },
    role: { id: "Pengembang", en: "Developer" },
    stack: ["Laravel", "Expo", "Wear OS"],
    summary: {
      id: "Pemantauan HRV dari perangkat wearable secara real-time.",
      en: "Real-time HRV monitoring from a wearable device.",
    },
    visibility: "draft",
  },
];

// Daftar "Terbaru di GitHub" diambil otomatis dari github.json.
// Repositori di bawah ini tidak ditampilkan. Proyek unggulan otomatis dikecualikan.
export const recentRepos = {
  limit: 5,
  exclude: [
    "ahmadngiliyun00",
    "skills-communicate-using-markdown",
    "skills-copilot-codespaces-vscode",
    "stackblitz-starters-94ekwdxn",
    "github-slideshow",
    "Election",
    "ElectionofBEM",
    "ganteng",
    "notes-app",
    "bookshelf-api",
    "camera-flutter",
    "Aplikasi-Python-Pengubah-Bilangan-Desimal-ke-Biner",
    "Aplikasi-Python-Penentu-Zodiak-Berdasarkan-Tanggal-Lahir",
    "Aplikasi-Python-Penentu-Nilai-Akhir",
    "Aplikasi-Python-Konversi-Suhu",
    "Aplikasi-Python-Konversi-Mata-Uang",
    "Aplikasi-Python-Kalkulator-Sederhana",
  ],
};

// ---------- Mengajar ----------
// Kode semester = tahun akademik + semester, misalnya 26271 = ganjil 2026/2027.
// Hanya semester berjalan yang pasti ganjil atau genap. Semester lama ditulis tahun akademiknya saja.

export const currentTerm = "26271";

export const terms: Record<string, Localized<string>> = {
  "26271": { id: "Ganjil 2026/2027", en: "Odd semester 2026/2027" },
  "25262": { id: "2025/2026", en: "2025/2026" },
  "25261": { id: "2025/2026", en: "2025/2026" },
  "24252": { id: "2024/2025", en: "2024/2025" },
  "24251": { id: "2024/2025", en: "2024/2025" },
  "23241": { id: "2023/2024", en: "2023/2024" },
};

export type Program = "inf" | "rmik" | "si" | "ti";

export const programs: Record<Program, Localized<string>> = {
  inf: { id: "Informatika", en: "Informatics" },
  rmik: { id: "RMIK", en: "Health Information Management" },
  si: { id: "Sistem Informasi", en: "Information Systems" },
  ti: { id: "Teknik Informatika", en: "Informatics Engineering" },
};

export type Course = {
  name: Localized<string>;
  programs: Program[];
  terms: string[]; // kode semester saat mata kuliah ini diampu
  repo?: string; // materi terbuka di GitHub
};

export type Institution = {
  name: string;
  role: Localized<string>;
  note: Localized<string>;
  courses: Course[];
};

export const teaching: Institution[] = [
  {
    name: "Universitas Insan Mahardika",
    role: {
      id: "Dosen tetap, Program Studi Informatika",
      en: "Permanent lecturer, Informatics Study Program",
    },
    note: {
      id: "Mengajar sebagai team teaching sejak 2023/2024 saat berstatus staf IT, dan menjadi dosen tetap sejak Mei 2025.",
      en: "Taught as part of a teaching team from 2023/2024 while on the IT staff, and became a permanent lecturer in May 2025.",
    },
    courses: [
      {
        name: { id: "Jaringan Komputer", en: "Computer Networks" },
        programs: ["inf", "rmik"],
        terms: ["24251", "24252", "25261", "26271"],
      },
      {
        name: { id: "Pemrograman Berorientasi Objek", en: "Object-Oriented Programming" },
        programs: ["inf"],
        terms: ["25261", "26271"],
        repo: "https://github.com/Institut-Mahardika/mk-pbo-2526",
      },
      {
        name: { id: "Internet of Things", en: "Internet of Things" },
        programs: ["inf"],
        terms: ["25261", "26271"],
        repo: "https://github.com/Institut-Mahardika/mk-iot-2526",
      },
      {
        name: { id: "Pemrograman Mobile 2", en: "Mobile Programming 2" },
        programs: ["inf"],
        terms: ["26271"],
      },
      {
        name: { id: "Proyek Software", en: "Software Project" },
        programs: ["inf"],
        terms: ["26271"],
      },
      {
        name: { id: "Magang", en: "Internship" },
        programs: ["inf"],
        terms: ["26271"],
      },
      {
        name: { id: "Cloud Computing", en: "Cloud Computing" },
        programs: ["rmik"],
        terms: ["26271"],
      },
      {
        name: { id: "Pembelajaran Mesin", en: "Machine Learning" },
        programs: ["inf"],
        terms: ["24252", "25262"],
      },
      {
        name: { id: "Deep Learning", en: "Deep Learning" },
        programs: ["inf"],
        terms: ["25262"],
      },
      {
        name: { id: "Algoritma Pemrograman", en: "Algorithms and Programming" },
        programs: ["inf", "rmik"],
        terms: ["23241", "24251", "25261"],
        repo: "https://github.com/Institut-Mahardika/mk-algorpo-2526",
      },
      {
        name: { id: "Rekayasa Perangkat Lunak", en: "Software Engineering" },
        programs: ["inf"],
        terms: ["24252", "25262"],
      },
      {
        name: { id: "Analisis dan Desain Perangkat Lunak", en: "Software Analysis and Design" },
        programs: ["inf"],
        terms: ["25261"],
      },
      {
        name: { id: "Pemrograman Mobile 1", en: "Mobile Programming 1" },
        programs: ["inf"],
        terms: ["25262"],
      },
      {
        name: { id: "Keamanan Data dan Informasi", en: "Data and Information Security" },
        programs: ["inf"],
        terms: ["25262"],
      },
      {
        name: { id: "Keamanan dan Perlindungan Data", en: "Data Security and Protection" },
        programs: ["rmik"],
        terms: ["25262"],
      },
      {
        name: { id: "Organisasi dan Arsitektur Komputer", en: "Computer Organization and Architecture" },
        programs: ["inf"],
        terms: ["25261"],
      },
      {
        name: { id: "Komputer Desain Grafis", en: "Computer Graphic Design" },
        programs: ["inf"],
        terms: ["25262"],
      },
      {
        name: { id: "Pengantar Ilmu Komputer", en: "Introduction to Computer Science" },
        programs: ["inf"],
        terms: ["24251"],
      },
      {
        name: { id: "Basis Data", en: "Databases" },
        programs: ["rmik"],
        terms: ["24251"],
      },
    ],
  },
  {
    name: "Universitas Nahdlatul Ulama Cirebon",
    role: { id: "Dosen, Fakultas Ilmu Komputer", en: "Lecturer, Faculty of Computer Science" },
    note: {
      id: "Kembali mengajar di kampus tempat saya menyelesaikan S1 dan bekerja sebagai IT support specialist.",
      en: "Back teaching at the university where I finished my bachelor's degree and worked as an IT support specialist.",
    },
    courses: [
      {
        name: { id: "Manajemen Proyek Sistem Informasi", en: "Information Systems Project Management" },
        programs: ["si"],
        terms: ["26271"],
      },
      {
        name: { id: "Interaksi Manusia dan Komputer", en: "Human-Computer Interaction" },
        programs: ["ti"],
        terms: ["26271"],
      },
      {
        name: { id: "Kecerdasan Buatan", en: "Artificial Intelligence" },
        programs: ["ti"],
        terms: ["25262"],
      },
      {
        name: { id: "Data Warehouse", en: "Data Warehousing" },
        programs: ["si"],
        terms: ["25262"],
      },
      {
        name: { id: "Pemrograman Berbasis Objek GUI", en: "Object-Based GUI Programming" },
        programs: ["si"],
        terms: ["25262"],
      },
      {
        name: { id: "Proyek Pemrograman Berorientasi Objek", en: "Object-Oriented Programming Project" },
        programs: ["ti"],
        terms: ["25262"],
      },
    ],
  },
];

export type TeachingFocus = { title: Localized<string>; courses: Localized<string> };

// Bidang keahlian mengajar, tidak terikat kampus.
export const teachingFocus: TeachingFocus[] = [
  {
    title: { id: "AI, machine learning, dan deep learning", en: "AI, machine learning, and deep learning" },
    courses: {
      id: "Kecerdasan Buatan, Pembelajaran Mesin, Deep Learning",
      en: "Artificial Intelligence, Machine Learning, Deep Learning",
    },
  },
  {
    title: { id: "Data dan keamanan data", en: "Data and data security" },
    courses: {
      id: "Data Warehouse, Basis Data, Keamanan Data dan Informasi",
      en: "Data Warehousing, Databases, Data and Information Security",
    },
  },
  {
    title: { id: "Pemrograman dan rekayasa perangkat lunak", en: "Programming and software engineering" },
    courses: {
      id: "Algoritma Pemrograman, PBO, Pemrograman Mobile, Rekayasa Perangkat Lunak",
      en: "Algorithms and Programming, OOP, Mobile Programming, Software Engineering",
    },
  },
  {
    title: { id: "Jaringan, IoT, dan cloud", en: "Networks, IoT, and cloud" },
    courses: {
      id: "Jaringan Komputer, Internet of Things, Cloud Computing",
      en: "Computer Networks, Internet of Things, Cloud Computing",
    },
  },
];

// ---------- Riset ----------

export const researchThemes: Localized<string[]> = {
  id: [
    "Klasifikasi dan prediksi",
    "Analisis sentimen",
    "Keamanan data dan kriptografi",
    "Tata kelola layanan TI",
    "Pengabdian masyarakat digital",
  ],
  en: [
    "Classification and prediction",
    "Sentiment analysis",
    "Data security and cryptography",
    "IT service governance",
    "Digital community service",
  ],
};

export type Milestone = {
  when: Localized<string>;
  title: Localized<string>;
  body: Localized<string>;
  current?: boolean;
};

// Perjalanan, urut dari yang paling awal.
export const journey: Milestone[] = [
  {
    when: { id: "2017", en: "2017" },
    title: { id: "Mulai menulis kode di GitHub", en: "Started writing code on GitHub" },
    body: {
      id: "Akun GitHub dibuat pada November 2017 dan sejak itu menjadi tempat menyimpan kode.",
      en: "Opened a GitHub account in November 2017, and it has held my code ever since.",
    },
  },
  {
    when: { id: "2019", en: "2019" },
    title: { id: "Kuliah Teknik Informatika", en: "Started studying informatics" },
    body: {
      id: "Masuk S1 Teknik Informatika di STIKOM Poltek Cirebon, sambil menjadi asisten laboratorium komputer.",
      en: "Began a bachelor's in informatics engineering at STIKOM Poltek Cirebon, while working as a computer lab assistant.",
    },
  },
  {
    when: { id: "2020", en: "2020" },
    title: { id: "Pindah ke UNU Cirebon", en: "Moved to UNU Cirebon" },
    body: {
      id: "Melanjutkan S1 di Universitas Nahdlatul Ulama Cirebon mulai semester 3, bekerja sebagai IT support specialist di sana, dan bergabung di Dicoding.",
      en: "Continued my bachelor's at Universitas Nahdlatul Ulama Cirebon from the third semester, worked there as an IT support specialist, and joined Dicoding.",
    },
  },
  {
    when: { id: "Februari 2022", en: "February 2022" },
    title: { id: "Mendirikan AWATARA", en: "Co-founded AWATARA" },
    body: {
      id: "Ikut mendirikan AWATARA Research and Education Solution sebagai co-founder dan full stack engineer.",
      en: "Co-founded AWATARA Research and Education Solution as co-founder and full stack engineer.",
    },
  },
  {
    when: { id: "2023", en: "2023" },
    title: { id: "Lulus S1, bergabung dengan Mahardika", en: "Graduated, joined Mahardika" },
    body: {
      id: "Lulus S1 Teknik Informatika UNU Cirebon dengan skripsi kriptografi RSA untuk mencegah pemalsuan buku. Pada Desember bergabung dengan Universitas Insan Mahardika, saat itu Institut Teknologi dan Kesehatan Mahardika, sebagai staf IT.",
      en: "Earned my bachelor's in informatics engineering from UNU Cirebon with a thesis on RSA cryptography against book counterfeiting. In December I joined Universitas Insan Mahardika, then Institut Teknologi dan Kesehatan Mahardika, on the IT staff.",
    },
  },
  {
    when: { id: "2024", en: "2024" },
    title: { id: "Studi magister", en: "Graduate studies" },
    body: {
      id: "Menempuh Magister Komputer bidang Sistem Informasi di STMIK LIKMI Bandung, sambil mengajar sebagai team teaching.",
      en: "Studied for a Master of Computer Science in Information Systems at STMIK LIKMI Bandung, while teaching as part of a teaching team.",
    },
  },
  {
    when: { id: "April 2025", en: "April 2025" },
    title: { id: "Lulus Magister Komputer", en: "Earned a Master of Computer Science" },
    body: {
      id: "Dinyatakan lulus dan meraih gelar M.Kom., lalu diwisuda pada Mei 2025.",
      en: "Completed graduate studies with the M.Kom. degree, and graduated in May 2025.",
    },
  },
  {
    when: { id: "Mei 2025", en: "May 2025" },
    title: { id: "Dosen tetap Informatika", en: "Permanent informatics lecturer" },
    body: {
      id: "Diangkat menjadi dosen tetap Program Studi Informatika, Universitas Insan Mahardika.",
      en: "Appointed permanent lecturer in the Informatics Study Program, Universitas Insan Mahardika.",
    },
  },
  {
    when: { id: "2026", en: "2026" },
    title: { id: "AI engineer dan hibah penelitian", en: "AI engineering and a research grant" },
    body: {
      id: "Lulus Penuh program AI Engineer Pijak bersama IBM SkillsBuild, mengikuti PEKERTI Batch-30, dan memimpin penelitian NetA lewat hibah Penelitian Dosen Pemula.",
      en: "Completed the Pijak AI Engineer program with IBM SkillsBuild in full, took part in PEKERTI Batch 30, and began leading the NetA project under a Beginner Lecturer Research grant.",
    },
  },
  {
    when: { id: "Sekarang", en: "Now" },
    title: { id: "Mengajar, mengelola, dan membangun", en: "Teaching, leading, and building" },
    body: {
      id: "Sekretaris Program Studi Informatika dan staf IT di Universitas Insan Mahardika, co-founder AWATARA Research and Education Solution, dan dosen di FILKOM UNU Cirebon.",
      en: "Secretary of the Informatics Study Program and IT staff at Universitas Insan Mahardika, co-founder of AWATARA Research and Education Solution, and lecturer at FILKOM UNU Cirebon.",
    },
    current: true,
  },
];

export type Contribution = {
  title: Localized<string>;
  body: Localized<string>;
  // Tautan internal (diawali "#") atau eksternal.
  href?: string;
  linkLabel?: Localized<string>;
};

// Kontribusi di luar kode, tampil di bawah grafik GitHub.
export const contributions: Contribution[] = [
  {
    title: { id: "Hak cipta perangkat lunak", en: "Registered software copyrights" },
    body: {
      id: "HKI terdaftar di DJKI untuk DataCraft, ClusterMind, SARPRAS, dan perangkat lunak lain.",
      en: "Copyrights registered with DJKI for DataCraft, ClusterMind, SARPRAS, and other software.",
    },
    href: "#achievements",
    linkLabel: { id: "Lihat capaian", en: "See achievements" },
  },
  {
    title: { id: "Reviewer jurnal", en: "Journal reviewer" },
    body: {
      id: "Menelaah naskah secara blind review untuk jurnal terbitan Awatara Publisher.",
      en: "Blind-reviewing manuscripts for journals published by Awatara Publisher.",
    },
  },
  {
    title: { id: "Publikasi ilmiah", en: "Research publications" },
    body: {
      id: "Artikel di jurnal nasional, tercatat di Google Scholar, SINTA, Garuda, dan ORCID.",
      en: "Articles in national journals, indexed on Google Scholar, SINTA, Garuda, and ORCID.",
    },
    href: "#research",
    linkLabel: { id: "Lihat publikasi", en: "See publications" },
  },
];

export type Collab = { title: Localized<string>; body: Localized<string> };

// Jenis kerja sama yang ditawarkan. Judulnya juga dipakai sebagai pilihan topik di formulir.
export const collabs: Collab[] = [
  {
    title: { id: "Kolaborasi riset", en: "Research collaboration" },
    body: {
      id: "Penelitian bersama di bidang AI, machine learning, dan sistem informasi, sampai publikasi.",
      en: "Joint research in AI, machine learning, and information systems, through to publication.",
    },
  },
  {
    title: { id: "Pengembangan sistem", en: "System development" },
    body: {
      id: "Aplikasi web dan seluler untuk sekolah, kampus, UMKM, atau organisasi.",
      en: "Web and mobile applications for schools, campuses, small businesses, or organizations.",
    },
  },
  {
    title: { id: "Narasumber dan pelatihan", en: "Talks and workshops" },
    body: {
      id: "Seminar, workshop, atau pelatihan tentang pemrograman, AI, dan pemanfaatannya di pendidikan.",
      en: "Seminars, workshops, or training on programming, AI, and its use in education.",
    },
  },
  {
    title: { id: "Server dan LMS", en: "Servers and LMS" },
    body: {
      id: "Penyiapan, pengamanan, dan optimasi VPS serta LMS Moodle.",
      en: "Setting up, securing, and tuning VPS hosts and Moodle LMS.",
    },
  },
];

export type Copy = {
  meta: { title: string; description: string; jobTitle: string };
  nav: {
    about: string;
    projects: string;
    activity: string;
    research: string;
    achievements: string;
    teaching: string;
    journey: string;
    contact: string;
    skip: string;
    label: string;
    switchLabel: string;
    menu: string;
    close: string;
  };
  hero: {
    statement: string;
    lead: string;
    primary: string;
    secondary: string;
    localTime: string;
    year: string;
  };
  marqueeLabel: { skills: string; topics: string };
  kmeans: {
    aria: string;
    caption: string;
    add: string;
    reset: string;
    iteration: string;
    running: string;
    converged: string;
    cluster: string;
    points: string;
  };
  about: {
    title: string;
    statement: string;
    facts: { label: string; value: string }[];
    areasTitle: string;
  };
  projects: {
    title: string;
    intro: string;
    code: string;
    demo: string;
    release: string;
    copyright: string;
    recentTitle: string;
    recentIntro: string;
    updated: string;
    all: string;
    sentimentLabels: [string, string, string];
    visualCluster: string;
    visualSentiment: string;
    visualVision: string;
    visionOther: string;
    systemsTitle: string;
    systemsIntro: string;
    privateRepo: string;
  };
  activity: {
    title: string;
    intro: string;
    total: string;
    activeDays: string;
    longestStreak: string;
    busiestDay: string;
    days: string;
    less: string;
    more: string;
    tooltipNone: string;
    tooltipOne: string;
    tooltipMany: string;
    summary: string;
    updatedAt: string;
    publicRepos: string;
    since: string;
    otherTitle: string;
    open: string;
    weekdays: [string, string, string];
  };
  research: {
    title: string;
    intro: string;
    themesTitle: string;
    grantTitle: string;
    publicationsTitle: string;
    profilesTitle: string;
    publicationCount: string;
    noLink: string;
  };
  achievements: {
    title: string;
    intro: string;
    filterLabel: string;
    certificatesTab: string;
    copyrightsTab: string;
    viewAll: string;
    verify: string;
    details: string;
    citations: string;
    hIndex: string;
    sinta: string;
    copyrights: string;
    publications: string;
    asOf: string;
    allCredentials: string;
  };
  archive: {
    metaTitle: string;
    metaDescription: string;
    title: string;
    intro: string;
    searchLabel: string;
    searchPlaceholder: string;
    kindLabel: string;
    all: string;
    yearLabel: string;
    allYears: string;
    resultsOne: string;
    resultsMany: string;
    empty: string;
    reset: string;
    home: string;
    crumbs: string;
    msLearnTitle: string;
    msLearnLine: string;
    profilesTitle: string;
  };
  detail: {
    back: string;
    issuer: string;
    issued: string;
    expires: string;
    credentialId: string;
    reference: string;
    authorship: string;
    status: string;
    ongoing: string;
    noDate: string;
    skills: string;
    verify: string;
    verifyTitle: string;
    verifyNone: string;
    file: string;
    fileOpen: string;
    fileFallback: string;
    linkedin: string;
    linkedinNote: string;
    linkedinPending: string;
    copy: string;
    copyNote: string;
    copied: string;
    copyFailed: string;
    shareTitle: string;
    related: string;
    profiles: string;
    paste: { issuer: string; date: string; credentialId: string; link: string };
  };
  teaching: {
    title: string;
    intro: string;
    materials: string;
    current: string;
    past: string;
    focusTitle: string;
    noneCurrent: string;
  };
  journey: { title: string; intro: string };
  contact: {
    marquee: string;
    title: string;
    intro: string;
    formTitle: string;
    name: string;
    namePlaceholder: string;
    topic: string;
    otherTopic: string;
    message: string;
    messagePlaceholder: string;
    send: string;
    sendNote: string;
    needMessage: string;
    emailLabel: string;
    copy: string;
    copied: string;
    channelsTitle: string;
    localTime: string;
    subjectPrefix: string;
    greeting: string;
  };
  footer: { built: string; top: string };
  newTab: string;
};

export const copy: Localized<Copy> = {
  id: {
    meta: {
      title: "Ahmad Ngiliyun - Dosen Informatika dan Pengembang Full-stack",
      description:
        "Portofolio Ahmad Ngiliyun, M.Kom.: dosen informatika di Cirebon, pengembang full-stack, dan peneliti machine learning. Proyek, publikasi, sertifikat, mata kuliah, dan kontak kolaborasi.",
      jobTitle: "Dosen informatika dan pengembang full-stack",
    },
    nav: {
      about: "Tentang",
      projects: "Proyek",
      activity: "Kontribusi",
      research: "Riset",
      achievements: "Capaian",
      teaching: "Mengajar",
      journey: "Perjalanan",
      contact: "Kontak",
      skip: "Lompat ke konten",
      label: "Navigasi utama",
      switchLabel: "Bahasa",
      menu: "Menu",
      close: "Tutup",
    },
    hero: {
      statement: "Dosen informatika yang membangun sistem AI, web, dan seluler.",
      lead: "Saya mengajar di Cirebon, meneliti machine learning, dan mengubah ide di ruang kelas menjadi aplikasi yang benar-benar dipakai.",
      primary: "Lihat proyek",
      secondary: "Ajak berkolaborasi",
      localTime: "Waktu di Cirebon",
      year: "tahun",
    },
    marqueeLabel: {
      skills: "Teknologi yang saya gunakan",
      topics: "Topik yang saya dalami",
    },
    kmeans: {
      aria: "Visualisasi K-Means: titik data diwarnai sesuai kluster terdekatnya",
      caption:
        "K-Means mengelompokkan titik-titik ini menjadi tiga kluster. Klik area plot untuk menambah titik dan lihat pusat kluster bergeser.",
      add: "Tambah titik",
      reset: "Acak ulang pusat",
      iteration: "Iterasi",
      running: "mengelompokkan",
      converged: "stabil",
      cluster: "Kluster",
      points: "titik",
    },
    about: {
      title: "Tentang",
      statement:
        "Saya percaya cara terbaik mengajar teknologi adalah dengan ikut membangunnya. Karena itu ruang kelas, riset, dan server saya saling terhubung: materi kuliah lahir dari proyek nyata, dan proyek nyata menjadi bahan riset.",
      facts: [
        { label: "Afiliasi", value: "Program Studi Informatika, Universitas Insan Mahardika" },
        { label: "Peran", value: "Dosen tetap, Sekretaris Program Studi, dan staf IT" },
        { label: "Pendiri bersama", value: "AWATARA Research and Education Solution" },
        { label: "Lokasi", value: "Cirebon, Jawa Barat" },
      ],
      areasTitle: "Yang saya kerjakan",
    },
    projects: {
      title: "Proyek",
      intro: "Proyek unggulan dengan kode terbuka, dari capstone computer vision sampai aplikasi yang hak ciptanya terdaftar.",
      code: "Kode di GitHub",
      demo: "Coba demo",
      release: "Unduh rilis",
      copyright: "Hak cipta terdaftar",
      recentTitle: "Terbaru di GitHub",
      recentIntro: "Diperbarui otomatis dari repositori publik setiap kali situs dibangun.",
      updated: "Diperbarui",
      all: "Semua repositori",
      sentimentLabels: ["Positif", "Netral", "Negatif"],
      visualCluster: "Ilustrasi tiga kluster data dengan pusatnya",
      visualSentiment: "Ilustrasi proporsi sentimen positif, netral, dan negatif",
      visualVision: "Ilustrasi uang kertas yang dikenali model, dengan peluang tiap kelas. Bukan hasil prediksi sebenarnya",
      visionOther: "Bukan uang",
      systemsTitle: "Sistem yang saya kembangkan",
      systemsIntro: "Sebagian besar dipakai di kampus dan mitra, jadi kodenya berada di repositori privat.",
      privateRepo: "Repositori privat",
    },
    activity: {
      title: "Kontribusi",
      intro: "Jejak kerja di GitHub selama setahun terakhir, ditambah kontribusi di luar kode.",
      total: "kontribusi dalam setahun",
      activeDays: "hari aktif",
      longestStreak: "hari beruntun terpanjang",
      busiestDay: "kontribusi di hari tersibuk",
      days: "hari",
      less: "Sedikit",
      more: "Banyak",
      tooltipNone: "Tidak ada kontribusi pada {date}",
      tooltipOne: "1 kontribusi pada {date}",
      tooltipMany: "{n} kontribusi pada {date}",
      summary: "Grafik kontribusi GitHub: {n} kontribusi dalam setahun terakhir, aktif pada {d} hari.",
      updatedAt: "Data diambil {date}",
      publicRepos: "repositori publik",
      since: "di GitHub sejak",
      otherTitle: "Di luar kode",
      open: "Buka",
      weekdays: ["Sen", "Rab", "Jum"],
    },
    research: {
      title: "Riset",
      intro: "Machine learning untuk klasifikasi dan prediksi, analisis sentimen, keamanan data, dan tata kelola TI, ditambah pengabdian masyarakat.",
      themesTitle: "Tema riset",
      grantTitle: "Hibah penelitian",
      publicationsTitle: "Publikasi",
      profilesTitle: "Profil riset",
      publicationCount: "{n} publikasi",
      noLink: "Tautan artikel tersedia lewat profil Google Scholar dan Garuda.",
    },
    achievements: {
      title: "Sertifikat dan capaian",
      intro: "Sorotan pelatihan, sertifikat, dan hak cipta. Setiap sertifikat bisa diverifikasi langsung ke penerbitnya.",
      filterLabel: "Tampilkan",
      certificatesTab: "Sertifikat dan pelatihan",
      copyrightsTab: "Hak cipta",
      viewAll: "Lihat semua ({n})",
      verify: "Verifikasi",
      details: "Detail",
      citations: "sitasi",
      hIndex: "h-index",
      sinta: "skor SINTA",
      copyrights: "hak cipta terdaftar",
      publications: "publikasi",
      asOf: "Sitasi, h-index, dan skor SINTA per {date}.",
      allCredentials: "Semua kredensial di",
    },
    archive: {
      metaTitle: "Sertifikat dan Capaian - Ahmad Ngiliyun",
      metaDescription:
        "Arsip lengkap sertifikat, pelatihan, hak cipta, buku, publikasi, hibah, dan keanggotaan Ahmad Ngiliyun, M.Kom., dengan tautan verifikasi resmi.",
      title: "Sertifikat dan capaian",
      intro: "Arsip lengkap. Cari berdasarkan judul, penerbit, atau keterampilan, lalu saring per kategori dan tahun.",
      searchLabel: "Cari",
      searchPlaceholder: "Misalnya machine learning, Dicoding, atau DJKI",
      kindLabel: "Kategori",
      all: "Semua",
      yearLabel: "Tahun",
      allYears: "Semua tahun",
      resultsOne: "1 capaian",
      resultsMany: "{n} capaian",
      empty: "Tidak ada capaian yang cocok dengan pencarian ini.",
      reset: "Hapus saringan",
      home: "Beranda",
      crumbs: "Jejak halaman",
      msLearnTitle: "Microsoft Learn",
      msLearnLine: "{badges} lencana, {trophies} piala, {modules} modul, dan {paths} jalur pembelajaran selesai, dengan {hours} jam {minutes} menit waktu belajar. Data per {date}.",
      profilesTitle: "Semua kredensial daring",
    },
    detail: {
      back: "Kembali ke arsip",
      issuer: "Penerbit",
      issued: "Tanggal terbit",
      expires: "Berlaku sampai",
      credentialId: "ID kredensial",
      reference: "Nomor sertifikat",
      authorship: "Posisi penulis",
      status: "Status",
      ongoing: "Masih berjalan",
      noDate: "Tanggal tidak tercantum",
      skills: "Keterampilan",
      verify: "Verifikasi di situs penerbit",
      verifyTitle: "Verifikasi",
      verifyNone: "Penerbit tidak menyediakan halaman verifikasi daring untuk capaian ini.",
      file: "Berkas sertifikat",
      fileOpen: "Buka berkas",
      fileFallback: "Pratinjau tidak dapat ditampilkan di peramban ini.",
      linkedin: "Tambahkan ke LinkedIn",
      linkedinNote: "Membuka formulir LinkedIn yang sudah terisi. Masuk ke akun, periksa isiannya, lalu tekan simpan. LinkedIn tidak mengizinkan penambahan otomatis.",
      linkedinPending: "Bila formulir LinkedIn tidak terisi otomatis, salin teks di bawah lalu tempel ke formulir.",
      copy: "Salin teks siap tempel",
      copyNote: "Menyalin judul, penerbit, tanggal, deskripsi, dan tautan untuk ditempel ke LinkedIn atau CV.",
      copied: "Teks tersalin",
      copyFailed: "Gagal menyalin. Pilih dan salin teks secara manual.",
      shareTitle: "Bagikan ke profil",
      related: "Tautan terkait",
      profiles: "Profil riset",
      paste: { issuer: "Penerbit", date: "Tanggal", credentialId: "ID kredensial", link: "Tautan" },
    },
    teaching: {
      title: "Mengajar",
      intro: "Mata kuliah yang saya ampu di dua kampus. Sebagian materinya terbuka di GitHub untuk siapa saja.",
      materials: "Materi",
      current: "Semester ini",
      past: "Pernah diampu",
      focusTitle: "Bidang keahlian mengajar",
      noneCurrent: "Tidak ada mata kuliah di semester ini.",
    },
    journey: {
      title: "Perjalanan",
      intro: "Dari repositori pertama sampai ruang kelas.",
    },
    contact: {
      marquee: "Mari berkolaborasi",
      title: "Mari bekerja sama",
      intro: "Punya ide riset, butuh sistem, atau mencari narasumber? Pilih topiknya dan kirim pesan.",
      formTitle: "Kirim pesan",
      name: "Nama",
      namePlaceholder: "Nama Anda",
      topic: "Topik",
      otherTopic: "Lainnya",
      message: "Pesan",
      messagePlaceholder: "Ceritakan singkat apa yang ingin dikerjakan bersama.",
      send: "Buka di aplikasi email",
      sendNote: "Tombol ini membuka aplikasi email Anda dengan pesan yang sudah terisi.",
      needMessage: "Tulis pesan terlebih dahulu.",
      emailLabel: "Email",
      copy: "Salin email",
      copied: "Email tersalin",
      channelsTitle: "Atau temukan saya di",
      localTime: "Sekarang pukul {time} di Cirebon",
      subjectPrefix: "Kolaborasi",
      greeting: "Halo Mas Ilyun,",
    },
    footer: {
      built: "Dibuat di Cirebon dengan Next.js, TypeScript, dan Tailwind CSS.",
      top: "Kembali ke atas",
    },
    newTab: "membuka tab baru",
  },
  en: {
    meta: {
      title: "Ahmad Ngiliyun - Informatics Lecturer and Full-stack Developer",
      description:
        "Portfolio of Ahmad Ngiliyun, M.Kom.: informatics lecturer in Cirebon, full-stack developer, and machine learning researcher. Projects, publications, certificates, courses, and collaboration.",
      jobTitle: "Informatics lecturer and full-stack developer",
    },
    nav: {
      about: "About",
      projects: "Projects",
      activity: "Activity",
      research: "Research",
      achievements: "Credentials",
      teaching: "Teaching",
      journey: "Journey",
      contact: "Contact",
      skip: "Skip to content",
      label: "Main navigation",
      switchLabel: "Language",
      menu: "Menu",
      close: "Close",
    },
    hero: {
      statement: "Informatics lecturer building AI, web, and mobile systems.",
      lead: "I teach in Cirebon, research machine learning, and turn classroom ideas into applications people actually use.",
      primary: "See projects",
      secondary: "Work with me",
      localTime: "Time in Cirebon",
      year: "year",
    },
    marqueeLabel: {
      skills: "Technologies I work with",
      topics: "Topics I focus on",
    },
    kmeans: {
      aria: "K-Means visualization: data points colored by their nearest cluster",
      caption:
        "K-Means groups these points into three clusters. Click the plot to add points and watch the cluster centers shift.",
      add: "Add points",
      reset: "Shuffle centers",
      iteration: "Iteration",
      running: "clustering",
      converged: "stable",
      cluster: "Cluster",
      points: "points",
    },
    about: {
      title: "About",
      statement:
        "I believe the best way to teach technology is to keep building it. So my classroom, my research, and my servers feed each other: course material comes from real projects, and real projects become research.",
      facts: [
        { label: "Affiliation", value: "Informatics Study Program, Universitas Insan Mahardika" },
        { label: "Role", value: "Permanent lecturer, Study Program Secretary, and IT staff" },
        { label: "Co-founder", value: "AWATARA Research and Education Solution" },
        { label: "Location", value: "Cirebon, West Java, Indonesia" },
      ],
      areasTitle: "What I work on",
    },
    projects: {
      title: "Projects",
      intro: "Featured projects with open source code, from a computer vision capstone to apps with registered copyrights.",
      code: "Code on GitHub",
      demo: "Try the demo",
      release: "Download release",
      copyright: "Registered copyright",
      recentTitle: "Latest on GitHub",
      recentIntro: "Updated automatically from public repositories every time the site is built.",
      updated: "Updated",
      all: "All repositories",
      sentimentLabels: ["Positive", "Neutral", "Negative"],
      visualCluster: "Illustration of three data clusters and their centers",
      visualSentiment: "Illustration of positive, neutral, and negative sentiment shares",
      visualVision: "Illustration of a banknote recognized by the model, with the probability of each class. Not an actual prediction",
      visionOther: "Not a banknote",
      systemsTitle: "Systems I have built",
      systemsIntro: "Most of them run at universities and partner organizations, so the code lives in private repositories.",
      privateRepo: "Private repository",
    },
    activity: {
      title: "Activity",
      intro: "A year of work on GitHub, plus contributions beyond code.",
      total: "contributions this year",
      activeDays: "active days",
      longestStreak: "day longest streak",
      busiestDay: "contributions on the busiest day",
      days: "days",
      less: "Less",
      more: "More",
      tooltipNone: "No contributions on {date}",
      tooltipOne: "1 contribution on {date}",
      tooltipMany: "{n} contributions on {date}",
      summary: "GitHub contribution graph: {n} contributions in the last year, active on {d} days.",
      updatedAt: "Data fetched {date}",
      publicRepos: "public repositories",
      since: "on GitHub since",
      otherTitle: "Beyond code",
      open: "Open",
      weekdays: ["Mon", "Wed", "Fri"],
    },
    research: {
      title: "Research",
      intro: "Machine learning for classification and prediction, sentiment analysis, data security, and IT governance, plus community service.",
      themesTitle: "Research themes",
      grantTitle: "Research grant",
      publicationsTitle: "Publications",
      profilesTitle: "Research profiles",
      publicationCount: "{n} publications",
      noLink: "Article links are available through the Google Scholar and Garuda profiles.",
    },
    achievements: {
      title: "Credentials and achievements",
      intro: "Highlights from training, certificates, and copyrights. Every certificate can be verified directly with its issuer.",
      filterLabel: "Show",
      certificatesTab: "Certificates and training",
      copyrightsTab: "Copyrights",
      viewAll: "See all ({n})",
      verify: "Verify",
      details: "Details",
      citations: "citations",
      hIndex: "h-index",
      sinta: "SINTA score",
      copyrights: "registered copyrights",
      publications: "publications",
      asOf: "Citations, h-index, and SINTA score as of {date}.",
      allCredentials: "All credentials on",
    },
    archive: {
      metaTitle: "Credentials and Achievements - Ahmad Ngiliyun",
      metaDescription:
        "The full archive of certificates, training, copyrights, books, publications, grants, and memberships of Ahmad Ngiliyun, M.Kom., with official verification links.",
      title: "Credentials and achievements",
      intro: "The full archive. Search by title, issuer, or skill, then filter by category and year.",
      searchLabel: "Search",
      searchPlaceholder: "For example machine learning, Dicoding, or DJKI",
      kindLabel: "Category",
      all: "All",
      yearLabel: "Year",
      allYears: "All years",
      resultsOne: "1 item",
      resultsMany: "{n} items",
      empty: "Nothing matches this search.",
      reset: "Clear filters",
      home: "Home",
      crumbs: "Breadcrumb",
      msLearnTitle: "Microsoft Learn",
      msLearnLine: "{badges} badges, {trophies} trophies, {modules} modules, and {paths} learning paths completed, with {hours} hours {minutes} minutes of learning. Data as of {date}.",
      profilesTitle: "All online credentials",
    },
    detail: {
      back: "Back to the archive",
      issuer: "Issuer",
      issued: "Issued",
      expires: "Valid until",
      credentialId: "Credential ID",
      reference: "Certificate number",
      authorship: "Author position",
      status: "Status",
      ongoing: "Ongoing",
      noDate: "Date not listed",
      skills: "Skills",
      verify: "Verify with the issuer",
      verifyTitle: "Verification",
      verifyNone: "The issuer does not offer an online verification page for this item.",
      file: "Certificate file",
      fileOpen: "Open file",
      fileFallback: "The preview cannot be shown in this browser.",
      linkedin: "Add to LinkedIn",
      linkedinNote: "Opens a prefilled LinkedIn form. Sign in, check the fields, then press save. LinkedIn does not allow adding it automatically.",
      linkedinPending: "If the LinkedIn form does not fill in by itself, copy the text below and paste it into the form.",
      copy: "Copy ready-to-paste text",
      copyNote: "Copies the title, issuer, date, description, and link to paste into LinkedIn or a CV.",
      copied: "Text copied",
      copyFailed: "Copy failed. Select and copy the text manually.",
      shareTitle: "Add to a profile",
      related: "Related links",
      profiles: "Research profiles",
      paste: { issuer: "Issuer", date: "Date", credentialId: "Credential ID", link: "Link" },
    },
    teaching: {
      title: "Teaching",
      intro: "Courses I teach at two universities. Some of the material is open on GitHub for anyone.",
      materials: "Materials",
      current: "This semester",
      past: "Previously taught",
      focusTitle: "Teaching expertise",
      noneCurrent: "No courses this semester.",
    },
    journey: {
      title: "Journey",
      intro: "From the first repository to the classroom.",
    },
    contact: {
      marquee: "Let's work together",
      title: "Let's work together",
      intro: "Have a research idea, need a system built, or looking for a speaker? Pick a topic and send a message.",
      formTitle: "Send a message",
      name: "Name",
      namePlaceholder: "Your name",
      topic: "Topic",
      otherTopic: "Something else",
      message: "Message",
      messagePlaceholder: "Briefly describe what you would like to work on together.",
      send: "Open in email app",
      sendNote: "This button opens your email app with the message filled in.",
      needMessage: "Write a message first.",
      emailLabel: "Email",
      copy: "Copy email",
      copied: "Email copied",
      channelsTitle: "Or find me on",
      localTime: "It is {time} in Cirebon right now",
      subjectPrefix: "Collaboration",
      greeting: "Hello Ahmad,",
    },
    footer: {
      built: "Made in Cirebon with Next.js, TypeScript, and Tailwind CSS.",
      top: "Back to top",
    },
    newTab: "opens in a new tab",
  },
};
