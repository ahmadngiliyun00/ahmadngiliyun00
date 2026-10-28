// Data awal (seed) konten profil, proyek, mengajar, dan garis waktu.
// Dipakai sekali oleh "npm run db:seed". Setelah database terisi, ubah lewat CMS di /admin.
// Berkas ini hanya boleh memuat "import type" karena dibaca skrip Node.

import type {
  Area,
  Channel,
  Collab,
  Contribution,
  Course,
  FeaturedProject,
  Institution,
  Localized,
  Milestone,
  ProfileSettings,
  SystemProject,
  TeachingFocus,
  Visibility,
} from "../src/content/types";

const links = {
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

export const profile: ProfileSettings = {
  status: {
  id: "Sedang mengajar semester ganjil 2026/2027",
  en: "Teaching the odd semester of 2026/2027",
},
  heroStatement: { id: "Dosen informatika yang membangun sistem AI, web, dan seluler.", en: "Informatics lecturer building AI, web, and mobile systems." },
  heroLead: { id: "Saya mengajar di Cirebon, meneliti machine learning, dan mengubah ide di ruang kelas menjadi aplikasi yang benar-benar dipakai.", en: "I teach in Cirebon, research machine learning, and turn classroom ideas into applications people actually use." },
  aboutStatement: { id: "Saya percaya cara terbaik mengajar teknologi adalah dengan ikut membangunnya. Karena itu ruang kelas, riset, dan server saya saling terhubung: materi kuliah lahir dari proyek nyata, dan proyek nyata menjadi bahan riset.", en: "I believe the best way to teach technology is to keep building it. So my classroom, my research, and my servers feed each other: course material comes from real projects, and real projects become research." },
  facts: { id: [
        { label: "Afiliasi", value: "Program Studi Informatika, Universitas Insan Mahardika" },
        { label: "Peran", value: "Dosen tetap, Sekretaris Program Studi, dan staf IT" },
        { label: "Pendiri bersama", value: "AWATARA Research and Education Solution" },
        { label: "Lokasi", value: "Cirebon, Jawa Barat" },
      ], en: [
        { label: "Affiliation", value: "Informatics Study Program, Universitas Insan Mahardika" },
        { label: "Role", value: "Permanent lecturer, Study Program Secretary, and IT staff" },
        { label: "Co-founder", value: "AWATARA Research and Education Solution" },
        { label: "Location", value: "Cirebon, West Java, Indonesia" },
      ] },
  email: { user: "ahmadngiliyun", domain: "gmail.com" },
  skills: [
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
],
  topics: {
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
},
  researchThemes: {
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
},
  researchProfiles: [
  { label: "Google Scholar", href: links.scholar },
  { label: "SINTA", href: links.sinta },
  { label: "Garuda", href: links.garuda },
  { label: "ORCID", href: links.orcid },
  { label: "ResearchGate", href: links.researchgate },
],
  credentialProfiles: [
  { label: "Credly", href: links.credly },
  { label: "Microsoft Learn", href: links.msLearn },
],
  sameAs: Object.values(links),
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

export interface SeedSystem extends SystemProject {
  visibility: Visibility;
}

export const systems: SeedSystem[] = [
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
    visibility: "private",
  },
];

export const currentTerm = "26271";

export const terms: Record<string, Localized<string>> = {
  "26271": { id: "Ganjil 2026/2027", en: "Odd semester 2026/2027" },
  "25262": { id: "2025/2026", en: "2025/2026" },
  "25261": { id: "2025/2026", en: "2025/2026" },
  "24252": { id: "2024/2025", en: "2024/2025" },
  "24251": { id: "2024/2025", en: "2024/2025" },
  "23241": { id: "2023/2024", en: "2023/2024" },
};

export interface SeedInstitution extends Institution {
  slug: string;
  courses: Omit<Course, "institution">[];
}

export const teaching: SeedInstitution[] = [
  {
    slug: "uim",
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
    slug: "unu-cirebon",
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
