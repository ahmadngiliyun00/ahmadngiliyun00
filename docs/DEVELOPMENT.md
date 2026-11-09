# Panduan pengembangan

Repositori ini berisi dua hal sekaligus:

1. Kode sumber situs portofolio [ngiliyun.my.id](https://ngiliyun.my.id) beserta CMS-nya (Next.js, TypeScript, Tailwind CSS, MySQL), dua bahasa di `/` dan `/en/`
2. README profil GitHub (`README.md` di akar repo) beserta gambarnya di folder `profile/`

Konten situs (profil, proyek, capaian, mengajar, garis waktu) disimpan di database MySQL dan dikelola lewat CMS di `/admin`. Hanya data berstatus **public** yang tampil di portofolio; data **privat** tetap tersimpan di CMS dan bisa dibagikan lewat tautan rahasia.

## Menjalankan

Butuh Node.js 22.23.4, 24.22.1, atau lebih baru (lihat `.nvmrc` dan `engines` di `package.json`) dan MySQL 8.

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
| `npm test` | Unit test URL LinkedIn, form kontak, template email, rich text, hitungan pembaca, komentar, isian dua bahasa, JSON-LD, aturan beranda, teks SEO bawaan, tautan Google Drive, ekspor dan impor lembar kerja, media sosial, serta galeri gambar |
| `npm run data` | Ambil data GitHub ke `src/data/github.json`, lalu buat ulang gambar dan teks README |
| `npm run readme` | Buat ulang gambar README dan bagian teks README dari database |
| `npm run errors` | Buat ulang halaman error statis untuk Nginx di `public/errors/` (500, 502, 503, 504) |
| `npm run db:generate` | Buat berkas migrasi baru setelah mengubah `src/db/schema.ts` |
| `npm run db:migrate` | Terapkan migrasi di folder `drizzle/` |
| `npm run db:seed` | Isi database dari `seed/` (berhenti bila sudah berisi; `-- --force` menghapus dan mengisi ulang; `-- --only=plan,principle,post` mengisi koleksi tertentu yang masih kosong) |
| `npm run admin:create` | Buat akun admin atau ganti kata sandinya |

Di balik proxy (misalnya sandbox), jalankan `NODE_USE_ENV_PROXY=1 npm run data`. Opsional: set `GITHUB_TOKEN` agar batas rate limit API lebih longgar.

## Halaman situs

Beranda sengaja ringkas: tujuh bagian yang menjawab siapa, keahlian apa, bukti terbaik apa, dan cara menghubungi. Isi yang lebih dalam ada satu klik dari beranda.

| Halaman | Indonesia | Inggris | Isi |
| --- | --- | --- | --- |
| Beranda | `/` | `/en/` | Hero dengan plot K-Means, Tentang singkat (empat bidang kerja, alat utama), Jelajahi, tiga proyek unggulan, sorotan capaian, Kabar terbaru (dua kabar dan dua postingan media sosial), Kontak |
| Proyek | `/proyek/` | `/en/projects/` | Proyek unggulan lengkap, sistem yang dikembangkan, terbaru di GitHub, kontribusi dan di luar kode, teknologi dan topik |
| Riset dan Publikasi | `/riset/` | `/en/research/` | Angka sitasi bertanggal, tema, profil riset, hibah, reviewer jurnal, publikasi per tahun |
| Mengajar | `/mengajar/` | `/en/teaching/` | Dua kampus, mata kuliah semester ini dan yang pernah diampu, materi, bidang keahlian mengajar |
| Perjalanan | `/perjalanan/` | `/en/journey/` | Garis waktu, lalu Arah ke depan (rencana lima tahun, cara bekerja dengan AI, sedang didalami) |
| Sertifikat | `/sertifikat/` | `/en/certificates/` | Arsip capaian dengan pencarian dan saringan, halaman detail per capaian |
| Kabar | `/kabar/` | `/en/news/` | Arsip liputan, tulisan, dan kabar |
| Media sosial | `/media-sosial/` | `/en/social/` | Postingan public dari Instagram, Facebook, dan LinkedIn, dikelompokkan per topik |

- Halaman dalam memakai `SubpageShell` (header, tautan kembali ke beranda, footer) dan `PageHead` (breadcrumb "Beranda / Judul", satu h1, kalimat pembuka, data terstruktur BreadcrumbList)
- Alamat halaman, menu header, dan tautan footer diatur di `src/lib/nav.ts`. Menu desktop tampil mulai lebar 1024px; di bawahnya menu ponsel yang ditutup dengan Escape
- Jangkar beranda lama (`/#research`, `/#teaching`, `/#journey`, `/#next`, `/#activity`) dialihkan ke halaman barunya oleh `LegacyAnchors`. Tautan berawalan `#` di koleksi Di luar kode diarahkan dengan `sectionHref`
- Di ponsel, kartu proyek, sorotan, dan kabar di beranda menjadi baris geser (kelas `snap-row`) supaya beranda tidak memanjang

### Halaman error

| Kode | Kapan | Berkas |
| --- | --- | --- |
| 404 | Alamat tidak dikenal atau `notFound()` (data tidak ada, privat, atau tautan berbagi dicabut) | `(id)/not-found.tsx`, `(en)/en/not-found.tsx`, `(admin)/admin/not-found.tsx`, rute penampung `[...missing]` |
| 500 | Galat saat merender halaman | `(id)/error.tsx`, `(en)/en/error.tsx`, `(admin)/admin/error.tsx` |
| 500 | Galat di root layout | `src/app/global-error.tsx` (memasang `<html>` sendiri, bahasa ditebak dari alamat) |
| 500, 502, 503, 504 | Aplikasi tidak menjawab, disajikan Nginx | `public/errors/*.html`, dibuat `npm run errors` |

Semua memakai `ErrorView`: kode besar beranimasi, kalimat bahwa ini halaman error, rincian (kode, alamat, kode referensi `error.digest` untuk dicari di `pm2 logs`), kemungkinan penyebab, dan tombol Kembali, Ke beranda, serta Coba lagi untuk 500. Situs memiliki beberapa root layout, jadi 404 untuk alamat tak dikenal memakai rute `[...missing]` yang memanggil `notFound()`, bukan `global-not-found`. Pemasangan Nginx ada di `docs/DEPLOY.md` langkah 5.

## CMS

| Bagian | Isi |
| --- | --- |
| Capaian | Sertifikat, pelatihan, hak cipta, buku, publikasi, hibah, reviewer, keanggotaan. Bukti bisa berupa berkas unggahan atau tautan Google Drive |
| Kabar | Berita dan tulisan: liputan media (wajib media dan tautan sumber), tulisan sendiri, kabar singkat. Isi lengkap (editor rich text) membuat halaman `/kabar/<slug>/`; tanpa isi, kartu menaut ke sumber. Statistik pembaca tampil di halaman ubah |
| Komentar | Moderasi komentar tulisan di `/admin/komentar/`: menunggu, disetujui, spam. Membalas sekaligus menyetujui |
| Proyek | Proyek unggulan (kode terbuka) dan sistem yang dikembangkan (repo privat) |
| Mengajar | Kampus, mata kuliah dengan kode semester, semester, bidang keahlian mengajar |
| Profil | Perjalanan, yang saya kerjakan, di luar kode, jenis kerja sama (judulnya menjadi topik formulir, keterangannya tampil saat dipilih), rencana ke depan, prinsip kerja dengan AI, kanal kontak (tanda "Tampil di kontak beranda", bawaan LinkedIn, GitHub, ORCID, YouTube) |
| Pengaturan | Profil (hero, Tentang, email, daftar teknologi, alat utama di beranda, topik, tema riset), metrik riset bertanggal, Bahasa (bahasa utama isian dua bahasa), SEO dan Search Console (judul, deskripsi, dan kata kunci beranda, arsip, Proyek, Riset, Mengajar, dan Perjalanan dengan pratinjau hasil Google, meta verifikasi Google dan Bing, berkas verifikasi HTML, ID GA4), serta Email dan SMTP untuk meneruskan pesan form kontak |

Setiap data punya status public atau privat, slug (alamat), dan urutan. Tombol **Tampilkan** dan **Sembunyikan** di daftar langsung mengubah situs. **Ekspor Excel** dan **Impor** di setiap daftar memperbarui banyak data sekaligus lewat lembar kerja.

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

### Notifikasi dan formulir

- Umpan balik aksi (tersimpan, dihapus, gagal) memakai toast, bukan kotak di halaman. Dari komponen client panggil `toast(pesan, "success" | "error" | "info")` dari `src/components/Toaster.tsx`. Dari halaman server setelah redirect (misalnya `?deleted=1`), pasang `<FlashToast message=... clear={["deleted"]} />`; parameternya dibuang dari alamat supaya toast tidak muncul lagi saat dimuat ulang
- Toast sukses tampil 4 detik dan galat 8 detik, berhenti saat disorot atau difokus. Galat validasi juga tampil di bawah isiannya dan isian pertama yang salah difokus
- Kondisi yang menetap (misalnya tabel belum dimigrasi atau SMTP belum diatur) tetap ditulis sebagai catatan di halaman, bukan toast
- Server Action simpan memanggil `revalidatePath("/admin", "layout")` setelah berhasil. React mengosongkan formulir ke nilai awal setelah action berhasil, jadi tanpa ini formulir tampak kosong walau data sudah tersimpan

### Isian dua bahasa

Bahasa utama diatur di Pengaturan, **Bahasa** (bawaan Indonesia). Formulir CMS menampilkan bahasa utama lebih dulu; tombol globe di setiap isian membuka bahasa lain, dan tab bahasa di atas formulir membuka semua isian berdampingan. Warna globe: hijau semua bahasa terisi, merah terjemahan belum lengkap, abu-abu belum diisi.

- Isian dua bahasa yang wajib cukup diisi dalam bahasa utama, dan isian apa pun tidak boleh hanya berisi bahasa lain (`readFields` di `src/content/fields.ts`)
- `loadSite()` mengisi terjemahan yang kosong dengan teks bahasa utama (`fillLocalized` di `src/lib/i18n.ts`), kecuali isi lengkap tulisan (`body`): tulisan tanpa terjemahan tidak punya halaman di bahasa itu. Pengaturan SEO juga tidak diisi otomatis, karena kosong berarti memakai teks bawaan bahasa itu
- Daftar CMS memberi lencana "Terjemahan belum lengkap" dengan nama isiannya (`translationGaps`)

### Kabar: editor, pembaca, dan komentar

- **Editor** (`src/components/admin/RichTextEditor.tsx`, Tiptap) dipakai field berjenis `richtext`. Isinya HTML per bahasa, dikirim lewat event `formdata`. Aturan pembersihan HTML ada di `src/lib/richtext.ts` dan dijalankan oleh `src/server/richtext.ts` saat disimpan dan saat dirender. Gambar hanya boleh dari `/files/<id>/`: gambar dari situs lain dan base64 dibuang. Isi lama berupa teks biasa tetap tampil
- **Gambar di dalam isi** diperkecil di peramban (lebar maksimal 1600 px, WebP atau JPEG), diunggah lewat `uploadInlineImageAction`, lalu dikaitkan ke tulisan lewat `files.entry_id` saat disimpan (`syncInlineFiles`). Gambar yang dibuang dari isi ikut dihapus. Gambar dari tulisan baru yang tidak pernah disimpan tetap tertinggal tanpa pemilik
- **Pembaca** (`post_views`, `src/server/views.ts`, aturan di `src/lib/views.ts`): komponen `ViewBeacon` mengirim ke `/api/views/` setelah halaman terlihat 2 detik. Satu baris per pengunjung per tulisan per hari WIB; pengunjung dikenali lewat hash harian IP dan user agent dengan garam `CONTACT_IP_SALT`. Robot, admin yang sedang masuk, permintaan dari situs lain, dan lebih dari 300 kiriman per IP per jam diabaikan
- **Komentar** (`comments`, `src/server/comments.ts`, `src/server/comment-action.ts`, aturan di `src/lib/comment.ts`): selalu menunggu persetujuan, kolom jebakan, jebakan waktu 3 detik, maksimal 2 tautan, 3 komentar per IP per 10 menit. Email pengomentar tidak pernah dirender di situs

### Galeri gambar (carousel)

Berita dan tulisan (isian Galeri gambar) dan postingan media sosial (isian Gambar tambahan) bisa berisi beberapa gambar yang tampil sebagai slide.

- **Isian `gallery`** (`src/content/fields.ts`): daftar item `{ file, alt? }` sesuai urutan tampil, paling banyak 20 (`GALLERY_MAX`). `alt` adalah teks alternatif per gambar dalam dua bahasa, opsional. Data lama berupa ID saja tetap terbaca (`galleryItems`). Aturan murninya di `src/lib/gallery.ts` dan diuji `tests/gallery.test.mjs`
- **Teks alternatif di situs** (`slideImages`): teks gambar itu sendiri, kalau kosong teks alternatif umum (`imageAlt`) ditambah nomor gambar, kalau keduanya kosong `alt=""` (hiasan)
- **CMS** (`src/components/admin/GalleryInput.tsx`): pilih atau seret banyak berkas sekaligus. Gambar diperkecil di peramban (`image-shrink.ts`) lalu diunggah satu per satu lewat `uploadInlineImageAction`, jadi batas 6 MB per permintaan tidak terlampaui. PDF dipecah menjadi satu gambar per halaman dengan pdf.js di peramban (`pdf-pages.ts`), cocok untuk dokumen carousel LinkedIn. Urutan disusun dengan menyeret kartu atau tombol panah; gambar pertama menjadi sampul. Urutan baru tersimpan saat formulir disimpan
- **Server** (`saveEntry`): galeri hanya menerima berkas yang belum berpemilik atau milik data itu sendiri, mengaitkannya lewat `files.entry_id`, dan menghapus gambar yang dilepas dari galeri. Izin akses berkas mengikuti status data (public atau privat)
- **Situs** (`src/components/MediaCarousel.tsx`): berganti otomatis tiap 3 detik (`SLIDE_MS`), bisa digeser (scroll-snap), tombol kiri dan kanan, titik indikator (sampai 10 gambar) dan penghitung "2 / 5", tombol jeda. Berhenti sementara saat kursor di atasnya, saat ada fokus keyboard, saat tidak terlihat, atau tab tidak aktif. Dengan `prefers-reduced-motion` tidak berputar sendiri. Satu gambar tampil diam tanpa kontrol
- Kartu memakai bingkai berasio tetap dan gambar ditampilkan utuh (`contain`) supaya halaman PDF terbaca; halaman tulisan mengikuti rasio gambar pertama (antara 16:9 dan 4:5)
- Postingan media sosial: sumber gambar dipilih lewat tab Gambar postingan (isian `imageMode`): Tautan gambar, Satu gambar, atau Beberapa gambar (carousel). Hanya tab yang dipilih yang tampil (`socialSlides`); isi tab lain tetap tersimpan. Data lama tanpa `imageMode` ditebak oleh `imageModeOf` (tautan, lalu unggahan, lalu galeri)
- Gambar pertama galeri tulisan menjadi gambar pratinjau saat dibagikan (Open Graph) dan `image` di JSON-LD

### Gambar: placeholder, ukuran, dan cache

- **Placeholder skeleton:** semua gambar dan sematan situs memakai `LazyImage` (gambar), `LazyIframe` (pratinjau Google Drive), atau `PostBody` (gambar di isi tulisan). Selama diunduh, bingkai menampilkan blok abu-abu dengan kilau bergerak ke kanan, lalu gambar muncul perlahan. Kilau ada di latar, di belakang gambar, jadi tanpa JavaScript gambar tetap tampil. Gambar dari cache langsung tampil tanpa efek; `prefers-reduced-motion` mematikan kilau dan efek muncul. Gambar baru di situs wajib memakai komponen ini, bukan `<img>` langsung
- **Ukuran:** semua unggahan gambar diperkecil di peramban lewat `src/components/admin/image-shrink.ts` (lebar maksimal 1600 px, WebP atau JPEG): isian berkas (`FileDrop` dengan `shrinkImages`), galeri, editor rich text, dan impor ZIP ekspor media sosial. Batas 5 MB diperiksa setelah diperkecil
- **Cache:** `/files/<id>/` memberi ETag `"<id>-<ukuran>"` dan menjawab 304 untuk berkas public, dengan `Cache-Control: public, max-age=86400, stale-while-revalidate=604800`. Isi berkas tidak pernah berubah untuk ID yang sama. Berkas privat tetap `private, no-store` tanpa ETag

### Menambah koleksi atau field

1. Tambahkan tipe di `src/content/types.ts` dan kunci koleksinya di `CollectionData`
2. Tambahkan konfigurasi di `src/content/collections.ts`. Formulir dan validasinya ikut otomatis. Formulir memakai grid 12 kolom di desktop: lebar bawaan ditentukan `fieldWidth()` di `src/content/fields.ts` (teks pendek setengah, angka seperempat, centang sepertiga, teks panjang penuh) dan bisa diubah dengan `width`. Urutkan field supaya isian pendek berpasangan. Placeholder dibuat otomatis dari jenis dan label, atau tulis sendiri dengan `placeholder`
3. Pakai datanya di komponen lewat `loadSite()`
4. Bila butuh kolom tabel baru (jarang, karena konten disimpan sebagai JSON), ubah `src/db/schema.ts` lalu `npm run db:generate` dan `npm run db:migrate`
- **Isian bertab:** beri select `tabs: true`, lalu tandai isian anggotanya dengan `tab: { of: "<nama select>", show: ["<nilai tab>"] }`. Isian tanpa `show` tampil di bawah semua tab. `FieldTabs` (`src/components/admin/FieldTabs.tsx`) merender tab navigasi; panel yang tidak aktif hanya disembunyikan, isinya tetap ikut terkirim. Setelah simpan gagal, tab yang berisi galat terbuka sendiri dan ditandai titik merah


### Aturan data capaian

Diperiksa saat menyimpan di CMS:

- Judul dan ringkasan wajib dalam bahasa utama (ringkasan boleh kosong untuk publikasi); terjemahannya boleh menyusul
- Item public wajib punya tanggal terbit, kecuali reviewer yang masih berjalan dan keanggotaan. Jangan menebak tanggal
- Maksimal 6 sorotan beranda dan 5 HKI di tab Hak cipta beranda. Beranda menampilkan tiga terbaru dari masing-masing
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
- Semua berkas, termasuk yang public, dikirim dengan `X-Robots-Tag: noindex, nofollow`, jadi tidak pernah muncul di Google atau Google Gambar. `/files/` sengaja tidak diblokir di `robots.txt` supaya header itu terbaca, halaman dirender Google lengkap dengan gambarnya, dan gambar pratinjau tautan (og:image) bisa diambil LinkedIn dan X
- **Sebelum mengunggah, tutup semua data pribadi secara manual:** NIK, alamat, nomor telepon, NIDN atau NUPTK, nomor anggota, dan kode QR keanggotaan. CMS tidak bisa mendeteksinya
- Jangan memasukkan nomor kontrak hibah, anggaran, topologi atau alamat IP jaringan kampus, nama mahasiswa, nama kolega atau atasan, isi telaah naskah, atau penelitian yang belum terbit ke data public. Bila ragu, biarkan privat

### Bukti sertifikat dari Google Drive

Isian **Tautan Google Drive** di formulir capaian menampilkan pratinjau berkas di halaman detail (bagian `#bukti`), dan kartu di beranda serta arsip mendapat tombol **Lihat bukti**.

- Terima tautan berbagi (`.../file/d/<id>/view?usp=sharing`), tautan pratinjau, bentuk lama `open?id=` dan `uc?id=`, atau kode `<iframe>` dari menu Sematkan item. Yang disimpan selalu `https://drive.google.com/file/d/<id>/view`, ditambah `resourcekey` untuk berkas lama. Tautan folder ditolak (`src/lib/drive.ts`)
- Di Google Drive, atur akses berkas ke **Siapa saja yang memiliki link** (Pelihat). Bila hanya ingin bisa dilihat, buka Setelan berbagi lalu matikan **Pelihat dan pemberi komentar dapat melihat opsi untuk mendownload, mencetak, dan menyalin**. Pratinjau Drive tetap punya tombol buka di jendela baru; yang bisa dicegah hanya unduhan langsung
- Berkas di Drive juga wajib sudah disensor dari data pribadi, sama seperti berkas unggahan
- Bila satu capaian punya berkas unggahan dan tautan Drive, berkas unggahan yang tampil
- Pratinjau disematkan sebagai iframe `drive.google.com/.../preview` dengan atribut `sandbox`; domain itu sudah ada di `frame-src` CSP

### Ekspor dan impor lembar kerja

Setiap koleksi punya tombol **Ekspor Excel** dan **Impor** di halaman daftarnya. Contoh untuk sertifikat: ekspor, isi kolom Tautan Google Drive yang masih kosong di Excel, Google Sheets, atau Numbers, lalu impor kembali.

- Berkas ekspor (`/admin/<koleksi>/export/`) berisi semua data, public dan privat, di lembar Data, serta lembar Petunjuk yang menjelaskan setiap kolom. Semua sel berformat Teks supaya nomor panjang tidak berubah menjadi 1,23E+17. Pilihan (status, kategori, ya atau tidak) tersedia sebagai dropdown
- Judul kolom berbentuk `Label [kunci]`; kunci sama dengan nama isian formulir (`title.id`, `issued.year`). Kolom `slug` mencocokkan baris dengan data di CMS; baris tanpa slug menjadi data baru (privat bila status kosong)
- **Sel kosong tidak mengubah data.** Menghapus isian tetap lewat formulir CMS. Berkas unggahan dan isi rich text tidak ikut lembar kerja dan tidak pernah berubah karena impor
- Impor menerima `.xlsx` atau `.csv` (koma atau titik koma), maksimal 5 MB dan 1000 baris. **Periksa berkas** menampilkan pratinjau per baris (baru, diubah, bermasalah, beserta isian yang berubah) tanpa menyimpan. **Terapkan** menghitung ulang dari data terbaru lalu menyimpan baris satu per satu lewat `saveEntry`, jadi validasi dan aturan CMS (misalnya batas sorotan beranda) tetap berlaku. Baris yang gagal dilaporkan, sisanya tetap tersimpan
- Pembanding perubahan adalah hasil menyimpan ulang data lama tanpa perubahan, sehingga mengunggah berkas ekspor apa adanya selalu menghasilkan nol perubahan
- Berkas Excel ditulis dan dibaca tanpa pustaka tambahan (`src/lib/xlsx.ts`, zlib bawaan Node). Konversi baris dan isian formulir di `src/lib/transfer.ts`, ekspor dan impor di `src/server/transfer.ts`

### Media sosial

Postingan Instagram, Facebook, dan LinkedIn milik Mas Ilyun masuk ke koleksi `social` (Kabar, Postingan media sosial) dan tampil di halaman `/media-sosial/`. Cara utamanya impor ZIP ekspor data; tarikan lewat API tidak dipakai karena Instagram Login tidak lagi tersedia untuk aplikasi Meta baru (`docs/DEPLOY.md` bagian 9).

- Impor ekspor (`SocialExportImport`, kartu Impor dari ekspor data): peramban membaca ZIP lewat `src/lib/zip-reader.ts` (Blob.slice dan `DecompressionStream`, mendukung ZIP64), mengenali jenis arsip dan membaca postingan lewat `src/lib/social-export.ts` (`detectExport`, `parseInstagramExport`, `parseFacebookExport`, `fixMetaText`). Server Action `importExportAction` menerima daftar postingan per 200 (divalidasi ulang `validatePayload` di `src/server/social/import.ts`), lalu `attachExportImageAction` menerima gambar sampul satu per satu. ZIP tidak pernah dikirim ke server
- Instagram: `posts.json` berlabel (ID `fbid`, Caption, Published, Draft) digabung dengan `posts_1.json` format lama (daftar gambar carousel lengkap) bila waktunya berselisih paling banyak 5 detik. Facebook tidak punya ID, jadi `derivedSourceId` memakai waktu dan nama berkas media pertama, atau hash teks. Pemilik akun dibaca dari awalan judul (`ownerName`); postingan di profil orang lain dan berbagi tanpa isi sendiri dilewati
- Gambar kartu: `imageUrl` (Tautan gambar) didahulukan, lalu `fileId` (unggahan), lalu tanpa gambar. Saat disimpan, `checkRules` mengubah tautan berbagi Drive lewat `driveImageUrl` dan menolak tautan CDN LinkedIn atau Meta yang kedaluwarsa (`imageLinkProblem`)
- Unggah berkas di CMS memakai `FileDrop` (drag and drop, pratinjau, validasi jenis dan ukuran di peramban; validasi server tetap berlaku)
- Peringatan untuk diperiksa disimpan di isian `importNote` (hanya CMS). Isian `url` opsional; kartu tanpa `url` menaut ke `profiles.<platform>` di Pengaturan, Media sosial, dan `checkRules` menolak public bila keduanya kosong
- Semua aturan murni ini diuji `tests/social-export.test.mjs` dengan fixture buatan. Jangan menyalin isi ekspor asli ke repo

- Tarikan lewat API (tidak aktif, kode tetap ada): Pengaturan, Media sosial (`/admin/settings/social/`, panel `SocialConnections`). OAuth di `/admin/auth/instagram/` dan `/admin/auth/facebook/` (beserta `callback/`), wajib login admin dan memakai state acak di cookie. Kredensial aplikasi dari variabel lingkungan (`src/server/social/config.ts`)
- Token disimpan di tabel `settings` kunci `social-auth`, dienkripsi AES-256-GCM dengan kunci HKDF dari rahasia aplikasi (`src/server/social/store.ts`). Kunci ini tidak terdaftar di `settingsConfigs`, jadi tidak punya formulir dan tidak ikut `loadSite()`. Panggilan Facebook memakai `appsecret_proof`
- Tarikan (`src/server/social/sync.ts`): hasil selalu data privat, paling banyak 30 postingan baru per tarikan, postingan yang sudah ada tidak ditimpa, dan postingan yang dihapus di CMS dicatat di `social-auth.ignored` supaya tidak masuk lagi. Gambar hanya diunduh dari CDN Meta (`isAllowedMediaUrl`) lalu disimpan lewat `saveUpload` sebagai `fileId`
- Caption dibersihkan `cleanCaption` (`src/lib/social.ts`): emoji dibuang, em dash dan ampersand diganti, tagar dipindah ke isian `tags`. Aturan topik (`kata kunci | Nama topik`) di Pengaturan, Media sosial mengisi isian `topic`. Semua aturan murni ini diuji `tests/social.test.mjs`
- LinkedIn tidak punya API baca untuk profil pribadi, jadi diimpor dari `Shares.csv` ekspor data (`parseLinkedinShares`), lewat ZIP arsip di kartu impor ekspor atau berkas CSV-nya saja, atau diisi manual di CMS
- Tarikan terjadwal: `POST /cron/social/` dengan `Authorization: Bearer <SOCIAL_CRON_SECRET>`. Sekaligus memperpanjang token Instagram (paling sering sekali sehari)

### Header keamanan

`next.config.ts` mengirim header keamanan ke semua halaman: Content Security Policy, `X-Frame-Options: DENY` (CMS tidak bisa dibingkai situs lain), `nosniff`, `Referrer-Policy`, `Permissions-Policy`, dan HSTS bila `SITE_URL` memakai https. Berkas `/files/` hanya boleh dibingkai situs sendiri, untuk pratinjau PDF.

Gambar (`img-src`) boleh dari https mana pun, karena Tautan gambar postingan media sosial bisa menunjuk ke host apa saja; gambar itu dimuat dengan `referrerPolicy="no-referrer"`. CSP hanya mengizinkan skrip dari situs sendiri, Google Analytics, Cloudflare Turnstile, dan Cloudflare Web Analytics (`static.cloudflareinsights.com`, kirim data ke `cloudflareinsights.com`; disisipkan Cloudflare bila Web Analytics aktif di dasbor), serta iframe dari Turnstile dan Google Drive (pratinjau sertifikat). Skrip, gambar, iframe, atau tujuan `fetch` dari domain lain akan diblokir peramban sampai domainnya ditambahkan ke CSP. Periksa konsol peramban setelah menambah layanan pihak ketiga.

## Data awal (seed)

Folder `seed/` berisi konten awal yang dimasukkan sekali dengan `npm run db:seed`. Setelah database terisi, ubah konten lewat CMS, bukan lewat berkas ini. `npm run db:seed -- --force` menghapus semua konten dan pengaturan di database lalu mengisi ulang dari `seed/`. Untuk koleksi baru di database yang sudah berisi, pakai `npm run db:seed -- --only=<koleksi>`; koleksi yang sudah berisi dilewati.

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

Tautan lompat ke konten, breadcrumb di halaman dalam, satu h1 per halaman, menu ponsel yang bisa dibuka dan ditutup dengan keyboard, fokus keyboard terlihat, atribut `lang` per halaman, label untuk grafik dan plot, saringan dengan `aria-pressed`, jumlah hasil yang diumumkan ke pembaca layar, tautan tab baru yang dijelaskan, formulir CMS dengan label, pesan galat yang terhubung ke field, dan semua animasi (termasuk gambar README) mengikuti pengaturan "kurangi gerakan" di perangkat.

## Rilis

Versi mengikuti [Semantic Versioning](https://semver.org/lang/id/) dan dicatat di `CHANGELOG.md`.

1. Tambahkan bagian versi baru di `CHANGELOG.md`
2. Jalankan `npm version X.Y.Z --no-git-tag-version` untuk menaikkan versi di `package.json` dan `package-lock.json`
3. Commit, lalu buat tag `vX.Y.Z` dan push beserta tagnya
4. Buat rilis GitHub dari tag tersebut, isi catatannya dari `CHANGELOG.md`
