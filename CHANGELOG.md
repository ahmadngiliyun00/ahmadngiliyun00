# Catatan perubahan

Semua perubahan penting pada proyek ini dicatat di berkas ini. Format mengikuti
[Keep a Changelog](https://keepachangelog.com/id-ID/1.1.0/) dan penomoran versi mengikuti
[Semantic Versioning](https://semver.org/lang/id/).

## [Belum dirilis]

### Ditambahkan

- CMS di `/admin` untuk semua konten situs: capaian, proyek, mengajar, perjalanan, profil, dan metrik, dengan status public atau privat
- Database MySQL (Drizzle ORM) dengan migrasi, seed dari data lama, dan pembuat akun admin
- Login email dan kata sandi (scrypt) atau GitHub OAuth, sesi di database, pembatas percobaan login
- Unggah berkas sertifikat yang disimpan di luar repo dan disajikan dengan pemeriksaan izin
- Tautan berbagi rahasia `/s/<token>/` untuk membagikan data, termasuk yang privat, tanpa diindeks
- Panduan deploy VPS aaPanel di `docs/DEPLOY.md`
- Form kontak yang mengirim ke server: pesan tersimpan di kotak masuk CMS `/admin/pesan/` dan diteruskan ke email lewat SMTP dengan Reply-To pengunjung. Perlindungan spam: kolom jebakan, jebakan waktu, batas tautan, batas per IP, dan Cloudflare Turnstile opsional
- Logo "A di dalam N", wordmark "ngiliyun", dan footer dengan wordmark bergaris tepi yang terisi gradasi di sekitar kursor
- Pengaturan CMS "Search Console dan Analytics": meta verifikasi Google Search Console dan Bing, berkas verifikasi HTML Google, dan Google Analytics 4 yang tidak dipasang di CMS maupun tautan berbagi serta tidak menghitung kunjungan admin
- Sitemap memakai tanggal ubah data yang sebenarnya, bukan waktu permintaan
- Bagian "Arah ke depan" di beranda: rencana 2026 sampai 2030, prinsip kerja dengan AI, dan daftar yang sedang didalami, semuanya dikelola lewat CMS
- CMS: sidebar yang bisa dilipat dengan ikon, formulir grid 12 kolom (isian pendek berbagi baris), placeholder di semua isian, tanda * merah untuk isian wajib, pembagian halaman 10, 25, 50, atau 100 data, dan pencarian yang langsung memperbarui daftar
- Pengaturan "Email dan SMTP" di CMS dengan tombol kirim email uji, menggantikan variabel SMTP di berkas environment

- Bagian "Sertifikat dan capaian" di beranda: baris indikator bertanggal (sitasi, h-index, skor SINTA, hak cipta, publikasi) dan sorotan dengan saringan sertifikat atau hak cipta
- Arsip `/sertifikat/` dan `/en/certificates/` dengan pencarian, saringan kategori dan tahun, serta saringan yang tersimpan di URL
- Halaman detail per capaian dengan tautan verifikasi resmi, tombol "Tambahkan ke LinkedIn", teks siap tempel, metadata, Open Graph, dan JSON-LD
- Bagian "Riset": tema, hibah Penelitian Dosen Pemula NetA, publikasi per tahun dengan posisi penulis, dan profil riset
- RupiahVision sebagai proyek unggulan dan daftar "Sistem yang saya kembangkan" untuk repositori privat
- Unit test pembangun URL LinkedIn (`npm test`)
- Bagian README (proyek, capaian, mengajar, perjalanan) dibangkitkan otomatis dari konten public di database

### Diubah

- Situs kini berjalan sebagai server Node.js dan membaca konten dari database, bukan build statis

- Mengajar dipisah per kampus dengan "Semester ini" dan "Pernah diampu", ditambah bidang keahlian mengajar
- Garis waktu dikoreksi: jalur S1 (STIKOM Poltek Cirebon lalu UNU Cirebon), S2 STMIK LIKMI Bandung, AWATARA Februari 2022, dan Dicoding 2020 sebagai "bergabung"
- Klaim kelulusan IDCamp 2023 dihapus
- Peran di bagian Tentang kini mencakup staf IT

## [1.0.0] - 2026-10-28

Rilis pertama situs portofolio [ngiliyun.my.id](https://ngiliyun.my.id) beserta README profil GitHub.

### Situs

- Dua bahasa lewat dua route: `/` (Indonesia) dan `/en/` (Inggris), dengan `robots.txt` dan `sitemap.xml`
- Build statis (`output: "export"`) yang bisa di-deploy ke Vercel, Cloudflare Pages, atau VPS
- Hero dengan nama besar dua warna, urutan masuk huruf nama, status semester, dan jam langsung
- Plot K-Means interaktif di hero
- Proyek unggulan dengan ilustrasi SVG, dan daftar repo terbaru yang diambil otomatis dari GitHub
- Heatmap kontribusi GitHub dengan tooltip dan animasi bergelombang
- Statistik dengan angka yang menghitung naik
- Garis waktu perjalanan dengan tahun yang lengket dan garis yang terisi saat scroll
- Running text dua arah dan running text raksasa
- Panel kontak: email, tombol salin email, dan formulir mailto
- Navigasi dengan scrollspy, garis progres baca, dan menu ponsel
- Sorot kursor pada panel dan animasi muncul saat scroll

### README profil GitHub

- Banner nama dengan plot K-Means beranimasi (`profile/banner.svg`)
- Running text teknologi dan topik (`profile/marquee.svg`)
- Statistik kontribusi dan grafik per bulan (`profile/stats.svg`)
- Semua gambar dibuat oleh `scripts/readme-assets.mjs` dengan font tersemat

### Data dan perkakas

- `scripts/fetch-github.mjs` mengambil profil, repositori, dan kontribusi GitHub saat prebuild, dengan fallback ke data lama bila gagal
- Seluruh konten teks ID dan EN terpusat di `src/data/profile.ts`
- Panduan pengembangan di `docs/DEVELOPMENT.md`

### Aksesibilitas

- Responsif sampai lebar 360px tanpa scroll horizontal
- Tautan lompat ke konten, fokus keyboard terlihat, atribut `lang` per halaman, dan label untuk grafik
- Semua animasi, termasuk gambar README, mengikuti pengaturan "kurangi gerakan"

[1.0.0]: https://github.com/ahmadngiliyun00/ahmadngiliyun00/releases/tag/v1.0.0
