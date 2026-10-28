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
| `CONTACT_IP_SALT` | teks acak panjang, misalnya hasil `openssl rand -hex 32`. Dipakai untuk hash IP form kontak, komentar, dan hitungan pembaca |
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
pm2 start npm --name ngiliyun -- start -- -p 3005
pm2 save
pm2 startup               # ikuti perintah yang dicetak agar PM2 hidup lagi setelah reboot
```

Jalankan **satu instans saja** (mode fork, bukan cluster). Cache konten disimpan di memori proses dan dibuang setiap kali CMS menyimpan perubahan; dengan beberapa instans, instans lain tidak tahu ada perubahan.

## 5. Nginx (aaPanel: Website, Add site, lalu Config)

Tambahkan di dalam blok `server` situs `ngiliyun.my.id`:

```nginx
client_max_body_size 8m;

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

- `Host` wajib diteruskan apa adanya. Server Action Next.js menolak permintaan bila Origin dan Host tidak cocok
- SSL: pakai Let's Encrypt dari aaPanel, atau sertifikat Origin Cloudflare bila DNS diproksikan
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

**b. Sitemap.** Di Search Console, menu Sitemaps, kirim `sitemap.xml`. Sitemap dibuat otomatis dari database: hanya beranda, arsip, dan halaman detail capaian yang **public** (versi Indonesia dan Inggris, dengan tanggal ubah terakhir). Pasangan bahasa (hreflang) ada di `<head>` setiap halaman, bukan di sitemap, jadi browser menampilkan sitemap sebagai pohon XML biasa. Data privat tidak pernah masuk, dan `robots.txt` memblokir `/admin/`, `/s/`, `/en/s/`, serta `/files/`. Tidak perlu mengirim ulang sitemap setiap kali konten berubah.

**c. Google Analytics 4.** Buka <https://analytics.google.com>, Admin, Buat properti, lalu Aliran data Web dengan URL `https://ngiliyun.my.id`. Salin ID pengukuran (`G-XXXXXXXXXX`) ke CMS. Script hanya dipasang di beranda, arsip, dan detail capaian; tidak di CMS dan tidak di tautan berbagi rahasia, jadi token berbagi tidak terkirim ke Google. Kunjungan saat Mas Ilyun sedang masuk CMS tidak dihitung. Analytics memasang cookie pengunjung, jadi bila nanti dibutuhkan, tambahkan pemberitahuan privasi di situs.

**d. Bing Webmaster (opsional).** Di <https://www.bing.com/webmasters>, cara tercepat adalah Import dari Google Search Console. Bila memilih tag meta, tempel tag `msvalidate.01` ke isian Bing Webmaster di CMS.

## Memperbarui

```bash
cd /www/wwwroot/ngiliyun.my.id
git pull
npm ci
npm run db:migrate
npm run build
pm2 reload ngiliyun
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

## Lupa kata sandi admin

```bash
npm run admin:create -- --email <email-yang-sama> --name "Ahmad Ngiliyun"
```

Kata sandi diganti dan semua sesi lama dikeluarkan.
