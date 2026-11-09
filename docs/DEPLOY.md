# Deploy ke VPS aaPanel

Situs dan CMS adalah satu aplikasi Next.js (`next start`) yang membaca MySQL. Panduan ini untuk VPS Ubuntu dengan aaPanel, Node.js lewat NVM, PM2, dan Nginx sebagai reverse proxy.

## 1. Siapkan server

- Node.js 22 versi 22.23.4 atau lebih baru (lewat NVM atau Node.js Manager di aaPanel) dan PM2 (`npm i -g pm2`). Versi di bawahnya memuat celah yang ditambal rilis keamanan Node 21 Oktober 2026; Node 20 sudah tidak didukung
- MySQL 8 dari aaPanel. **Jangan buka port 3306 ke internet**; aplikasi terhubung lewat `127.0.0.1`
- Buat database dan user khusus di aaPanel (menu Databases), misalnya database `ngiliyun_portfolio` dengan user `portfolio`, charset `utf8mb4`

## 2. Ambil kode dan atur environment

```bash
cd /www/wwwroot
git clone https://github.com/ahmadngiliyun00/ahmadngiliyun00.git ngiliyun.my.id
cd ngiliyun.my.id
npm ci
cp .env.example .env.production.local
chmod 600 .env.production.local
```

Isi `.env.production.local`:

| Variabel | Contoh |
| --- | --- |
| `DATABASE_URL` | `mysql://portfolio:<kata-sandi>@127.0.0.1:3306/ngiliyun_portfolio` |
| `SITE_URL` | `https://ngiliyun.my.id` (harus https supaya cookie sesi diberi atribut Secure) |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | dari OAuth App (langkah 6), boleh kosong bila hanya login email |
| `GITHUB_ALLOWED_LOGIN` | `ahmadngiliyun00` |
| `UPLOAD_DIR` | `/www/wwwroot/ngiliyun-storage/uploads` (di LUAR folder situs dan di luar `public/`) |
| `CONTACT_IP_SALT` | **wajib**, teks acak panjang, misalnya hasil `openssl rand -hex 32`. Dipakai untuk hash IP form kontak, komentar, dan hitungan pembaca. Bila kosong, dipakai garam bawaan yang tertulis di repo publik |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile (langkah 7), boleh kosong |

```bash
mkdir -p /www/wwwroot/ngiliyun-storage/uploads
chmod 700 /www/wwwroot/ngiliyun-storage
```

## 3. Database, data awal, dan akun admin

```bash
npm run db:migrate        # buat tabel
npm run db:seed           # isi konten awal dari seed/ (hanya sekali, menolak bila sudah berisi)
npm run admin:create -- --email <email-anda> --name "Ahmad Ngiliyun"
```

## 4. Build dan jalankan dengan PM2

```bash
npm run build
pm2 start npm --name ngiliyun --time -- start -- -H 127.0.0.1 -p 3005
pm2 save
pm2 startup               # ikuti perintah yang dicetak agar PM2 hidup lagi setelah reboot
```

`-H 127.0.0.1` wajib: tanpa itu Next.js mendengarkan di semua antarmuka, sehingga port 3005 bisa dibuka langsung dari internet tanpa lewat Nginx dan Cloudflare, dan header `X-Real-IP` bisa dipalsukan untuk mengakali pembatas percobaan login.

Jalankan **satu instans saja** (mode fork, bukan cluster). Cache konten disimpan di memori proses dan dibuang setiap kali CMS menyimpan perubahan; dengan beberapa instans, instans lain tidak tahu ada perubahan.

## 5. Nginx (aaPanel: Website, Add site, lalu Config)

Tambahkan di dalam blok `server` situs `ngiliyun.my.id`:

```nginx
client_max_body_size 8m;
server_tokens off;   # jangan umumkan versi Nginx di header dan halaman error

location / {
    proxy_pass http://127.0.0.1:3005;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

Halaman error statis saat aplikasi Next.js tidak menjawab (mati, sedang dimulai ulang, atau terlalu lama). Tambahkan juga di blok `server` yang sama, dan hapus baris `error_page` bawaan aaPanel bila ada:

```nginx
error_page 500 /errors/500.html;
error_page 502 /errors/502.html;
error_page 503 /errors/503.html;
error_page 504 /errors/504.html;

