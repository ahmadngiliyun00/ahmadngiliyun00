# Catatan perubahan

Semua perubahan penting pada proyek ini dicatat di berkas ini. Format mengikuti
[Keep a Changelog](https://keepachangelog.com/id-ID/1.1.0/) dan penomoran versi mengikuti
[Semantic Versioning](https://semver.org/lang/id/).

## [Belum dirilis]

### Ditambahkan

- Tab Gambar postingan di formulir media sosial: Tautan gambar, Satu gambar, atau Beberapa gambar (carousel), menggantikan tiga isian yang berderet. Hanya tab yang dipilih yang tampil di situs, isi tab lain tetap tersimpan. Komponen tab bisa dipakai isian lain
- Teks alternatif per gambar di galeri (opsional, dua bahasa). Gambar tanpa teks sendiri memakai teks alternatif umum dengan nomor gambar
- Galeri gambar (carousel) untuk berita dan tulisan serta postingan media sosial. Di CMS, banyak gambar bisa dipilih atau diseret sekaligus, disusun urutannya dengan menyeret atau tombol panah, dan gambar pertama menjadi sampul. PDF, misalnya dokumen carousel LinkedIn, dipecah otomatis menjadi satu gambar per halaman. Di situs, gambar berganti otomatis tiap 3 detik, bisa digeser di ponsel, punya tombol kiri dan kanan, titik indikator, penghitung, dan tombol jeda; tampil di Kabar terbaru beranda, arsip Kabar, halaman tulisan, dan halaman Media sosial. Tidak berputar sendiri bila pengunjung meminta gerak dikurangi
- Gambar pertama galeri tulisan menjadi gambar pratinjau saat tautan dibagikan
- Pilihan sumber gambar postingan media sosial: isian Tautan gambar (didahulukan) dan Gambar unggahan (dipakai bila tautan kosong); bila keduanya kosong, kartu tampil tanpa gambar. Tautan berbagi Google Drive diubah otomatis menjadi tautan gambar, dan tautan CDN LinkedIn, Facebook, atau Instagram ditolak karena kedaluwarsa dalam beberapa hari
- Area unggah berkas baru di semua formulir CMS (isian berkas, impor lembar kerja, impor ZIP ekspor, Shares.csv LinkedIn): kotak bergaris putus-putus yang bisa diklik atau dijatuhi berkas, pratinjau gambar atau nama dan ukuran berkas sebelum diunggah, tombol batal, serta penolakan jenis atau ukuran berkas yang salah lewat toast

- Impor ZIP ekspor data Instagram dan Facebook (format JSON) di Pengaturan, Media sosial. ZIP dibaca di peramban, jadi arsip ratusan MB tidak melewati batas unggah; server hanya menerima daftar postingan lalu gambar sampul satu per satu. Hasil impor selalu privat, teks rusak dari Meta diperbaiki, impor ulang tidak membuat data ganda, dan postingan yang pernah dihapus tidak masuk lagi
- ZIP arsip LinkedIn bisa diunggah langsung (Shares.csv dibaca dari dalamnya); arsip tanpa postingan ditolak dengan pesan cara memintanya ulang
- Catatan impor pada postingan media sosial untuk hal yang perlu diperiksa, misalnya audiens Facebook yang tidak tercatat di ekspor
- Tautan profil Instagram, Facebook, dan LinkedIn di Pengaturan, Media sosial sebagai tujuan kartu yang tidak punya tautan postingan
- Postingan media sosial di Kabar terbaru beranda: paling banyak 2 kabar dan 2 postingan, terbaru di atas. Pilih lewat centang "Tampil di Kabar terbaru beranda" (maksimal 2); bila tidak ada yang dicentang, beranda menampilkan 2 postingan public terbaru

- Bukti sertifikat dari Google Drive: isian "Tautan Google Drive" di formulir capaian menerima tautan berbagi atau kode sematan, menyimpan bentuk baku, dan menampilkan pratinjau berkas di halaman detail. Kartu di beranda dan arsip mendapat tombol "Lihat bukti" yang langsung menuju pratinjau
- Halaman Media sosial (`/media-sosial/`, `/en/social/`) berisi postingan Instagram, Facebook, dan LinkedIn yang dikelompokkan per topik, misalnya program yang sedang didampingi
- Koneksi Instagram (akun Creator atau Business) dan Facebook (profil pribadi) di Pengaturan, Media sosial lewat OAuth. Postingan dan gambarnya ditarik ke koleksi baru Postingan media sosial sebagai data privat, lewat tombol Tarik sekarang atau cron harian `POST /cron/social/`. Token disimpan terenkripsi dan tidak pernah tampil di situs
- Impor postingan LinkedIn dari `Shares.csv` hasil ekspor data LinkedIn
- Aturan topik otomatis (`kata kunci | Nama topik`) dan pembersihan caption: emoji, em dash, ampersand, dan blok tagar
- Ekspor dan impor lembar kerja untuk setiap koleksi CMS: unduh Excel berisi semua data dan lembar petunjuk, isi sel yang kosong, lalu unggah kembali (.xlsx atau .csv). Impor menampilkan pratinjau per baris sebelum menyimpan, sel kosong tidak mengubah data, dan semua validasi CMS tetap berlaku

### Diubah

- Pilihan di isian select CMS (misalnya Platform) tidak lagi kosong setelah simpan gagal
- `npm run build` kini berhenti di awal dengan pesan jelas bila paket di `node_modules` belum sesuai `package-lock.json` (misalnya lupa `npm ci` setelah `git pull`), bukan gagal di tengah dengan "Module not found". Panduan deploy memakai perintah berantai supaya `pm2 reload` tidak berjalan setelah build gagal
- CSP `img-src` kini mengizinkan gambar dari https mana pun, supaya Tautan gambar postingan media sosial bisa tampil. Gambar dari tautan luar dimuat tanpa Referer
- CSP mengizinkan Cloudflare Web Analytics (`static.cloudflareinsights.com` dan `cloudflareinsights.com`), yang disisipkan Cloudflare ke setiap halaman bila Web Analytics aktif; sebelumnya skripnya diblokir dan memunculkan error di konsol
- Impor arsip LinkedIn Complete: berkas postingan bernama `Shares_<nomor>.csv` kini dikenali, dan tanda kutip yang dipakai LinkedIn untuk membungkus setiap baris teks postingan dibuang, sehingga tidak tampil di situs
- Pesan dan panduan impor LinkedIn diperbaiki: postingan (`Shares.csv`) hanya ada di arsip Complete dari pilihan Download larger data archive, bukan di arsip Basic yang dikirim lebih dulu. Pilihan per berkas di LinkedIn tidak punya opsi Posts
- Impor ekspor tidak lagi berhenti di gambar pertama yang gagal: gambar yang gagal dilewati, sisanya tetap diunggah, dan pesan menjelaskan cara melengkapinya (muat ulang halaman lalu impor ulang ZIP yang sama). Balasan server yang tidak terduga (misalnya halaman error Nginx) dilaporkan dengan pesan yang jelas
- Tautan postingan media sosial kini opsional, karena ekspor Meta tidak memuatnya. Postingan tanpa tautan hanya bisa dijadikan public bila tautan profil platformnya terisi
- Tarikan lewat API Meta tidak dipakai lagi: aplikasi Meta baru diarahkan ke Unified login yang mewajibkan portofolio bisnis, dan Instagram Login tidak lagi tersedia untuk aplikasi baru. Kode OAuth tetap ada dan hanya aktif bila variabel `INSTAGRAM_*` atau `FACEBOOK_*` diisi

## [2.0.0] - 2026-10-29

Versi besar karena cara menjalankan dan men-deploy situs berubah total: dari build statis menjadi server Node.js dengan database MySQL dan CMS di `/admin`.

### Perubahan yang memutus kompatibilitas

- Situs tidak lagi dibangun sebagai HTML statis (`output: "export"` dihapus). Deploy ke Vercel atau Cloudflare Pages sebagai situs statis tidak lagi didukung; situs berjalan dengan `next start` di VPS (PM2 dan Nginx), lihat `docs/DEPLOY.md`
- Wajib database MySQL atau MariaDB serta berkas environment (`.env.local`, lihat `.env.example`). Jalankan `npm run db:migrate`, `npm run db:seed`, dan `npm run admin:create` sebelum situs pertama kali dipakai
- Konten pindah dari `src/data/profile.ts` ke database dan dikelola lewat CMS; `profile.ts` kini hanya berisi identitas situs dan teks antarmuka
- Versi Node.js minimum naik menjadi 22.23.4 atau 24.22.1
- Beberapa bagian beranda pindah ke halaman dalam; jangkar lama seperti `/#research` dialihkan otomatis

### Ditambahkan

- Halaman error yang serasi dengan beranda: 404 dan 500 untuk situs ID dan EN (dengan header dan footer), CMS, dan `global-error`, berisi kode besar beranimasi, kalimat bahwa ini halaman error, penyebabnya, rincian kode dan alamat, kode referensi untuk log, serta tombol Kembali dan Ke beranda
- Halaman error statis 500, 502, 503, dan 504 untuk Nginx (`npm run errors`), tetap tampil saat aplikasi mati dan memuat ulang sendiri setelah 20 detik
- Halaman login CMS baru: panel merek, isian berikon, tombol lihat dan sembunyikan kata sandi, peringatan Caps Lock
- Halaman dalam dua bahasa: Proyek (`/proyek/`, `/en/projects/`), Riset dan Publikasi (`/riset/`, `/en/research/`), Mengajar (`/mengajar/`, `/en/teaching/`), dan Perjalanan dengan Arah ke depan (`/perjalanan/`, `/en/journey/`), masing-masing dengan breadcrumb, data terstruktur BreadcrumbList, metadata, canonical, hreflang, dan entri sitemap
- Bagian "Jelajahi" di beranda: tiga kartu menuju Riset, Mengajar, dan Perjalanan, masing-masing dengan satu angka ringkas
- Isian SEO di CMS untuk judul dan deskripsi empat halaman baru, dengan pratinjau hasil Google untuk keenam halaman
- Isian CMS "Alat utama di beranda" (Pengaturan, Profil) dan tanda "Tampil di kontak beranda" di kanal kontak
- Footer berisi tautan ke semua halaman, dan tautan "Kembali ke beranda" di halaman dalam
- Unit test aturan beranda (`tests/home.test.mjs`) dan teks SEO bawaan (`tests/seo-text.test.mjs`)
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
- Pengaturan "SEO dan Search Console": judul, deskripsi, dan kata kunci beranda serta arsip sertifikat (ID dan EN, kosong berarti teks bawaan), dengan pratinjau hasil Google yang berubah saat mengetik dan penghitung panjang ideal
- Kabar dan liputan: koleksi CMS "Berita dan tulisan" untuk liputan media (menaut ke sumber), tulisan sendiri, dan kabar singkat. Tiga terbaru tampil di beranda, arsip lengkap di `/kabar/` dan `/en/news/`, dan tulisan dengan isi lengkap punya halaman sendiri dengan JSON-LD. Liputan media juga dicantumkan sebagai `subjectOf` di data terstruktur Person
- Isian dua bahasa gaya OJS: pengaturan "Bahasa utama" di CMS (Pengaturan, Bahasa), formulir menampilkan bahasa utama lebih dulu dengan tombol globe berwarna (hijau lengkap, merah belum diterjemahkan, abu-abu kosong) dan tab bahasa untuk menerjemahkan berdampingan. Isian wajib cukup diisi dalam bahasa utama; terjemahan yang belum ada memakai teks bahasa utama di situs. Daftar CMS menandai data yang terjemahannya belum lengkap
- Editor rich text untuk isi tulisan (Tiptap): subjudul, format teks, tautan, daftar, kutipan, kode, dan gambar. Gambar diperkecil di peramban lalu diunggah (bukan base64), dikaitkan ke tulisannya, dan ikut terhapus bila dibuang dari isi. HTML dibersihkan saat disimpan dan saat dirender
- Hitungan pembaca tulisan: satu pengunjung per tulisan per hari (muat ulang tidak dihitung), tanpa menyimpan IP, tanpa robot dan kunjungan admin. Panel statistik di CMS: total, 7 dan 30 hari, grafik harian, asal pembaca, perangkat, dan versi bahasa. Halaman tulisan menampilkan jumlah pembaca dan waktu baca
- Tombol bagikan di halaman tulisan: WhatsApp, Facebook, X, LinkedIn, Telegram, salin tautan, dan menu bagikan bawaan ponsel. Tautan membawa `?src=` supaya asal pembaca tercatat
- Komentar per tulisan yang bisa dinyalakan atau dimatikan, dengan moderasi di CMS `/admin/komentar/` (setujui, balas, spam, hapus), notifikasi email, dan perlindungan spam seperti form kontak
- Email notifikasi form kontak dan email uji kini berdesain (HTML dengan versi teks polos), berisi rincian pengirim, isi pesan, serta tombol Balas dan Buka di CMS
- Isian "Teruskan juga ke" di pengaturan Email dan SMTP: salinan tersembunyi (BCC) notifikasi ke email pribadi tanpa menampilkannya di situs
- Notifikasi toast untuk CMS dan situs: muncul sebentar lalu hilang sendiri, berhenti saat disorot atau difokus, dan bisa ditutup. Menggantikan kotak notifikasi di halaman
- Bagian "Sertifikat dan capaian" di beranda: baris indikator bertanggal (sitasi, h-index, skor SINTA, hak cipta, publikasi) dan sorotan dengan saringan sertifikat atau hak cipta
- Arsip `/sertifikat/` dan `/en/certificates/` dengan pencarian, saringan kategori dan tahun, serta saringan yang tersimpan di URL
- Halaman detail per capaian dengan tautan verifikasi resmi, tombol "Tambahkan ke LinkedIn", teks siap tempel, metadata, Open Graph, dan JSON-LD
- Bagian "Riset": tema, hibah Penelitian Dosen Pemula NetA, publikasi per tahun dengan posisi penulis, dan profil riset
- RupiahVision sebagai proyek unggulan dan daftar "Sistem yang saya kembangkan" untuk repositori privat
- Unit test pembangun URL LinkedIn (`npm test`)
- Bagian README (proyek, capaian, mengajar, perjalanan) dibangkitkan otomatis dari konten public di database

### Diubah

- Beranda ditata ulang dari 11 bagian menjadi 7: hero, Tentang singkat (empat bidang kerja dan alat utama), Jelajahi, tiga proyek unggulan ringkas, sorotan capaian (indikator dan tiga kartu per tab), dua kabar terbaru, dan Kontak. Tinggi beranda di layar 375px turun dari sekitar 31.200 px menjadi sekitar 8.400 px. Isi lain pindah ke halaman dalam tanpa ada yang dihapus
- Dua pita teks berjalan (teknologi dan topik) diganti daftar di halaman Proyek, bagian Teknologi dan topik
- Kontak tanpa empat kartu topik: keterangan topik tampil di bawah pilihan topik formulir, dan kanal sosial di beranda dibatasi empat
- Header menaut ke halaman Proyek, Riset, Mengajar, Perjalanan, Sertifikat, dan Kontak; menu desktop tampil mulai 1024px
- Jangkar beranda lama seperti `/#research` dan `/#teaching` dialihkan ke halaman barunya
- Di ponsel, plot K-Means lebih pendek dan kartu proyek, sorotan, serta kabar di beranda menjadi baris geser
- Judul dan deskripsi SEO bawaan ditulis ulang sebagai kalimat naratif tanpa titik dua, strip pemisah, atau nama kota
- Situs kini berjalan sebagai server Node.js dan membaca konten dari database, bukan build statis
- Sitemap tidak lagi memuat pasangan bahasa `xhtml:link` (sudah ada di `<head>` tiap halaman), sehingga browser menampilkannya sebagai pohon XML yang rapi
- Meta halaman beranda dan arsip kini memuat author dan Twitter card
- Menu navigasi desktop tampil mulai lebar 1100px; di bawahnya memakai menu ponsel supaya sepuluh tautan tidak terpotong
- Mengajar dipisah per kampus dengan "Semester ini" dan "Pernah diampu", ditambah bidang keahlian mengajar
- Garis waktu dikoreksi: jalur S1 (STIKOM Poltek Cirebon lalu UNU Cirebon), S2 STMIK LIKMI Bandung, AWATARA Februari 2022, dan Dicoding 2020 sebagai "bergabung"
- Klaim kelulusan IDCamp 2023 dihapus
- Peran di bagian Tentang kini mencakup staf IT

### Diperbaiki

- Formulir CMS tidak lagi kosong setelah disimpan; isian menampilkan data yang baru tersimpan

### Keamanan

- Header keamanan di semua halaman: Content Security Policy, anti clickjacking (`X-Frame-Options`, `frame-ancestors`), HSTS bila https, `nosniff`, `Referrer-Policy`, dan `Permissions-Policy`
- Pembatas percobaan login, form kontak, komentar, dan hitungan pembaca kini mencatat percobaan secara atomik sebelum memeriksa, sehingga tidak bisa ditembus dengan permintaan serentak
- JSON-LD dan konfigurasi Analytics di-escape supaya teks berisi `</script>` tidak bisa menyisipkan skrip
- Akun admin GitHub dikunci ke ID numerik GitHub (migrasi `0003`), bukan hanya nama pengguna yang bisa didaur ulang
- Form komentar memakai Cloudflare Turnstile seperti form kontak
- Alamat IP cadangan diambil dari entri terakhir `X-Forwarded-For`, bukan entri pertama yang bisa dipalsukan
- Halaman login dan moderasi komentar tidak lagi galat 500 karena parameter `?error=` atau `?done=` yang tidak dikenal
- Versi Node.js minimum 22.23.4 atau 24.22.1 (rilis keamanan Oktober 2026)
- `docs/DEPLOY.md`: Next.js wajib mendengarkan di `127.0.0.1`, dan bagian baru "Keamanan server"

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

[2.0.0]: https://github.com/ahmadngiliyun00/ahmadngiliyun00/releases/tag/v2.0.0
[1.0.0]: https://github.com/ahmadngiliyun00/ahmadngiliyun00/releases/tag/v1.0.0
