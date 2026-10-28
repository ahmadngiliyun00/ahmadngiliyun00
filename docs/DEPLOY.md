# Deploy ke VPS aaPanel

Situs dan CMS adalah satu aplikasi Next.js (`next start`) yang membaca MySQL. Panduan ini untuk VPS Ubuntu dengan aaPanel, Node.js lewat NVM, PM2, dan Nginx sebagai reverse proxy.

## 1. Siapkan server

- Node.js 22 (lewat NVM atau Node.js Manager di aaPanel) dan PM2 (`npm i -g pm2`)
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
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` | SMTP untuk meneruskan pesan form kontak (langkah 7), boleh kosong |
| `CONTACT_TO` | `ahmad@ngiliyun.my.id` |
| `CONTACT_IP_SALT` | teks acak panjang, misalnya hasil `openssl rand -hex 32` |
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

**b. Penerusan pesan form ke email (mengirim email).** Isi variabel SMTP di `.env.production.local`, lalu `pm2 reload ngiliyun`. Pilihan paling cepat adalah Gmail:

1. Aktifkan Verifikasi 2 Langkah di akun Google, lalu buat Sandi Aplikasi di <https://myaccount.google.com/apppasswords>
2. `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`, `SMTP_SECURE=true`, `SMTP_USER` dan `MAIL_FROM` = alamat Gmail, `SMTP_PASS` = sandi aplikasi 16 huruf
3. `CONTACT_TO=ahmad@ngiliyun.my.id` (diteruskan Cloudflare ke Gmail) atau langsung alamat Gmail

Email notifikasi memakai Reply-To pengunjung, jadi tombol Balas langsung menuju pengirim. Untuk membalas dengan nama pengirim `ahmad@ngiliyun.my.id`, tambahkan alamat itu di Gmail lewat Setelan, Akun, Kirim email sebagai (memakai SMTP Gmail yang sama). Bila nanti ingin mengirim langsung dari domain, ganti SMTP ke layanan yang mendukung domain sendiri (misalnya Resend atau Zoho Mail) tanpa mengubah kode.

**c. Anti robot (opsional).** Dasbor Cloudflare, menu Turnstile, Add widget, domain `ngiliyun.my.id`, mode Managed. Isi `NEXT_PUBLIC_TURNSTILE_SITE_KEY` dan `TURNSTILE_SECRET_KEY`, lalu `npm run build` dan `pm2 reload ngiliyun` (kunci situs dibaca saat build). Tanpa Turnstile, form tetap dilindungi kolom jebakan, jebakan waktu 3 detik, batas 3 tautan, dan maksimal 5 pesan per IP per jam.

Pembatas per IP membutuhkan IP asli pengunjung, jadi pastikan pengaturan `real_ip_header` di langkah 5 sudah terpasang bila DNS diproksikan Cloudflare.

## Memperbarui

```bash
cd /www/wwwroot/ngiliyun.my.id
git pull
npm ci
npm run db:migrate
npm run build
pm2 reload ngiliyun
```

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
