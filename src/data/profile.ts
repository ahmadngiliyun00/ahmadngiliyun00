// Semua konten situs ada di file ini. Ubah teks di sini, bukan di komponen.
// Aturan gaya: tanpa em dash, tanpa simbol ampersand (tulis "dan" atau "and").

export type Lang = "id" | "en";
export type Localized<T> = Record<Lang, T>;

export const site = {
  url: "https://ngiliyun.my.id",
  name: "Ahmad Ngiliyun",
  fullName: "Ahmad Ngiliyun, M.Kom.",
  // Isi setelah email pribadi aktif, contoh: "ahmad@ngiliyun.my.id".
  // Selama kosong, baris email di bagian Kontak tidak ditampilkan.
  email: "",
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

export type ContactItem = { label: string; handle: string; href: string };

export const contacts: ContactItem[] = [
  { label: "GitHub", handle: "ahmadngiliyun00", href: links.github },
  { label: "LinkedIn", handle: "ahmadngiliyun00", href: links.linkedin },
  { label: "ORCID", handle: "0009-0006-2688-722X", href: links.orcid },
  { label: "YouTube", handle: "@ahmadngiliyun00", href: links.youtube },
  { label: "X", handle: "@ahmadngiliyun00", href: links.x },
  { label: "Instagram", handle: "ahmadngiliyun00", href: links.instagram },
  { label: "Facebook", handle: "ahmadngiliyun00", href: links.facebook },
];

export type Project = {
  name: string;
  href: string;
  display: string;
  stack: string;
  description: Localized<string>;
};

// Tambah proyek baru di sini. Urutan array adalah urutan tampil.
export const projects: Project[] = [
  {
    name: "ClusterMind",
    href: "https://github.com/ahmadngiliyun00/ClusterMind",
    display: "github.com/ahmadngiliyun00/ClusterMind",
    stack: "TypeScript",
    description: {
      id: "Aplikasi web interaktif untuk mengelompokkan data dengan K-Means. Memakai normalisasi Z-score dan jarak Euclidean, supaya hasil clustering bisa didapat dengan cepat tanpa menulis kode.",
      en: "An interactive web app for clustering data with K-Means. It uses Z-score normalization and Euclidean distance, so you can get clustering results quickly without writing code.",
    },
  },
  {
    name: "datacraft",
    href: "https://github.com/ahmadngiliyun00/datacraft",
    display: "github.com/ahmadngiliyun00/datacraft",
    stack: "Python",
    description: {
      id: "Aplikasi berbasis web untuk analisis sentimen dengan Naive Bayes dan Support Vector Machine (SVM), lengkap dengan pemrosesan data otomatis.",
      en: "A web-based application for sentiment analysis with Naive Bayes and Support Vector Machine (SVM), including automatic data processing.",
    },
  },
];

// Teknologi yang tampil di pita bergeser di bawah hero.
export const skills: string[] = [
  "Next.js",
  "React",
  "TypeScript",
  "Tailwind CSS",
  "Laravel",
  "Expo",
  "Python",
  "Machine learning",
  "Docker",
  "AlmaLinux",
  "Ubuntu",
  "Moodle",
];

export const courses: Localized<string[]> = {
  id: [
    "Kecerdasan Buatan",
    "Rekayasa Perangkat Lunak",
    "Pemrograman Berorientasi Objek",
    "Keamanan Data",
    "Data Warehouse",
  ],
  en: [
    "Artificial Intelligence",
    "Software Engineering",
    "Object-Oriented Programming",
    "Data Security",
    "Data Warehouse",
  ],
};

export type Copy = {
  meta: { title: string; description: string; jobTitle: string };
  nav: {
    about: string;
    teaching: string;
    projects: string;
    contact: string;
    skip: string;
    label: string;
    switchLabel: string;
  };
  hero: { title: string; lead: string; primary: string; secondary: string };
  skillsLabel: string;
  kmeans: {
    aria: string;
    caption: string;
    add: string;
    reset: string;
    iteration: string;
    running: string;
    converged: string;
  };
  about: {
    title: string;
    body: string;
    facts: { label: string; value: string }[];
  };
  teaching: { title: string; intro: string };
  projects: {
    title: string;
    intro: string;
    more: string;
    moreLink: string;
  };
  contact: { title: string; intro: string; emailLabel: string };
  footer: { built: string };
  newTab: string;
};

export const copy: Localized<Copy> = {
  id: {
    meta: {
      title: "Ahmad Ngiliyun - Dosen Informatika dan Pengembang Full-stack",
      description:
        "Portofolio Ahmad Ngiliyun, M.Kom.: dosen informatika di Cirebon, pengembang full-stack, dan peminat machine learning.",
      jobTitle: "Dosen informatika dan pengembang full-stack",
    },
    nav: {
      about: "Tentang",
      teaching: "Mengajar",
      projects: "Proyek",
      contact: "Kontak",
      skip: "Lompat ke konten",
      label: "Navigasi utama",
      switchLabel: "Bahasa",
    },
    hero: {
      title: "Dosen informatika yang membangun sistem AI dan web.",
      lead: "Saya Ahmad Ngiliyun, M.Kom. Saya mengajar di Cirebon, mengembangkan aplikasi web dan seluler, dan mendalami machine learning.",
      primary: "Lihat proyek",
      secondary: "Profil GitHub",
    },
    skillsLabel: "Teknologi yang saya gunakan",
    kmeans: {
      aria: "Visualisasi K-Means: titik data diwarnai sesuai kluster terdekatnya",
      caption:
        "Titik-titik data ini dikelompokkan algoritma K-Means menjadi tiga kluster. Klik di area ini untuk menambah titik, lalu lihat pusat kluster bergeser.",
      add: "Tambah titik",
      reset: "Acak ulang pusat",
      iteration: "Iterasi",
      running: "mengelompokkan",
      converged: "stabil",
    },
    about: {
      title: "Tentang",
      body: "Saya dosen di Program Studi Informatika, Universitas Insan Mahardika, Cirebon. Di luar kelas saya membangun aplikasi web dan seluler, menjalankan eksperimen machine learning, dan mengelola server tempat semuanya berjalan.",
      facts: [
        {
          label: "Afiliasi",
          value: "Program Studi Informatika, Universitas Insan Mahardika",
        },
        {
          label: "Bidang",
          value: "Machine learning, rekayasa perangkat lunak, pengembangan full-stack",
        },
        {
          label: "Pendiri bersama",
          value: "AWATARA Research and Education Solution",
        },
        { label: "Lokasi", value: "Cirebon, Indonesia" },
      ],
    },
    teaching: {
      title: "Mengajar",
      intro: "Mata kuliah yang saya ampu antara lain:",
    },
    projects: {
      title: "Proyek",
      intro: "Beberapa proyek terbuka yang kodenya bisa dibaca.",
      more: "Proyek lain akan ditambahkan di sini. Sementara itu, semua repositori ada di GitHub.",
      moreLink: "Buka GitHub",
    },
    contact: {
      title: "Kontak",
      intro: "Temukan saya di platform berikut.",
      emailLabel: "Email",
    },
    footer: { built: "Dibangun dengan Next.js, TypeScript, dan Tailwind CSS." },
    newTab: "membuka tab baru",
  },
  en: {
    meta: {
      title: "Ahmad Ngiliyun - Informatics Lecturer and Full-stack Developer",
      description:
        "Portfolio of Ahmad Ngiliyun, M.Kom.: informatics lecturer in Cirebon, full-stack developer, and machine learning enthusiast.",
      jobTitle: "Informatics lecturer and full-stack developer",
    },
    nav: {
      about: "About",
      teaching: "Teaching",
      projects: "Projects",
      contact: "Contact",
      skip: "Skip to content",
      label: "Main navigation",
      switchLabel: "Language",
    },
    hero: {
      title: "Informatics lecturer building AI and web systems.",
      lead: "I'm Ahmad Ngiliyun, M.Kom. I teach in Cirebon, build web and mobile applications, and dig into machine learning.",
      primary: "See projects",
      secondary: "GitHub profile",
    },
    skillsLabel: "Technologies I work with",
    kmeans: {
      aria: "K-Means visualization: data points colored by their nearest cluster",
      caption:
        "The K-Means algorithm groups these data points into three clusters. Click this area to add points and watch the cluster centers shift.",
      add: "Add points",
      reset: "Shuffle centers",
      iteration: "Iteration",
      running: "clustering",
      converged: "stable",
    },
    about: {
      title: "About",
      body: "I'm a lecturer in the Informatics Study Program at Universitas Insan Mahardika in Cirebon. Outside the classroom I build web and mobile applications, run machine learning experiments, and manage the servers they run on.",
      facts: [
        {
          label: "Affiliation",
          value: "Informatics Study Program, Universitas Insan Mahardika",
        },
        {
          label: "Focus",
          value: "Machine learning, software engineering, full-stack development",
        },
        {
          label: "Co-founder",
          value: "AWATARA Research and Education Solution",
        },
        { label: "Location", value: "Cirebon, Indonesia" },
      ],
    },
    teaching: {
      title: "Teaching",
      intro: "Courses I teach include:",
    },
    projects: {
      title: "Projects",
      intro: "A few open projects whose code you can read.",
      more: "More projects will be added here. In the meantime, every repository is on GitHub.",
      moreLink: "Open GitHub",
    },
    contact: {
      title: "Contact",
      intro: "Find me on these platforms.",
      emailLabel: "Email",
    },
    footer: { built: "Built with Next.js, TypeScript, and Tailwind CSS." },
    newTab: "opens in a new tab",
  },
};
