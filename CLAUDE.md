# CLAUDE.md

Konteks proyek untuk Claude Code. Baca ini di awal setiap sesi.

## Proyek

Situs portofolio pribadi Ahmad Ngiliyun, M.Kom. (dipanggil Mas Ilyun), di `https://ngiliyun.my.id`.
Dosen informatika di Cirebon, pengembang full-stack, peneliti machine learning.

Repo ini adalah `ahmadngiliyun00/ahmadngiliyun00`, jadi `README.md` di akar repo tampil sebagai profil GitHub.
- `README.md` = profil GitHub (ringkasan isi situs, bukan dokumentasi teknis). Bagian bertanda dibangkitkan dari database
- Dokumentasi teknis ada di `docs/DEVELOPMENT.md`, panduan deploy di `docs/DEPLOY.md`
- Gambar README di `profile/` dibuat oleh `scripts/readme-assets.mjs` (jangan diedit manual)

## Stack

- Next.js 16 (App Router), TypeScript, Tailwind CSS v4, berjalan sebagai server Node.js (`next start`), `trailingSlash: true`
- MySQL dengan Drizzle ORM. Konten disimpan di database dan dikelola lewat CMS `/admin`
- Login CMS: email dan kata sandi (scrypt) atau GitHub OAuth (hanya `GITHUB_ALLOWED_LOGIN`), sesi di database
- Hosting: VPS aaPanel, PM2 satu instans, Nginx reverse proxy (keputusan Mas Ilyun, 28 Okt 2026)
- Font dari paket `@fontsource-variable/*`: Bricolage Grotesque (judul), Instrument Sans (isi)
- Dua bahasa lewat dua route: `/` (Indonesia) dan `/en/` (Inggris)
- Beranda ringkas tujuh bagian (hero, tentang, jelajahi, proyek unggulan, sorotan capaian, kabar terbaru, kontak). Isi lengkap di halaman dalam: `/proyek/`, `/riset/`, `/mengajar/`, `/perjalanan/` dan padanannya `/en/projects/`, `/en/research/`, `/en/teaching/`, `/en/journey/`

## Struktur