location ^~ /errors/ {
    root /www/wwwroot/ngiliyun.my.id/public;   # sesuaikan dengan folder public situs
}
```

- Berkasnya ada di `public/errors/` dan dibuat oleh `npm run errors` (`scripts/error-pages.mjs`). Nginx menyajikannya langsung dari disk, jadi tetap tampil walau proses PM2 mati. Halaman 502, 503, dan 504 mencoba memuat ulang sendiri setelah 20 detik
- Jangan pasang `error_page 404` dan jangan aktifkan `proxy_intercept_errors`: 404 dan 500 dari aplikasi sudah ditangani Next.js dengan halaman yang memakai header dan footer situs
- Uji: `pm2 stop ngiliyun`, buka situs (harus tampil halaman 502), lalu `pm2 start ngiliyun`
- `Host` wajib diteruskan apa adanya. Server Action Next.js menolak permintaan bila Origin dan Host tidak cocok
- SSL: pakai Let's Encrypt dari aaPanel, atau sertifikat Origin Cloudflare bila DNS diproksikan
- HSTS cukup dikirim satu sumber: aplikasi sudah mengirim `Strict-Transport-Security: max-age=31536000` (`next.config.ts`) bila `SITE_URL` memakai https. Matikan HSTS bawaan aaPanel (baris `add_header Strict-Transport-Security` di blok SSL situs, beri tanda `#`) dan biarkan HSTS di Cloudflare (SSL/TLS, Edge Certificates) mati. Header ganda tidak membuka celah, tetapi peramban hanya membaca yang pertama sehingga perubahan di salah satu tempat bisa tidak berlaku. Periksa: `curl -sI https://ngiliyun.my.id/ | grep -ci strict-transport` harus `1`
- Protokol TLS di blok SSL aaPanel: pakai `ssl_protocols TLSv1.2 TLSv1.3;` (hapus `TLSv1.1`) dan buang sandi lemah `3DES` dari `ssl_ciphers`. TLS 1.1 sudah dinyatakan usang, dan 3DES rentan serangan SWEET32. Pengunjung yang lewat Cloudflare tidak terdampak, tetapi pengaturan ini berlaku bagi siapa pun yang menghubungi IP server secara langsung
- Bila DNS lewat proxy Cloudflare (awan oranye), pulihkan IP asli pengunjung supaya pembatas percobaan login bekerja per pengunjung, bukan per IP Cloudflare. Tambahkan `set_real_ip_from` untuk setiap rentang IP di <https://www.cloudflare.com/ips/> lalu `real_ip_header CF-Connecting-IP;`

## 6. Login GitHub (opsional)

1. Buka <https://github.com/settings/developers>, lalu New OAuth App
2. Homepage URL: `https://ngiliyun.my.id`
3. Authorization callback URL: `https://ngiliyun.my.id/admin/auth/github/callback/` (dengan garis miring di akhir)
4. Salin Client ID dan buat Client Secret, isi ke `.env.production.local`, lalu `pm2 reload ngiliyun`

Akun admin untuk login GitHub dibuat otomatis saat akun yang diizinkan pertama kali masuk.

## 7. Form kontak dan email

Pesan dari form kontak selalu tersimpan di database dan bisa dibaca di `/admin/pesan/`. Tiga hal di bawah membuat alur email lengkap.

**a. Alamat publik `ahmad@ngiliyun.my.id` (menerima email).** Pakai Cloudflare Email Routing (gratis):

1. Dasbor Cloudflare, pilih domain `ngiliyun.my.id`, menu Email, lalu Email Routing, aktifkan. Cloudflare menambahkan record MX dan TXT sendiri
2. Tambah alamat tujuan (Gmail pribadi) dan verifikasi lewat email konfirmasi
3. Routing rules: buat alamat kustom `ahmad`, aksi Send to an email, tujuan Gmail tadi
4. Di CMS, Pengaturan, Profil: isi Email nama `ahmad` dan Email domain `ngiliyun.my.id`

**b. Penerusan pesan form ke email (mengirim email).** Diatur di CMS, menu Pengaturan, **Email dan SMTP**, tanpa mengubah berkas environment dan tanpa restart. Pilihan paling cepat adalah Gmail:

1. Aktifkan Verifikasi 2 Langkah di akun Google, lalu buat Sandi Aplikasi di <https://myaccount.google.com/apppasswords>
2. Server SMTP `smtp.gmail.com`, Port `465`, Keamanan SSL/TLS langsung, Nama pengguna = alamat Gmail, Kata sandi = sandi aplikasi 16 huruf
3. Penerima notifikasi: `ahmad@ngiliyun.my.id`. Isi **Teruskan juga ke** dengan email pribadi (satu per baris, maksimal 3). Alamat ini dikirimi salinan tersembunyi (BCC), hanya tersimpan di CMS, dan tidak pernah tampil di situs
4. Simpan, lalu klik **Kirim email uji** di bawah formulir. Email uji juga dikirim ke semua alamat salinan

Kata sandi SMTP tersimpan di tabel `settings` dan tidak pernah ditampilkan ulang di CMS. Karena ikut masuk cadangan database, simpan berkas cadangan di tempat yang aman, dan cabut sandi aplikasinya di akun Google bila cadangan bocor.

