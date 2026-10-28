// Semua konten situs ada di file ini. Ubah teks di sini, bukan di komponen.
// Aturan gaya: tanpa em dash, tanpa simbol ampersand (tulis "dan" atau "and").
// Data GitHub (kontribusi dan repositori) ada di github.json, diperbarui otomatis saat build.

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
  youtube: "https://www.youtube.com/@ahmadngiliyun00",
  x: "https://x.com/ahmadngiliyun00",
  instagram: "https://www.instagram.com/ahmadngiliyun00/",
  facebook: "https://www.facebook.com/ahmadngiliyun00",
};

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
      id: "Mengampu mata kuliah inti informatika, menyusun RPS berbasis OBE, dan membagikan materi praktikum secara terbuka di GitHub.",
      en: "Teaching core informatics courses, designing outcome-based syllabi, and publishing lab materials openly on GitHub.",
    },
    tools: ["Moodle", "GitHub", "Python"],
  },
  {
    icon: "ai",
    title: { id: "Riset AI dan machine learning", en: "AI and machine learning research" },
    body: {
      id: "Klasifikasi, clustering, analisis sentimen, dan integrasi AI agent ke dalam aplikasi yang dipakai sehari-hari.",
      en: "Classification, clustering, sentiment analysis, and bringing AI agents into applications people use every day.",
    },
    tools: ["Python", "Jupyter", "Naive Bayes", "SVM", "K-Means"],
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
  visual: "cluster" | "sentiment";
  copyright: boolean;
  tags: Localized<string[]>;
  summary: Localized<string>;
};

// Proyek unggulan. Urutan array adalah urutan tampil. Tambah proyek baru di sini.
export const featured: FeaturedProject[] = [
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
  ],
};

export type Course = { name: Localized<string>; repo?: string };
export type Institution = {
  name: string;
  role: Localized<string>;
  courses: Course[];
};

export const teaching: Institution[] = [
  {
    name: "Universitas Insan Mahardika",
    role: {
      id: "Dosen tetap, Program Studi Informatika",
      en: "Permanent lecturer, Informatics Study Program",
    },
    courses: [
      { name: { id: "Kecerdasan Buatan", en: "Artificial Intelligence" } },
      {
        name: { id: "Algoritma Pemrograman", en: "Algorithms and Programming" },
        repo: "https://github.com/Institut-Mahardika/mk-algorpo-2526",
      },
      {
        name: { id: "Pemrograman Berorientasi Objek", en: "Object-Oriented Programming" },
        repo: "https://github.com/Institut-Mahardika/mk-pbo-2526",
      },
      { name: { id: "Rekayasa Perangkat Lunak", en: "Software Engineering" } },
      { name: { id: "Keamanan Data", en: "Data Security" } },
      { name: { id: "Data Warehouse", en: "Data Warehousing" } },
    ],
  },
  {
    name: "Universitas Nahdlatul Ulama Cirebon",
    role: { id: "Dosen, Fakultas Ilmu Komputer", en: "Lecturer, Faculty of Computer Science" },
    courses: [
      { name: { id: "Interaksi Manusia dan Komputer", en: "Human-Computer Interaction" } },
      {
        name: { id: "Manajemen Proyek Sistem Informasi", en: "Information Systems Project Management" },
      },
    ],
  },
];

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
      id: "Repositori pertama, termasuk aplikasi pemilihan BEM, tersimpan sejak masa ini.",
      en: "First repositories, including a student election app, date from this period.",
    },
  },
  {
    when: { id: "2020", en: "2020" },
    title: { id: "Belajar terstruktur di Dicoding", en: "Structured learning at Dicoding" },
    body: {
      id: "Mulai mengikuti kelas pemrograman Dicoding, dari dasar web sampai machine learning.",
      en: "Began Dicoding's programming classes, from web fundamentals to machine learning.",
    },
  },
  {
    when: { id: "2023", en: "2023" },
    title: { id: "Bergabung dengan Institut Mahardika", en: "Joined Institut Mahardika" },
    body: {
      id: "Dipercaya menjadi staf IT kampus, dan lulus IDCamp 2023 jalur Back-End Developer JavaScript.",
      en: "Trusted as campus IT staff, and completed IDCamp 2023 on the JavaScript Back-End Developer track.",
    },
  },
  {
    when: { id: "April 2025", en: "April 2025" },
    title: { id: "Lulus Magister Komputer", en: "Earned a Master of Computer Science" },
    body: {
      id: "Menyelesaikan studi magister dan meraih gelar M.Kom.",
      en: "Completed graduate studies with the M.Kom. degree.",
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
    when: { id: "Sekarang", en: "Now" },
    title: { id: "Mengajar, mengelola, dan membangun", en: "Teaching, leading, and building" },
    body: {
      id: "Sekretaris Program Studi Informatika, co-founder AWATARA Research and Education Solution, dan dosen di FILKOM UNU Cirebon.",
      en: "Secretary of the Informatics Study Program, co-founder of AWATARA Research and Education Solution, and lecturer at FILKOM UNU Cirebon.",
    },
    current: true,
  },
];