```
README.md                        profil GitHub
docs/DEVELOPMENT.md, DEPLOY.md   panduan pengembangan dan deploy
CHANGELOG.md                     catatan perubahan per versi rilis
drizzle/                         migrasi database (dibuat npm run db:generate)
seed/                            konten awal untuk npm run db:seed (hanya import type)
profile/                         banner.svg, marquee.svg, stats.svg, dan fonts/ untuk README
scripts/prebuild.mjs             prebuild: data GitHub lalu README
scripts/fetch-github.mjs         ambil data GitHub, fallback ke data lama bila gagal
scripts/readme-assets.mjs        buat gambar SVG README
scripts/readme-sections.mjs      bagian proyek, capaian, mengajar, perjalanan README dari database
scripts/error-pages.mjs          halaman error statis untuk Nginx (public/errors/500, 502, 503, 504), npm run errors
scripts/db/                      migrate, seed, create-admin, env, content (baca konten public)
scripts/lib/load-ts.mjs          memuat berkas .ts dari skrip Node
tests/linkedin.test.mjs          unit test URL LinkedIn dan teks siap tempel (npm test)
tests/contact.test.mjs           unit test validasi form kontak (npm test)
tests/mail.test.mjs              unit test template email: escape isian dan baris baru (npm test)
tests/richtext.test.mjs          unit test pembersihan HTML editor (npm test)
tests/views.test.mjs             unit test aturan hitungan pembaca (npm test)
tests/comment.test.mjs           unit test validasi komentar (npm test)
tests/i18n.test.mjs              unit test isian dua bahasa dan isi cadangan (npm test)
tests/json-script.test.mjs       unit test JSON di dalam <script> (JSON-LD) tidak bisa menutup tag (npm test)
tests/home.test.mjs              unit test aturan beranda: alat utama, tahun awal, kanal kontak (npm test)
tests/seo-text.test.mjs          unit test panjang dan gaya judul serta deskripsi SEO bawaan (npm test)
src/
  app/
    (id)/, (en)/en/              situs publik ID dan EN: beranda, proyek, riset, mengajar, perjalanan,
                                 sertifikat, kabar, s/[token] (EN: projects, research, teaching, journey, certificates, news)
    (admin)/admin/               CMS: login, ringkasan, [collection], settings/[key], actions.ts
    files/[id]/route.ts          sajikan berkas unggahan dengan pemeriksaan izin
    globals.css                  token warna, tekstur, animasi, gaya semua komponen situs
    robots.ts, sitemap.ts
  components/                    komponen situs (PortfolioPage, ProjectsPage, ResearchPage, TeachingPage, JourneyPage,
                                 ArchivePage, DetailPage, dan lainnya). Bersama: SubpageShell, PageHead, Section
  components/LegacyAnchors.tsx   alihkan jangkar beranda lama (#research, #teaching, #journey, #next, #activity)
  components/ErrorView.tsx       isi halaman error (404, 500) untuk situs ID dan EN, CMS, dan global-error
  components/admin/              komponen CMS (AdminShell, EntryForm, FieldInput, ShareBox)
  content/
    types.ts                     tipe semua konten dan label kategori
    collections.ts               konfigurasi koleksi CMS: field, label, urutan
    fields.ts                    field generik: render, baca FormData, validasi
  db/schema.ts, db/index.ts      skema dan koneksi MySQL
  server/
    content.ts                   baca konten; loadSite() dengan cache memori
    entries.ts                   tulis konten, aturan lintas data, tautan berbagi
    files.ts                     simpan dan baca berkas di UPLOAD_DIR
    contact-action.ts            Server Action form kontak (anti spam, simpan, teruskan email)
    messages.ts, mail.ts         pesan kontak di database, kirim email SMTP
    turnstile.ts                 verifikasi Cloudflare Turnstile (opsional)
    auth/                        password, session, github, rate-limit
  data/
    profile.ts                   identitas situs dan teks antarmuka situs ID/EN
    admin.ts                     teks antarmuka CMS
    github.json                  data GitHub hasil skrip (jangan diedit manual)
  lib/                           achievements, posts, linkedin, github, metadata, nav, home, mail-template
  lib/nav.ts                     alamat halaman dalam (pagePath), menu header dan footer, peta jangkar lama
```

## Aturan kerja