Email notifikasi berformat HTML (template di `src/lib/mail-template.ts`) dengan versi teks polos sebagai cadangan, dan memakai Reply-To pengunjung, jadi tombol Balas langsung menuju pengirim. Untuk membalas dengan nama pengirim `ahmad@ngiliyun.my.id`, tambahkan alamat itu di Gmail lewat Setelan, Akun, Kirim email sebagai (memakai SMTP Gmail yang sama). Bila nanti ingin mengirim langsung dari domain, ganti SMTP ke layanan yang mendukung domain sendiri (misalnya Resend atau Zoho Mail) tanpa mengubah kode.

**c. Anti robot (opsional).** Dasbor Cloudflare, menu Turnstile, Add widget, domain `ngiliyun.my.id`, mode Managed. Isi `NEXT_PUBLIC_TURNSTILE_SITE_KEY` dan `TURNSTILE_SECRET_KEY`, lalu `npm run build` dan `pm2 reload ngiliyun` (kunci situs dibaca saat build). Tanpa Turnstile, form tetap dilindungi kolom jebakan, jebakan waktu 3 detik, batas 3 tautan, dan maksimal 5 pesan per IP per jam.

Pembatas per IP membutuhkan IP asli pengunjung, jadi pastikan pengaturan `real_ip_header` di langkah 5 sudah terpasang bila DNS diproksikan Cloudflare.

## 8. Search Console dan Analytics

Lakukan setelah situs bisa dibuka di `https://ngiliyun.my.id`. Semua isian ada di CMS, menu Pengaturan, **SEO dan Search Console**, dan langsung berlaku setelah disimpan tanpa build ulang.

Di halaman yang sama ada isian judul, deskripsi, dan kata kunci untuk beranda dan arsip sertifikat, beserta pratinjau hasil Google. Kosongkan untuk memakai teks bawaan. Setelah mengubahnya, minta perayapan ulang lewat Pemeriksaan URL di Search Console supaya hasil pencarian cepat diperbarui.

**a. Bukti kepemilikan di Google Search Console.** Buka <https://search.google.com/search-console>, Tambahkan properti. Pilih salah satu cara (boleh lebih dari satu sebagai cadangan):

| Cara | Langkah |
| --- | --- |
| Domain lewat DNS (disarankan) | Properti **Domain**, isi `ngiliyun.my.id`. Salin record TXT `google-site-verification=...`, lalu di Cloudflare: DNS, Add record, Type `TXT`, Name `@`, Content hasil salinan. Mencakup http, https, dan semua subdomain. Tidak lewat CMS |
| Tag HTML | Properti **Awalan URL** `https://ngiliyun.my.id/`, metode Tag HTML. Tempel seluruh tag `<meta ...>` ke isian Google Search Console: tag HTML, simpan, lalu klik Verifikasi |
| File HTML | Properti Awalan URL, metode File HTML. Isi nama berkasnya (misalnya `google1a2b3c4d5e6f7a8b.html`) ke CMS. Berkas tidak perlu diunggah; situs membuatnya sendiri. Cek dengan membuka `https://ngiliyun.my.id/<nama-berkas>` |
| Google Analytics | Properti Awalan URL, metode Google Analytics. Berhasil bila ID GA4 sudah terpasang (langkah c) dan akun Google yang sama punya izin Edit di properti Analytics |

Biarkan isian verifikasi tetap terpasang setelah berhasil, karena Google memeriksa ulang secara berkala.

**b. Sitemap.** Di Search Console, menu Sitemaps, kirim `sitemap.xml`. Sitemap dibuat otomatis dari database: hanya beranda, arsip, dan halaman detail capaian yang **public** (versi Indonesia dan Inggris, dengan tanggal ubah terakhir). Pasangan bahasa (hreflang) ada di `<head>` setiap halaman, bukan di sitemap, jadi browser menampilkan sitemap sebagai pohon XML biasa. Data privat tidak pernah masuk, dan `robots.txt` memblokir `/admin/`, `/s/`, dan `/en/s/`. Tidak perlu mengirim ulang sitemap setiap kali konten berubah.

Berkas unggahan (`/files/<id>/`, misalnya gambar galeri dan bukti sertifikat) tidak masuk sitemap dan tidak diindeks: setiap berkas dikirim dengan header `X-Robots-Tag: noindex, nofollow`. `/files/` sengaja tidak diblokir di `robots.txt`, karena header itu hanya terbaca bila Google boleh mengambil berkasnya. Akibatnya alamat berkas tetap tercatat di laporan **Pengindeksan halaman** sebagai **Excluded by 'noindex' tag** (Dikecualikan oleh tag noindex). Itu memang tujuannya, bukan kesalahan; jangan klik Validasi Perbaikan untuk alamat `/files/`. Laporan lama **Blocked by robots.txt** untuk `/files/` (dari aturan sebelum November 2026) akan berpindah sendiri ke kategori noindex setelah Google merayapi ulang.