export type Contribution = {
  title: Localized<string>;
  body: Localized<string>;
  href?: string;
};

// Kontribusi di luar kode, tampil di bawah grafik GitHub.
export const contributions: Contribution[] = [
  {
    title: { id: "Hak cipta perangkat lunak", en: "Registered software copyrights" },
    body: {
      id: "HKI terdaftar untuk DataCraft, ClusterMind, SARPRAS, dan perangkat lunak lain.",
      en: "Registered copyrights (HKI) for DataCraft, ClusterMind, SARPRAS, and other software.",
    },
  },
  {
    title: { id: "Reviewer jurnal", en: "Journal reviewer" },
    body: {
      id: "Menelaah naskah untuk jurnal terbitan Awatara Publisher.",
      en: "Reviewing manuscripts for journals published by Awatara Publisher.",
    },
  },
  {
    title: { id: "Publikasi ilmiah", en: "Research publications" },
    body: {
      id: "Daftar publikasi dan rekam jejak riset tercatat di ORCID.",
      en: "Publications and research activity are recorded on ORCID.",
    },
    href: links.orcid,
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
  teaching: { title: string; intro: string; materials: string };
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
        "Portofolio Ahmad Ngiliyun, M.Kom.: dosen informatika di Cirebon, pengembang full-stack, dan peneliti machine learning. Proyek, kontribusi, mata kuliah, dan kontak kolaborasi.",
      jobTitle: "Dosen informatika dan pengembang full-stack",
    },
    nav: {
      about: "Tentang",
      projects: "Proyek",
      activity: "Kontribusi",
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
        { label: "Peran", value: "Dosen tetap dan Sekretaris Program Studi" },
        { label: "Pendiri bersama", value: "AWATARA Research and Education Solution" },
        { label: "Lokasi", value: "Cirebon, Jawa Barat" },
      ],
      areasTitle: "Yang saya kerjakan",
    },
    projects: {
      title: "Proyek",
      intro: "Proyek unggulan yang kodenya terbuka dan hak ciptanya terdaftar.",
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
    teaching: {
      title: "Mengajar",
      intro: "Mata kuliah yang saya ampu. Sebagian materinya terbuka di GitHub untuk siapa saja.",
      materials: "Materi",
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
        "Portfolio of Ahmad Ngiliyun, M.Kom.: informatics lecturer in Cirebon, full-stack developer, and machine learning researcher. Projects, contributions, courses, and collaboration.",
      jobTitle: "Informatics lecturer and full-stack developer",
    },
    nav: {
      about: "About",
      projects: "Projects",
      activity: "Activity",
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
        { label: "Role", value: "Permanent lecturer and Study Program Secretary" },
        { label: "Co-founder", value: "AWATARA Research and Education Solution" },
        { label: "Location", value: "Cirebon, West Java, Indonesia" },
      ],
      areasTitle: "What I work on",
    },
    projects: {
      title: "Projects",
      intro: "Featured projects with open source code and registered copyrights.",
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
    teaching: {
      title: "Teaching",
      intro: "Courses I teach. Some of the material is open on GitHub for anyone.",
      materials: "Materials",
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
