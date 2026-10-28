# Panduan pengembangan

Repositori ini berisi dua hal sekaligus:

1. Kode sumber situs portofolio [ngiliyun.my.id](https://ngiliyun.my.id) beserta CMS-nya (Next.js, TypeScript, Tailwind CSS, MySQL), dua bahasa di `/` dan `/en/`
2. README profil GitHub (`README.md` di akar repo) beserta gambarnya di folder `profile/`

Konten situs (profil, proyek, capaian, mengajar, garis waktu) disimpan di database MySQL dan dikelola lewat CMS di `/admin`. Hanya data berstatus **public** yang tampil di portofolio; data **privat** tetap tersimpan di CMS dan bisa dibagikan lewat tautan rahasia.

## Menjalankan

Butuh Node.js 20.9 atau lebih baru (lihat `.nvmrc`) dan MySQL 8.

```bash
npm install
cp .env.example .env.local          # isi DATABASE_URL, SITE_URL=http://localhost:3000
npm run db:migrate                  # buat tabel
npm run db:seed                     # isi konten awal dari folder seed/
npm run admin:create -- --email anda@contoh.id --name "Nama"
npm run dev
```

Buka <http://localhost:3000> untuk situs dan <http://localhost:3000/admin/> untuk CMS.

## Perintah

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Server pengembangan |
| `npm run build` | Ambil data GitHub, perbarui README, lalu build produksi |
| `npm start` | Jalankan hasil build (produksi) |
| `npm run typecheck` | Pemeriksaan TypeScript |
| `npm test` | Unit test pembangun URL LinkedIn dan teks siap tempel |
| `npm run data` | Ambil data GitHub ke `src/data/github.json`, lalu buat ulang gambar dan teks README |
| `npm run readme` | Buat ulang gambar README dan bagian teks README dari database |
| `npm run db:generate` | Buat berkas migrasi baru setelah mengubah `src/db/schema.ts` |
| `npm run db:migrate` | Terapkan migrasi di folder `drizzle/` |
| `npm run db:seed` | Isi database dari `seed/` (berhenti bila sudah berisi; `-- --force` menghapus dan mengisi ulang) |
| `npm run admin:create` | Buat akun admin atau ganti kata sandinya |

Di balik proxy (misalnya sandbox), jalankan `NODE_USE_ENV_PROXY=1 npm run data`. Opsional: set `GITHUB_TOKEN` agar batas rate limit API lebih longgar.

## CMS

| Bagian | Isi |
| --- | --- |
| Capaian | Sertifikat, pelatihan, hak cipta, buku, publikasi, hibah, reviewer, keanggotaan |
| Proyek | Proyek unggulan (kode terbuka) dan sistem yang dikembangkan (repo privat) |
| Mengajar | Kampus, mata kuliah dengan kode semester, semester, bidang keahlian mengajar |
| Profil | Perjalanan, yang saya kerjakan, di luar kode, jenis kerja sama, kanal kontak |
| Pengaturan | Profil (hero, Tentang, email, running text, tema riset), metrik riset bertanggal, serta Search Console dan Analytics (meta verifikasi Google dan Bing, berkas verifikasi HTML, ID GA4) |

Setiap data punya status public atau privat, slug (alamat), dan urutan. Tombol **Tampilkan** dan **Sembunyikan** di daftar langsung mengubah situs.

Teks antarmuka (label tombol, judul bagian) tetap di kode: situs di `src/data/profile.ts`, CMS di `src/data/admin.ts`.

### Arsitektur

| Berkas | Peran |
| --- | --- |
| `src/db/schema.ts` | Skema MySQL (Drizzle ORM): entries, settings, files, admins, sessions, login_attempts |
| `src/content/types.ts` | Tipe semua konten dan label kategori |
| `src/content/collections.ts` | Konfigurasi koleksi: field formulir, label, urutan |
| `src/content/fields.ts` | Field generik: render formulir, baca FormData, validasi |
| `src/server/content.ts` | Baca konten. `loadSite()` menyimpan salinan konten public di memori |
| `src/server/entries.ts` | Tulis konten, aturan lintas data, tautan berbagi |
| `src/server/auth/` | Kata sandi (scrypt), sesi database, login GitHub, pembatas login |
| `src/server/files.ts` | Simpan dan baca berkas unggahan di `UPLOAD_DIR` |
| `src/server/contact-action.ts` | Server Action form kontak: anti spam, simpan ke tabel `messages`, teruskan ke email |
| `src/server/messages.ts`, `mail.ts`, `turnstile.ts` | Baca dan tulis pesan, kirim email SMTP, verifikasi Cloudflare Turnstile |
| `src/lib/contact.ts` | Aturan validasi form kontak (dipakai server dan `tests/contact.test.mjs`) |
| `src/app/(admin)/admin/` | Halaman dan Server Action CMS |

Setiap halaman dan Server Action admin memanggil `requireAdmin()`. Jangan mengandalkan layout saja untuk pemeriksaan login.

### Menambah koleksi atau field

1. Tambahkan tipe di `src/content/types.ts` dan kunci koleksinya di `CollectionData`
2. Tambahkan konfigurasi di `src/content/collections.ts`. Formulir dan validasinya ikut otomatis
3. Pakai datanya di komponen lewat `loadSite()`
4. Bila butuh kolom tabel baru (jarang, karena konten disimpan sebagai JSON), ubah `src/db/schema.ts` lalu `npm run db:generate` dan `npm run db:migrate`

### Aturan data capaian

Diperiksa saat menyimpan di CMS:

- Judul dan ringkasan wajib dalam bahasa Indonesia dan Inggris (ringkasan boleh kosong untuk publikasi)
- Item public wajib punya tanggal terbit, kecuali reviewer yang masih berjalan dan keanggotaan. Jangan menebak tanggal
- Maksimal 6 sorotan beranda dan 5 HKI di tab Hak cipta beranda
- Tombol LinkedIn hanya untuk sertifikat dan pelatihan; posisi penulis hanya untuk publikasi
- URL harus https. Teks tidak boleh memuat em dash atau simbol ampersand (tulis "dan" atau "and")

Angka metrik selalu tampil bersama tanggalnya. Perbarui angka dan tanggal sekaligus; jangan membulatkan ke atas.

### Tautan berbagi

Di halaman ubah capaian, **Buat tautan berbagi** menghasilkan alamat `/s/<token>/` yang menampilkan data itu, termasuk yang privat. Halaman tersebut tidak diindeks mesin pencari dan tidak mengirim header Referer. Database hanya menyimpan hash token, jadi tautan hanya terlihat sekali saat dibuat. **Cabut tautan** membuatnya langsung tidak berlaku.

### Tombol LinkedIn

`src/lib/linkedin.ts` merakit URL `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME` dengan `URLSearchParams` sesuai panduan resmi Add to Profile. `certUrl` memakai URL verifikasi penerbit bila ada, kalau tidak halaman detail di situs. Menurut halaman bantuan LinkedIn, tombol kustom untuk penerbit baru mungkin tidak lagi mengisi formulir secara otomatis; karena itu halaman detail juga menyediakan teks siap tempel. Penambahan ke LinkedIn tetap manual: masuk, periksa isian, lalu simpan.

### Berkas sertifikat dan privasi

- Unggah lewat CMS: PDF, PNG, JPG, atau WebP, maksimal 5 MB. Jenis berkas diperiksa dari isinya, bukan dari nama
- Berkas disimpan di `UPLOAD_DIR` (di luar `public/` dan di luar repo) dan hanya bisa dibuka lewat `/files/<id>/` bila datanya public, pembukanya admin, atau membawa token berbagi yang cocok
- **Sebelum mengunggah, tutup semua data pribadi secara manual:** NIK, alamat, nomor telepon, NIDN atau NUPTK, nomor anggota, dan kode QR keanggotaan. CMS tidak bisa mendeteksinya
- Jangan memasukkan nomor kontrak hibah, anggaran, topologi atau alamat IP jaringan kampus, nama mahasiswa, nama kolega atau atasan, isi telaah naskah, atau penelitian yang belum terbit ke data public. Bila ragu, biarkan privat

## Data awal (seed)

Folder `seed/` berisi konten awal yang dimasukkan sekali dengan `npm run db:seed`. Setelah database terisi, ubah konten lewat CMS, bukan lewat berkas ini. `npm run db:seed -- --force` menghapus semua konten dan pengaturan di database lalu mengisi ulang dari `seed/`.

## README profil

- Teks pembuka, tabel "Yang saya kerjakan", dan ajakan kolaborasi ditulis langsung di `README.md`
- Bagian di antara penanda `<!-- proyek:mulai -->`, `<!-- capaian:mulai -->`, `<!-- mengajar:mulai -->`, dan `<!-- perjalanan:mulai -->` dibangkitkan oleh `scripts/readme-sections.mjs` dari konten **public** di database. Jangan mengedit isi di antara penanda secara manual. Tanpa `DATABASE_URL`, bagian ini dilewati
- Gambar dibuat oleh `scripts/readme-assets.mjs`:
  - `profile/banner.svg` banner nama dengan plot K-Means beranimasi
  - `profile/marquee.svg` running text teknologi dan topik
  - `profile/stats.svg` statistik kontribusi dan grafik per bulan
- Font disematkan dari `profile/fonts/` (subset statis Bricolage Grotesque dan Instrument Sans, lisensi OFL)
- Setelah mengubah konten di CMS, jalankan `npm run readme` di komputer yang terhubung ke database, lalu commit `README.md` dan gambar yang berubah

## Skrip dan berkas TypeScript

Skrip Node membaca berkas `.ts` lewat `scripts/lib/load-ts.mjs`, yang mentranspilasi dengan paket `typescript` dari devDependencies. Karena itu `src/data/profile.ts`, `src/content/types.ts`, `src/lib/linkedin.ts`, dan berkas di `seed/` hanya boleh memuat `import type`, bukan impor nilai.

## Data GitHub

`scripts/fetch-github.mjs` mengambil profil, repositori, dan grafik kontribusi saat build. Setiap bagian yang gagal diambil memakai data lama di `src/data/github.json`, jadi build tidak pernah gagal karena skrip ini.

## Deploy

Lihat [docs/DEPLOY.md](./DEPLOY.md) (VPS aaPanel, PM2, Nginx, cadangan).

## Aksesibilitas

Tautan lompat ke konten, fokus keyboard terlihat, atribut `lang` per halaman, label untuk grafik dan plot, saringan dengan `aria-pressed`, jumlah hasil yang diumumkan ke pembaca layar, tautan tab baru yang dijelaskan, formulir CMS dengan label, pesan galat yang terhubung ke field, dan semua animasi (termasuk gambar README) mengikuti pengaturan "kurangi gerakan" di perangkat.

## Rilis

Versi mengikuti [Semantic Versioning](https://semver.org/lang/id/) dan dicatat di `CHANGELOG.md`.

1. Tambahkan bagian versi baru di `CHANGELOG.md`
2. Jalankan `npm version X.Y.Z --no-git-tag-version` untuk menaikkan versi di `package.json` dan `package-lock.json`
3. Commit, lalu buat tag `vX.Y.Z` dan push beserta tagnya
4. Buat rilis GitHub dari tag tersebut, isi catatannya dari `CHANGELOG.md`