Bila status sitemap di Search Console **Couldn't fetch** (Tidak dapat mengambil) dengan Last read kosong dan Discovered pages 0, periksa dulu sitemap dari luar: `curl -sI https://ngiliyun.my.id/sitemap.xml` harus membalas `200` dan `content-type: application/xml`, dan Pemeriksaan URL, Uji URL aktif untuk alamat sitemap harus berhasil. Bila keduanya benar, status itu sisa percobaan pertama (misalnya dikirim saat situs atau DNS belum siap), dan Search Console tidak selalu cepat mencoba lagi. Hapus sitemap dari daftar (menu titik tiga, Hapus peta situs), lalu kirim ulang `sitemap.xml`. Bila masih tertahan setelah satu sampai dua hari, kirim `sitemap.xml?v=2`: isinya sama, tetapi dianggap alamat baru sehingga langsung diambil. Sitemap juga tercantum di `robots.txt`, jadi Google tetap menemukannya.

Bila halaman situs sudah muncul di Google tetapi sitemap tetap **Couldn't fetch**, Googlebot bisa masuk ke situs, jadi kemungkinan besar ada yang menghalangi permintaan ke `/sitemap.xml` saja. Periksa berurutan:

1. Search Console, Pemeriksaan URL, isi `https://ngiliyun.my.id/sitemap.xml`, lalu **Uji URL aktif**. Bagian Pengambilan halaman menyebut penyebabnya bila gagal (diblokir, error server, waktu habis)
2. Cloudflare, Security, Events: saring Path `/sitemap.xml` dan User agent berisi `Googlebot`. Bila ada yang diblokir atau ditantang (Managed Challenge, JS Challenge), matikan aturan itu untuk Googlebot, atau buat aturan Skip untuk `/sitemap.xml` dan `/robots.txt`. Bot Fight Mode dan Super Bot Fight Mode di Security, Bots kadang ikut menantang crawler sah
3. aaPanel: bila firewall situs (Nginx WAF atau anti-crawler) aktif, periksa log blokirnya untuk `/sitemap.xml`, dan pastikan Googlebot tidak masuk daftar blokir user agent
4. Setelah penyebabnya dibereskan, hapus sitemap dari daftar lalu kirim ulang (atau kirim `sitemap.xml?v=2`)

Format sitemap sudah disamakan dengan sitemap yang terbukti dibaca Search Console: `lastmod` WIB tanpa milidetik (misalnya `2026-11-02T23:21:28+07:00`), `changefreq`, dan `priority` (`src/lib/sitemap.ts`). Hasilnya lolos validasi skema sitemap 0.9.

**Jadwal memeriksa sitemap (tidak perlu dicek setiap hari).** Status Couldn't fetch dengan kolom Last read **kosong** berarti Google belum pernah mencoba mengambil sitemap, bukan mencoba lalu gagal. Search Console menampilkan label itu selama sitemap masih menunggu di antrean. Untuk domain baru (ngiliyun.my.id pindah ke Cloudflare 28 Oktober 2026) antrean ini wajar memakan satu sampai dua minggu; sebagai pembanding, sitemap lain yang dikirim 13 Oktober baru dibaca 27 Oktober. Sudah dipastikan 3 November 2026: Uji URL aktif untuk `/sitemap.xml` berhasil (Pengambilan halaman: Berhasil), log firewall Cloudflare tidak memblokir apa pun di `/sitemap.xml`, dan Bot Fight Mode mati.

| Kapan | Periksa | Bila belum berubah |
| --- | --- | --- |
| Setelah 1 minggu (sekitar 10 November 2026) | Kolom Last read di menu Sitemaps | Biarkan, jangan hapus atau kirim ulang (tidak mempercepat antrean) |
| Setelah 2 minggu (sekitar 17 November 2026) | Last read, lalu log Nginx (perintah di bawah) | Bila log menunjukkan Googlebot mengambil sitemap dengan status `200`, tunggu Search Console menyusul. Bila belum ada permintaan sama sekali, kirim `sitemap.xml?v=2` |
| Setelah 4 minggu (sekitar 1 Desember 2026) | Ulangi Uji URL aktif untuk `/sitemap.xml` | Bila uji aktif gagal, ikuti daftar periksa di atas. Bila berhasil tetapi status masih Couldn't fetch, laporkan lewat tombol Kirim masukan di Search Console |

Apakah Googlebot sudah pernah mengambil sitemap (log akses Nginx bawaan aaPanel; sesuaikan bila lokasinya berbeda):