- Konten (profil, proyek, capaian, mengajar, garis waktu) diubah lewat CMS, bukan di kode. Teks antarmuka di `src/data/profile.ts` (situs) dan `src/data/admin.ts` (CMS)
- Hanya data `public` yang dirender, masuk sitemap, dan masuk README. Data `private` hanya terlihat di CMS dan lewat tautan berbagi
- Setiap halaman dan Server Action admin wajib memanggil `requireAdmin()`. Server Action bisa dipanggil langsung tanpa halaman
- Field baru: tambah di `src/content/collections.ts` (formulir dan validasi ikut otomatis). Urutkan supaya isian pendek berpasangan di grid 12 kolom; atur `width` bila lebar bawaan `fieldWidth()` tidak pas. Kolom tabel baru: `src/db/schema.ts` lalu `npm run db:generate`
- Aturan capaian (maksimal 6 sorotan, 5 HKI beranda, LinkedIn hanya sertifikat dan pelatihan) ada di `src/server/entries.ts`
- Isian dua bahasa memakai bahasa utama dari Pengaturan, Bahasa (bawaan Indonesia). Isian wajib cukup dalam bahasa utama; situs mengisi terjemahan yang kosong dari bahasa utama lewat `fillLocalized` di `loadSite()`. Komponen baru yang membaca teks dua bahasa dari database lain wajib memakai aturan yang sama
- JSON di dalam tag `<script>` (JSON-LD, konfigurasi Analytics) wajib lewat `jsonForScript` dari `src/lib/json-script.ts`, bukan `JSON.stringify` langsung
- Isi tulisan memakai editor rich text. HTML wajib lewat `sanitizeRichText` saat disimpan dan `renderRichText` saat dirender; jangan merender HTML isi tanpa keduanya. Gambar diunggah ke `UPLOAD_DIR`, tidak pernah base64
- Hitungan pembaca tidak menyimpan IP (hanya hash harian) dan tidak memakai cookie. Komentar selalu menunggu persetujuan; email pengomentar tidak pernah tampil di situs
- Berita dan tulisan (koleksi `post`): liputan media wajib media dan tautan sumber, dan ringkasannya ditulis sendiri tanpa menyalin detail sistem internal kampus dari artikel. Hanya tulisan dengan isi lengkap yang punya halaman `/kabar/<slug>/`
- Metrik riset wajib bertanggal (`asOf`) dan bersumber
- Berkas unggahan disimpan di `UPLOAD_DIR` (di luar repo dan `public/`), disajikan lewat `/files/<id>/`
- Bagian README di antara penanda `<!-- ...:mulai -->` dibangkitkan skrip, jangan diedit manual
- `src/data/profile.ts`, `src/content/types.ts`, `src/lib/linkedin.ts`, dan `seed/` hanya boleh `import type` (dibaca skrip Node)
- Repo terbaru otomatis dari GitHub, atur lewat `recentRepos.exclude` di `profile.ts`
- Beranda paling banyak tujuh bagian, tiap bagian berjudul dengan satu kalimat pengantar, paling banyak 3 sampai 4 item, dan satu tautan "Lihat semua". Isi yang lebih dalam masuk ke halaman dalam, bukan ke beranda
- Halaman dalam baru: tambah kunci di `PageKey` dan `PAGE_SLUGS` (`src/lib/nav.ts`), teks di `copy.pages` (`profile.ts`), komponen dengan `SubpageShell` dan `PageHead` (breadcrumb, satu h1, BreadcrumbList), rute ID dan EN dengan `buildPageMetadata`. Sitemap, menu header, footer, dan isian SEO CMS mengikuti `PAGE_KEYS`
- Jangkar beranda yang dipindah ke halaman dalam dicatat di `LEGACY_ANCHORS` (`src/lib/nav.ts`) supaya tautan lama tetap bekerja
- Judul SEO bawaan paling banyak 60 karakter, deskripsi 120 sampai 160, kalimat naratif tanpa titik dua, tanpa strip pemisah, tanpa nama kota (diuji `tests/seo-text.test.mjs`)
- Kanal kontak di beranda hanya yang bertanda "Tampil di kontak beranda" (bawaan LinkedIn, GitHub, ORCID, YouTube)
- Halaman error: `not-found.tsx` dan `error.tsx` di `(id)/`, `(en)/en/`, dan `(admin)/admin/`, plus `app/global-error.tsx`. Alamat tak dikenal ditangkap rute `[...missing]` supaya 404 berbahasa sesuai. Teks di `copy.errors` (`profile.ts`) dan `adminCopy.errors`. Halaman 500, 502, 503, 504 untuk Nginx dibuat `npm run errors`; jangan edit `public/errors/` manual
- Header keamanan dan CSP ada di `next.config.ts`. Skrip, gambar, iframe, atau `fetch` ke domain pihak ketiga baru wajib ditambahkan ke CSP, kalau tidak peramban memblokirnya
- Gaya komponen ditulis di `globals.css` (situs) atau `admin.css` (CMS) di dalam `@layer components`
- Ikon Font Awesome Free hanya untuk CMS (dimuat di layout admin). Situs publik tetap tanpa ikon font dan tanpa emoji
- Umpan balik aksi di CMS dan situs memakai toast (`toast()` dari `src/components/Toaster.tsx`, atau `FlashToast` setelah redirect), bukan kotak alert di halaman (keputusan Mas Ilyun)
- Formulir harus tetap terisi setelah disimpan. Server Action simpan memanggil `revalidatePath("/admin", "layout")`; formulir tambah data dialihkan ke halaman ubah
- Judul, deskripsi, dan kata kunci SEO beranda, arsip, dan empat halaman dalam diatur di CMS (Pengaturan, SEO dan Search Console) dan dibaca `src/lib/metadata.ts`; teks di `profile.ts` hanya cadangan
- Jangan commit `.env.local`, `.env.production.local`, atau folder `storage/`
- Pesan form kontak (tabel `messages`) selalu privat: hanya tampil di `/admin/pesan/`, tidak pernah di situs, sitemap, atau README
- Kontak publik hanya lewat email (`ahmad@ngiliyun.my.id`). Jangan menambahkan WhatsApp atau nomor telepon (keputusan Mas Ilyun)

