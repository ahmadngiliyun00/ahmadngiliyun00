// Identitas situs, konfigurasi kecil, dan teks antarmuka (label tombol, judul bagian) ID dan EN.
// KONTEN (profil, proyek, capaian, mengajar, garis waktu) disimpan di database dan diubah lewat CMS /admin.
// Data awalnya ada di folder seed/.
// Aturan gaya: tanpa em dash, tanpa simbol ampersand (tulis "dan" atau "and").
// Berkas ini hanya boleh memuat "import type", karena juga dibaca skrip Node.

import type { Lang, Localized } from "@/content/types";

export type { Lang, Localized };

export const site = {
  url: "https://ngiliyun.my.id",
  name: "Ahmad Ngiliyun",
  fullName: "Ahmad Ngiliyun, M.Kom.",
  timeZone: "Asia/Jakarta",
  timeZoneLabel: "WIB",
  city: "Cirebon",
};

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

export type CommentLabels = {
  title: string;
  count: string;
  countOne: string;
  empty: string;
  formTitle: string;
  name: string;
  namePlaceholder: string;
  email: string;
  emailPlaceholder: string;
  emailNote: string;
  body: string;
  bodyPlaceholder: string;
  send: string;
  sending: string;
  moderation: string;
  sent: string;
  replyBy: string;
  errors: {
    nameRequired: string;
    emailRequired: string;
    emailInvalid: string;
    bodyRequired: string;
    bodyTooShort: string;
    tooLong: string;
    tooManyLinks: string;
    tooMany: string;
    closed: string;
    failed: string;
  };
};

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
    next: string;
    news: string;
    contact: string;
    skip: string;
    label: string;
    switchLabel: string;
    menu: string;
    close: string;
  };
  hero: {
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
  next: {
    title: string;
    intro: string;
    roadmapTitle: string;
    current: string;
    principlesTitle: string;
    learningTitle: string;
  };
  news: {
    title: string;
    intro: string;
    all: string;
    readOn: string;
    read: string;
    sourceLang: Record<Lang, string>;
    metaTitle: string;
    metaDescription: string;
    archiveIntro: string;
    empty: string;
    back: string;
    published: string;
    source: string;
    original: string;
    readingTime: string;
    views: string;
    viewsOne: string;
    share: { title: string; copy: string; copied: string; copyFailed: string; native: string };
    comments: CommentLabels;
  };
  contact: {
    marquee: string;
    title: string;
    intro: string;
    formTitle: string;
    name: string;
    namePlaceholder: string;
    emailField: string;
    emailPlaceholder: string;
    topic: string;
    otherTopic: string;
    message: string;
    messagePlaceholder: string;
    send: string;
    sending: string;
    sendNote: string;
    emailLabel: string;
    copy: string;
    copied: string;
    channelsTitle: string;
    localTime: string;
    sentTitle: string;
    sentBody: string;
    sendAnother: string;
    errors: {
      nameRequired: string;
      emailRequired: string;
      emailInvalid: string;
      topicRequired: string;
      bodyRequired: string;
      bodyTooShort: string;
      tooLong: string;
      tooManyLinks: string;
      captcha: string;
      tooMany: string;
      failed: string;
    };
  };
  footer: { built: string; jobTitle: string; top: string };
  newTab: string;
};