```bash
grep "sitemap.xml" /www/wwwlogs/ngiliyun.my.id.log | grep -i googlebot | tail -5
```

Search Console, Setelan, Statistik crawl juga menampilkan semua permintaan Googlebot beserta kode statusnya, termasuk berkas XML. Sambil menunggu, halaman tetap bisa diindeks lebih cepat lewat Pemeriksaan URL, Minta pengindeksan untuk halaman penting (`/`, `/proyek/`, `/riset/`). Jangan meminta pengindeksan untuk alamat sitemap, karena sitemap bukan halaman yang diindeks.

**c. Google Analytics 4.** Buka <https://analytics.google.com>, Admin, Buat properti, lalu Aliran data Web dengan URL `https://ngiliyun.my.id`. Salin ID pengukuran (`G-XXXXXXXXXX`) ke CMS. Script hanya dipasang di beranda, arsip, dan detail capaian; tidak di CMS dan tidak di tautan berbagi rahasia, jadi token berbagi tidak terkirim ke Google. Kunjungan saat Mas Ilyun sedang masuk CMS tidak dihitung. Analytics memasang cookie pengunjung, jadi bila nanti dibutuhkan, tambahkan pemberitahuan privasi di situs.

**d. Bing Webmaster (opsional).** Di <https://www.bing.com/webmasters>, cara tercepat adalah Import dari Google Search Console. Bila memilih tag meta, tempel tag `msvalidate.01` ke isian Bing Webmaster di CMS.

## 9. Media sosial (opsional)

Postingan Instagram, Facebook, dan LinkedIn Mas Ilyun dimasukkan ke CMS lalu ditampilkan di halaman `/media-sosial/` (`/en/social/`). Semua hasil impor masuk sebagai data **privat**; Mas Ilyun memeriksa dan menjadikannya public satu per satu.

| Platform | Cara | Catatan |
| --- | --- | --- |
| Instagram | Impor ZIP ekspor data (format JSON) | Postingan feed dan carousel; story dan repost tidak ikut |
| Facebook | Impor ZIP ekspor data (format JSON) | Ekspor tidak mencatat audiens, jadi setiap postingan diberi peringatan |
| LinkedIn | Impor ZIP arsip Complete, atau `Shares.csv` saja | Arsip Basic yang datang lebih dulu tidak memuat postingan |

**Status API (November 2026).** Aplikasi Meta baru diarahkan ke Unified login yang mewajibkan portofolio bisnis, dan **Instagram Login (Instagram API with Instagram Login) tidak lagi tersedia untuk aplikasi baru**. Karena itu tarikan otomatis lewat API tidak dipakai dan keempat variabel `INSTAGRAM_*` dan `FACEBOOK_*` dibiarkan kosong. Kode OAuth tetap ada dan hanya aktif bila variabel itu diisi (lihat **Lampiran: tarikan lewat API** di akhir bagian ini).

**a. Minta ekspor dari Instagram dan Facebook.** Di aplikasi atau situs Instagram atau Facebook: **Pusat Akun**, **Informasi dan izin Anda**, **Ekspor informasi Anda**, **Buat ekspor**. Pilih akun, **Ekspor ke perangkat**, lalu:

- Informasi: cukup **Postingan** atau **Media** (untuk Facebook: Posts). Tidak perlu pesan, komentar, atau aktivitas lain
- Format: **JSON** (bukan HTML). Ekspor HTML ditolak CMS dengan pesan yang menjelaskan hal ini
- Kualitas media: bebas. Rentang tanggal: sesuai kebutuhan

Setelah notifikasi dari Meta datang (biasanya beberapa menit sampai sehari), unduh ZIP-nya dalam 4 hari. Jangan diekstrak.

**b. Impor di CMS.** Pengaturan, **Media sosial**, kartu **Impor dari ekspor data**: pilih ZIP-nya. Peramban membaca isi ZIP dan menampilkan ringkasan (jumlah postingan, yang bergambar, dan yang dilewati), lalu klik **Impor**.