## Desain

- Palet dari logo: A hijau (`leaf` #3FD35A), N biru (`sky` #6B97FF), latar navy (`ink` #0A1633), krem (`paper`)
- Elemen utama: nama besar dua warna dan plot K-Means (lebih pendek di ponsel). Elemen lain tenang dan rata kiri
- Animasi: urutan masuk hero (huruf nama naik), running text raksasa sebelum Kontak, muncul saat scroll, heatmap bergelombang, angka menghitung naik, garis waktu terisi saat scroll, sorot kursor, scrollspy
- Semua animasi wajib menghormati `prefers-reduced-motion`
- Hindari: label huruf kapital di atas judul, penomoran yang bukan urutan, teks outline (font variabel menampilkan kontur bertumpuk)
- Kualitas minimum: responsif sampai 360px, tanpa scroll horizontal, fokus keyboard terlihat, kontras AA

## Aturan penulisan (wajib, berlaku untuk kode, komentar, dokumen)

- Jangan pakai em dash. Gunakan tanda hubung "-"
- Jangan pakai simbol ampersand di mana pun, termasuk operator dan-logika di kode. Pakai if bertingkat, ternary, atau `String.fromCharCode(38)` bila karakternya benar-benar dibutuhkan (contoh: URL mailto)
- Panggil pengguna "Mas Ilyun"
- Bahasa Indonesia untuk dokumentasi dan komentar

## Privasi konten publik

Boleh tampil: nama, gelar, jabatan akademik, afiliasi, proyek yang sudah rilis, tautan profil.
Jangan masukkan: urusan internal kampus, nama atasan atau kolega, data mahasiswa, penelitian yang belum terbit, detail sistem internal, kredensial, alamat IP server.

## Perintah

```
npm install
npm run db:migrate     # terapkan migrasi
npm run db:seed        # isi konten awal (sekali)
npm run admin:create -- --email anda@contoh.id --name "Nama"
npm run dev            # http://localhost:3000 dan /admin/
npm run data           # perbarui src/data/github.json dan README
npm run readme         # buat ulang gambar dan bagian teks README dari database
npm run errors         # buat ulang halaman error statis Nginx di public/errors/
npm test               # unit test LinkedIn, kontak, email, rich text, pembaca, komentar, dua bahasa, JSON-LD, beranda, teks SEO
npm run typecheck
npm run build          # data GitHub, README, lalu next build
npm start              # jalankan hasil build
```

Di balik proxy (misalnya sandbox), jalankan `NODE_USE_ENV_PROXY=1 npm run data`.

## Deploy

VPS aaPanel dengan PM2 (satu instans) dan Nginx reverse proxy. Langkah lengkap di `docs/DEPLOY.md`. Cadangkan database dan `UPLOAD_DIR` secara terjadwal, karena keduanya tidak ada di repo.

## Perlu dikonfirmasi Mas Ilyun

- Daftar keputusan otonom dan butir yang menunggu ada di `docs/PROMPT_KEPUTUSAN_OTONOM.md` (berkas privat, tidak di-commit)
- Nomor pencatatan HKI, URL atau DOI artikel, dan berkas PDF sertifikat yang sudah disensor (isi lewat CMS)
- Data privat di CMS: sertifikat folder lain yang belum dipilih, IKAPI (butuh bukti), Serenicare (penelitian orang lain). IDCamp tidak dimasukkan
- Email publik `ahmad@ngiliyun.my.id`: aktifkan Cloudflare Email Routing dan ubah email di CMS (lihat `docs/DEPLOY.md` langkah 7)
- Angka sentimen di ilustrasi DataCraft (62/24/14) dan peluang kelas di ilustrasi RupiahVision hanya ilustrasi, bukan hasil riset

## Yang belum selesai

- Foto pribadi belum dipasang
- Tautan ke ngiliyun.my.id di README baru berfungsi setelah situs di-deploy dan DNS diarahkan
- Deploy ke VPS (database produksi, akun admin, OAuth App GitHub) belum dilakukan