export const copy: Localized<Copy> = {
  id: {
    meta: {
      title: "Ahmad Ngiliyun - AI Engineer, Dosen Informatika, dan Pengembang Full-stack",
      description:
        "Portofolio Ahmad Ngiliyun, M.Kom.: AI engineer, dosen informatika di Cirebon, pengembang full-stack, dan peneliti machine learning. Proyek, publikasi, sertifikat, mata kuliah, dan kontak kolaborasi.",
      jobTitle: "AI Engineer dan dosen informatika",
    },
    nav: {
      about: "Tentang",
      projects: "Proyek",
      activity: "Kontribusi",
      research: "Riset",
      achievements: "Capaian",
      teaching: "Mengajar",
      journey: "Perjalanan",
      next: "Ke depan",
      news: "Kabar",
      contact: "Kontak",
      skip: "Lompat ke konten",
      label: "Navigasi utama",
      switchLabel: "Bahasa",
      menu: "Menu",
      close: "Tutup",
    },
    hero: {
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
    next: {
      title: "Arah ke depan",
      intro:
        "Saya sedang berpindah dari pengembang web menjadi AI engineer, tanpa meninggalkan ruang kelas. Ini rencana lima tahun saya, cara saya bekerja dengan AI, dan hal yang sedang saya dalami.",
      roadmapTitle: "Rencana 2026 sampai 2030",
      current: "Sedang berjalan",
      principlesTitle: "Cara saya bekerja dengan AI",
      learningTitle: "Sedang saya dalami",
    },
    news: {
      title: "Kabar dan liputan",
      intro: "Liputan media tentang kerja saya, tulisan saya sendiri, dan kabar terbaru.",
      all: "Lihat semua kabar",
      readOn: "Baca di {outlet}",
      read: "Baca selengkapnya",
      sourceLang: { id: "Dalam bahasa Indonesia", en: "Dalam bahasa Inggris" },
      metaTitle: "Kabar dan Liputan - Ahmad Ngiliyun",
      metaDescription:
        "Liputan media tentang Ahmad Ngiliyun, M.Kom., tulisan tentang AI, pendidikan, dan pengembangan perangkat lunak, serta kabar terbaru.",
      archiveIntro: "Semua liputan media, tulisan, dan kabar, terbaru di atas. Liputan media menaut ke sumber aslinya.",
      empty: "Belum ada kabar.",
      back: "Semua kabar",
      published: "Terbit",
      source: "Sumber",
      original: "Baca versi asli di {outlet}",
      readingTime: "{n} menit baca",
      views: "Dibaca {n} kali",
      viewsOne: "Dibaca 1 kali",
      share: {
        title: "Bagikan tulisan ini",
        copy: "Salin tautan",
        copied: "Tautan disalin",
        copyFailed: "Tautan gagal disalin. Salin dari bilah alamat.",
        native: "Bagikan lewat aplikasi lain",
      },
      comments: {
        title: "Komentar",
        count: "{n} komentar",
        countOne: "1 komentar",
        empty: "Belum ada komentar. Jadilah yang pertama.",
        formTitle: "Tulis komentar",
        name: "Nama",
        namePlaceholder: "Nama Anda",
        email: "Email",
        emailPlaceholder: "nama@contoh.id",
        emailNote: "Tidak ditampilkan. Hanya dipakai bila saya perlu membalas lewat email.",
        body: "Komentar",
        bodyPlaceholder: "Tulis tanggapan, pertanyaan, atau masukan",
        send: "Kirim komentar",
        sending: "Mengirim...",
        moderation: "Komentar ditinjau dulu sebelum tampil.",
        sent: "Terima kasih. Komentar Anda akan tampil setelah disetujui.",
        replyBy: "Balasan {name}",
        errors: {
          nameRequired: "Tulis nama Anda.",
          emailRequired: "Tulis email Anda.",
          emailInvalid: "Format email belum benar, misalnya nama@contoh.id.",
          bodyRequired: "Tulis komentar Anda.",
          bodyTooShort: "Komentar terlalu pendek.",
          tooLong: "Isian terlalu panjang.",
          tooManyLinks: "Terlalu banyak tautan. Maksimal dua.",
          tooMany: "Terlalu banyak komentar dalam waktu singkat. Coba lagi beberapa menit lagi.",
          closed: "Komentar untuk tulisan ini sudah ditutup.",
          failed: "Komentar gagal dikirim. Coba lagi sebentar lagi.",
        },
      },
    },
    contact: {
      marquee: "Mari berkolaborasi",
      title: "Mari bekerja sama",
      intro: "Punya ide riset, butuh sistem, atau mencari narasumber? Pilih topiknya dan kirim pesan.",
      formTitle: "Kirim pesan",
      name: "Nama",
      namePlaceholder: "Nama Anda",
      emailField: "Email Anda",
      emailPlaceholder: "nama@contoh.com",
      topic: "Topik",
      otherTopic: "Lainnya",
      message: "Pesan",
      messagePlaceholder: "Ceritakan singkat apa yang ingin dikerjakan bersama.",
      send: "Kirim pesan",
      sending: "Mengirim...",
      sendNote: "Pesan masuk langsung ke kotak masuk saya. Balasan saya kirim ke email Anda.",
      emailLabel: "Email",
      copy: "Salin email",
      copied: "Email tersalin",
      channelsTitle: "Atau temukan saya di",
      localTime: "Sekarang pukul {time} di Cirebon",
      sentTitle: "Pesan terkirim",
      sentBody: "Terima kasih, {name}. Pesan Anda sudah saya terima dan akan saya balas ke {email}.",
      sendAnother: "Kirim pesan lain",
      errors: {
        nameRequired: "Tulis nama Anda.",
        emailRequired: "Tulis email Anda supaya saya bisa membalas.",
        emailInvalid: "Format email belum benar, contoh: nama@contoh.com.",
        topicRequired: "Pilih salah satu topik.",
        bodyRequired: "Tulis pesan terlebih dahulu.",
        bodyTooShort: "Pesan terlalu singkat, minimal 10 karakter.",
        tooLong: "Isian ini terlalu panjang.",
        tooManyLinks: "Pesan berisi terlalu banyak tautan. Kurangi menjadi paling banyak tiga.",
        captcha: "Verifikasi keamanan belum selesai. Tunggu sebentar lalu coba lagi.",
        tooMany: "Terlalu banyak pesan dari jaringan Anda. Coba lagi sekitar satu jam lagi.",
        failed: "Pesan gagal dikirim. Coba lagi, atau salin email di atas dan kirim langsung.",
      },
    },
    footer: {
      built: "Dibuat di Cirebon dengan Next.js, TypeScript, dan Tailwind CSS.",
      jobTitle: "AI Engineer, dosen informatika, pengembang full-stack, dan spesialis IT support",
      top: "Kembali ke atas",
    },
    newTab: "membuka tab baru",
  },
  en: {
    meta: {
      title: "Ahmad Ngiliyun - AI Engineer, Informatics Lecturer, and Full-stack Developer",
      description:
        "Portfolio of Ahmad Ngiliyun, M.Kom.: AI engineer, informatics lecturer in Cirebon, full-stack developer, and machine learning researcher. Projects, publications, certificates, courses, and collaboration.",
      jobTitle: "AI engineer and informatics lecturer",
    },
    nav: {
      about: "About",
      projects: "Projects",
      activity: "Activity",
      research: "Research",
      achievements: "Credentials",
      teaching: "Teaching",
      journey: "Journey",
      next: "Next",
      news: "News",
      contact: "Contact",
      skip: "Skip to content",
      label: "Main navigation",
      switchLabel: "Language",
      menu: "Menu",
      close: "Close",
    },
    hero: {
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
    next: {
      title: "What comes next",
      intro:
        "I am moving from web developer to AI engineer without leaving the classroom. Here is my five-year plan, how I work with AI, and what I am studying right now.",
      roadmapTitle: "Plan for 2026 to 2030",
      current: "In progress",
      principlesTitle: "How I work with AI",
      learningTitle: "Currently studying",
    },
    news: {
      title: "News and press",
      intro: "Press coverage of my work, my own writing, and recent updates.",
      all: "See all news",
      readOn: "Read on {outlet}",
      read: "Read more",
      sourceLang: { id: "In Indonesian", en: "In English" },
      metaTitle: "News and Press - Ahmad Ngiliyun",
      metaDescription:
        "Press coverage of Ahmad Ngiliyun, M.Kom., writing on AI, education, and software development, and recent updates.",
      archiveIntro: "All press coverage, writing, and updates, newest first. Press coverage links to the original source.",
      empty: "No news yet.",
      back: "All news",
      published: "Published",
      source: "Source",
      original: "Read the original on {outlet}",
      readingTime: "{n} min read",
      views: "{n} reads",
      viewsOne: "1 read",
      share: {
        title: "Share this post",
        copy: "Copy link",
        copied: "Link copied",
        copyFailed: "Could not copy the link. Copy it from the address bar.",
        native: "Share with another app",
      },
      comments: {
        title: "Comments",
        count: "{n} comments",
        countOne: "1 comment",
        empty: "No comments yet. Be the first.",
        formTitle: "Leave a comment",
        name: "Name",
        namePlaceholder: "Your name",
        email: "Email",
        emailPlaceholder: "name@example.com",
        emailNote: "Not published. Only used if I need to reply by email.",
        body: "Comment",
        bodyPlaceholder: "Share a response, question, or suggestion",
        send: "Post comment",
        sending: "Sending...",
        moderation: "Comments are reviewed before they appear.",
        sent: "Thank you. Your comment will appear once it is approved.",
        replyBy: "Reply from {name}",
        errors: {
          nameRequired: "Please enter your name.",
          emailRequired: "Please enter your email.",
          emailInvalid: "That email does not look right, for example name@example.com.",
          bodyRequired: "Please write a comment.",
          bodyTooShort: "That comment is too short.",
          tooLong: "That is too long.",
          tooManyLinks: "Too many links. Two at most.",
          tooMany: "Too many comments in a short time. Try again in a few minutes.",
          closed: "Comments are closed for this post.",
          failed: "Your comment could not be sent. Please try again shortly.",
        },
      },
    },
    contact: {
      marquee: "Let's work together",
      title: "Let's work together",
      intro: "Have a research idea, need a system built, or looking for a speaker? Pick a topic and send a message.",
      formTitle: "Send a message",
      name: "Name",
      namePlaceholder: "Your name",
      emailField: "Your email",
      emailPlaceholder: "name@example.com",
      topic: "Topic",
      otherTopic: "Something else",
      message: "Message",
      messagePlaceholder: "Briefly describe what you would like to work on together.",
      send: "Send message",
      sending: "Sending...",
      sendNote: "Your message goes straight to my inbox. I will reply to your email.",
      emailLabel: "Email",
      copy: "Copy email",
      copied: "Email copied",
      channelsTitle: "Or find me on",
      localTime: "It is {time} in Cirebon right now",
      sentTitle: "Message sent",
      sentBody: "Thank you, {name}. I have received your message and will reply to {email}.",
      sendAnother: "Send another message",
      errors: {
        nameRequired: "Please enter your name.",
        emailRequired: "Please enter your email so I can reply.",
        emailInvalid: "That email does not look right, for example: name@example.com.",
        topicRequired: "Please choose a topic.",
        bodyRequired: "Please write a message first.",
        bodyTooShort: "The message is too short, at least 10 characters.",
        tooLong: "This field is too long.",
        tooManyLinks: "The message contains too many links. Please keep it to three at most.",
        captcha: "The security check has not finished yet. Wait a moment and try again.",
        tooMany: "Too many messages from your network. Please try again in about an hour.",
        failed: "The message could not be sent. Try again, or copy the email above and write directly.",
      },
    },
    footer: {
      built: "Made in Cirebon with Next.js, TypeScript, and Tailwind CSS.",
      jobTitle: "AI engineer, informatics lecturer, full-stack developer, and IT support specialist",
      top: "Back to top",
    },
    newTab: "opens in a new tab",
  },
};