- ZIP dibaca di peramban dan tidak dikirim utuh ke server, jadi arsip ratusan MB tetap aman terhadap batas Server Action (6 MB) dan Nginx (8 MB). Server hanya menerima daftar postingan (teks, waktu, ID) lalu gambar sampul satu per satu, paling besar 5 MB. Gambar yang lebih besar atau berformat lain diperkecil ke JPEG di peramban. Butuh Chrome, Edge, Firefox, atau Safari versi terbaru
- Gambar sampul disimpan lewat `saveUpload` ke `UPLOAD_DIR`. Carousel hanya menyalin gambar pertama; video hanya dicatat tanpa berkas (unggah sampul manual bila perlu)
- Teks rusak dari Meta (UTF-8 yang di-escape per byte, terlihat seperti `Ã°ÂŸÂš€`) diperbaiki dulu, lalu lewat pembersihan caption (emoji, em dash, ampersand, blok tagar) dan aturan topik
- Instagram memakai ID postingan dari ekspor. Facebook tidak punya ID postingan, jadi ID dibuat dari waktu posting dan nama berkas media pertama (atau hash teks untuk postingan tanpa media). Impor ulang ZIP yang sama tidak membuat data ganda, melengkapi gambar yang belum tersalin (hanya data yang masih privat), dan postingan yang pernah dihapus di CMS tidak masuk lagi
- Facebook: postingan yang ditulis di profil orang lain, postingan orang lain, serta berbagi tanpa teks dan tanpa gambar sendiri dilewati. Sisanya diberi **Catatan impor** (terlihat di formulir dan ditandai "perlu diperiksa" di daftar): audiens tidak tercatat, dibagikan ke grup, tautan yang dibagikan, atau teksnya sama dengan postingan Instagram yang sudah ada

**c. LinkedIn.** LinkedIn, Settings, Data privacy, **Get a copy of your data**, pilih **Download larger data archive**, lalu Request archive. Pilihan per berkas (Articles, Invitations, Profile, Recommendations, Registration) tidak memuat postingan. LinkedIn mengirim dua email: arsip **Basic** lebih dulu (profil, posisi, sertifikat, koneksi, `Rich_Media.csv`, tanpa postingan), lalu arsip **Complete** 24 sampai 48 jam kemudian yang memuat postingan dalam berkas `Shares_<nomor>.csv`, misalnya `Shares_863241591.csv` (menurut [halaman bantuan LinkedIn](https://www.linkedin.com/help/linkedin/answer/a1339364), Shares termasuk data "larger download"; tautan unduh berlaku 72 jam dan fitur ini tidak tersedia di aplikasi ponsel, jadi pakai komputer). Unggah arsip Complete di kartu **Impor dari ekspor data**, atau ekstrak dan unggah `Shares.csv` saja di kartu LinkedIn; arsip Basic ditolak dengan pesan yang menjelaskan hal ini. Arsip LinkedIn juga memuat data pribadi (koneksi, email, nomor telepon), tetapi CMS hanya membaca `Shares.csv` di peramban dan tidak mengunggah berkas lain. Gambar postingan LinkedIn tidak ikut ekspor: di `Rich_Media.csv` foto postingan (feed photo) tidak punya tautan, dan tautan yang ada (dokumen, foto profil) kedaluwarsa dalam seminggu. Untuk postingan yang dipajang, isi **Tautan gambar** (misalnya tautan berbagi Google Drive, diubah otomatis) atau unggah di **Gambar unggahan**; tautan didahulukan.

**d. Tautan profil dan aturan topik.** Ekspor Meta tidak memuat tautan postingan, jadi isian Tautan postingan boleh kosong. Isi **Tautan profil Instagram**, **Facebook**, dan **LinkedIn** di Pengaturan, Media sosial: kartu tanpa tautan postingan menaut ke profil itu. Postingan tanpa tautan postingan hanya bisa dijadikan public bila tautan profil platformnya terisi. Tautan postingan asli tetap bisa ditempel kapan saja (Bagikan, Salin tautan di aplikasi).

Isi **Aturan topik** supaya postingan langsung terkelompok, misalnya `pijak | Program PIJAK`. Postingan yang tagar atau teksnya memuat kata kunci itu mendapat topik tersebut dan tampil sebagai bagian sendiri di halaman Media sosial. Aturan berlaku untuk postingan yang baru diimpor.

**e. Sebelum menjadikan public.** Buka Kabar, **Postingan media sosial**. Periksa setiap postingan: baca Catatan impor lalu kosongkan setelah diperiksa, rapikan teks (postingan tanpa teks wajib diberi teks), isi teks alternatif gambar, dan pastikan tidak ada data mahasiswa atau peserta yang belum setuju dipublikasikan, orang yang disebut namanya, urusan internal kampus, atau detail sistem internal (lihat aturan privasi di `CLAUDE.md`). Postingan yang dihapus di CMS diingat dan tidak diimpor lagi.

**f. Kabar terbaru beranda.** Centang **Tampil di Kabar terbaru beranda** pada postingan public yang ingin dipajang di beranda (maksimal 2). Bila tidak ada yang dicentang, beranda menampilkan 2 postingan public terbaru, berdampingan dengan 2 kabar terbaru.

**g. Bila muncul "An unexpected response was received from the server".** Artinya peramban menerima balasan yang bukan dari aplikasi, biasanya halaman error Nginx atau Cloudflare (aplikasi sedang dimulai ulang, permintaan ditolak, atau halaman CMS dibuka sebelum deploy terakhir). Muat ulang halaman CMS (Ctrl+Shift+R), lalu impor ulang ZIP yang sama: postingan tidak dobel dan gambar postingan yang masih privat dilengkapi. Untuk postingan yang sudah public tanpa gambar, jadikan privat dulu lalu impor ulang, atau unggah gambarnya lewat formulir. Bila terulang, catat status permintaan yang gagal di tab Network (DevTools) dan periksa `pm2 logs ngiliyun --lines 200` serta log error Nginx situs ini.

**Lampiran: tarikan lewat API (tidak aktif).** Hanya untuk aplikasi Meta yang masih punya akses Instagram Login atau Facebook Login dengan izin `user_posts`. Callback OAuth wajib https. Nama menu di dasbor Meta sering berubah.

**API 1. Ubah Instagram menjadi akun Creator (gratis).** Di aplikasi Instagram: Profil, menu garis tiga, Pengaturan dan aktivitas, **Jenis akun dan alat**, **Beralih ke akun profesional**, pilih **Kreator**, lalu pilih kategori (misalnya Pendidik). Catatan: akun profesional selalu publik dan tidak bisa dikunci. Bisa dikembalikan ke akun pribadi kapan saja, tetapi koneksi ke situs akan berhenti.

**API 2. Buat aplikasi Meta.** Buka <https://developers.facebook.com/apps>, **Create app**. Satu aplikasi cukup untuk keduanya. Biarkan mode aplikasi **Development**: akun yang menjadi admin aplikasi boleh memakai izinnya tanpa App Review, dan itu cukup karena yang dibaca hanya akun Mas Ilyun sendiri.

1. Instagram: tambahkan use case **Manage messaging and content on Instagram**, buka **API setup with Instagram login**. Salin **Instagram app ID** dan **Instagram app secret** (berbeda dari App ID Facebook). Di **Set up Instagram business login**, isi Redirect URL `https://ngiliyun.my.id/admin/auth/instagram/callback/` (dengan garis miring di akhir). Tambahkan akun Instagram Mas Ilyun sebagai **Instagram Tester** di App roles, lalu terima undangannya di Instagram (Pengaturan, Izin situs web, Undangan penguji)
2. Facebook: tambahkan use case **Authenticate and request data from users with Facebook Login**, lalu di Permissions tambahkan `user_posts`. Di **Facebook Login, Settings**, isi Valid OAuth Redirect URIs `https://ngiliyun.my.id/admin/auth/facebook/callback/`. App ID dan App secret ada di **App settings, Basic**

**API 3. Isi `.env.production.local`, lalu `pm2 reload ngiliyun --update-env`.**

```
INSTAGRAM_APP_ID=...
INSTAGRAM_APP_SECRET=...
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...
SOCIAL_CRON_SECRET=   # openssl rand -hex 32
```

Kunci enkripsi token diturunkan dari rahasia aplikasi. Bila rahasia aplikasi diganti (Reset di dasbor Meta), token lama tidak bisa dibaca lagi; cukup klik Hubungkan ulang di CMS.

**API 4. Hubungkan dan tarik.** CMS, Pengaturan, **Media sosial**, bagian **Tarik otomatis lewat API**: klik **Hubungkan** di kartu Instagram dan Facebook, setujui di layar izin, lalu klik **Tarik sekarang**. Satu kali tarik mengambil paling banyak 30 postingan baru beserta gambarnya (disalin ke `UPLOAD_DIR`, karena tautan gambar dari Meta kedaluwarsa); tekan lagi untuk postingan yang lebih lama. Facebook bawaannya hanya menarik postingan berpemirsa Publik.

**API 5. Tarikan otomatis harian.** Selain mengambil postingan baru, cron ini memperpanjang token Instagram sehingga koneksinya tidak pernah kedaluwarsa. aaPanel: Cron, Shell Script, setiap hari:

```bash
curl -fsS -X POST -H "Authorization: Bearer ISI_SOCIAL_CRON_SECRET" https://ngiliyun.my.id/cron/social/
```

Rute `/cron/social/` mati bila `SOCIAL_CRON_SECRET` kosong atau kurang dari 32 karakter, dan diblokir di `robots.txt`.

## Memperbarui

```bash
cd /www/wwwroot/ngiliyun.my.id
git restore README.md profile src/data/github.json
git pull --ff-only
npm ci
npm run db:migrate
npm run build
pm2 reload ngiliyun
```

`git restore` wajib di awal: setiap `npm run build` menulis ulang `README.md`, gambar di `profile/`, dan `src/data/github.json` (data GitHub terbaru), sehingga tanpa langkah ini `git pull` menolak dengan pesan "Your local changes would be overwritten". Ketiganya dibuat ulang saat build, jadi aman dipulihkan.

Jangan lewati `npm ci`: rilis bisa membawa paket baru (misalnya `pdfjs-dist` untuk galeri gambar). Bila lupa, `npm run build` berhenti di awal dengan pesan `[deps] Paket di node_modules tidak sesuai package-lock.json` (`scripts/check-deps.mjs`).

Supaya aplikasi tidak dimuat ulang ketika salah satu langkah gagal, jalankan berantai dalam satu baris. `pm2 reload` hanya berjalan bila semua langkah sebelumnya berhasil:

```bash
git restore README.md profile src/data/github.json && git pull --ff-only && npm ci && npm run db:migrate && npm run build && pm2 reload ngiliyun
```

### Memperbarui Node.js

Node.js merilis tambalan keamanan beberapa kali setahun (pengumuman di <https://nodejs.org/en/blog/vulnerability>). Periksa versi dengan `node -v`, lalu perbarui ke patch terbaru di jalur yang sama:

```bash
nvm install 22 --reinstall-packages-from=current   # memasang 22.x terbaru beserta pm2
nvm alias default 22
cd /www/wwwroot/ngiliyun.my.id
npm ci
npm run build
pm2 update                                         # jalankan ulang daemon PM2 dengan Node baru
pm2 startup                                        # ikuti perintah yang dicetak, supaya systemd memakai Node baru
pm2 save
```

Bila rilis menambah koleksi baru (misalnya rencana ke depan, prinsip kerja dengan AI, serta berita dan tulisan), isi data awalnya sekali dengan `npm run db:seed -- --only=plan,principle,post`. Koleksi yang sudah berisi dilewati, jadi aman dijalankan ulang.

## Cadangan

Konten dan berkas tidak ada di repo, jadi wajib dicadangkan:

```bash
# contoh cron harian (aaPanel: Cron, Shell Script)
mysqldump --single-transaction ngiliyun_portfolio | gzip > /www/backup/ngiliyun-$(date +%F).sql.gz
tar czf /www/backup/ngiliyun-uploads-$(date +%F).tar.gz -C /www/wwwroot/ngiliyun-storage uploads
```

aaPanel juga punya fitur backup database terjadwal di menu Cron.

## Keamanan server

Aplikasi sudah mengirim header keamanan (CSP, anti clickjacking, HSTS) dan membatasi percobaan login. Bagian berikut ada di luar kode dan wajib diatur di server:

- **Jangan jalankan aplikasi sebagai root.** Buat pengguna khusus, misalnya `adduser --disabled-password ngiliyun`, ubah pemilik folder situs dan `UPLOAD_DIR` ke pengguna itu (`chown -R ngiliyun:ngiliyun ...`), lalu jalankan PM2 dari pengguna itu (`pm2 startup systemd -u ngiliyun --hp /home/ngiliyun`). Bila suatu saat ada celah eksekusi kode, penyerang hanya mendapat hak pengguna itu, bukan seluruh server
- **`UPLOAD_DIR` di luar folder situs**, dengan izin `700`. Berkas unggahan hanya boleh keluar lewat `/files/<id>/` yang memeriksa izin
- **IP asli dari Cloudflare hanya dipercaya dari Cloudflare.** `real_ip_header CF-Connecting-IP` harus disertai `set_real_ip_from` untuk setiap rentang di <https://www.cloudflare.com/ips/>, jangan pernah `0.0.0.0/0`. Tanpa batas itu siapa pun bisa mengirim header `CF-Connecting-IP` palsu
- **Firewall:** port 3005 (Next.js) dan 3306 (database) tertutup dari internet. Bila DNS diproksikan Cloudflare, izinkan port 80 dan 443 hanya dari rentang IP Cloudflare (atau aktifkan Authenticated Origin Pulls) supaya IP asli server tidak bisa dipakai untuk melewati Cloudflare
- **Database:** pengguna aplikasi hanya diberi hak pada database situs, tidak memakai root
- **SMTP:** pakai sandi aplikasi khusus (misalnya App Password Gmail), bukan sandi utama akun email. Sandi ini tersimpan di tabel `settings`, jadi berkas cadangan database harus dijaga seketat `.env.production.local`
- **aaPanel:** aktifkan 2FA, ganti port panel dan security entrance bawaan, batasi akses panel ke IP tertentu bila bisa
- **Pembaruan:** jalankan `npm audit --omit=dev` dan pantau advisori Next.js (<https://github.com/vercel/next.js/security/advisories>) serta React. Perbarui dengan `npm install next@latest react@latest react-dom@latest`, uji, lalu deploy

## Lupa kata sandi admin

```bash
npm run admin:create -- --email <email-yang-sama> --name "Ahmad Ngiliyun"
```

Kata sandi diganti dan semua sesi lama dikeluarkan.
