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
scripts/db/                      migrate, seed, create-admin, env, content (baca konten public)
scripts/lib/load-ts.mjs          memuat berkas .ts dari skrip Node
tests/linkedin.test.mjs          unit test URL LinkedIn dan teks siap tempel (npm test)
src/
  app/
    (id)/, (en)/en/              situs publik ID dan EN: beranda, sertifikat atau certificates, s/[token]
    (admin)/admin/               CMS: login, ringkasan, [collection], settings/[key], actions.ts
    files/[id]/route.ts          sajikan berkas unggahan dengan pemeriksaan izin
    globals.css                  token warna, tekstur, animasi, gaya semua komponen situs
    robots.ts, sitemap.ts
  components/                    komponen situs (PortfolioPage, ArchivePage, DetailPage, dan lainnya)
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
    auth/                        password, session, github, rate-limit
  data/
    profile.ts                   identitas situs dan teks antarmuka situs ID/EN
    admin.ts                     teks antarmuka CMS
    github.json                  data GitHub hasil skrip (jangan diedit manual)
  lib/                           achievements, linkedin, github, metadata, nav
```

## Aturan kerja

- Konten (profil, proyek, capaian, mengajar, garis waktu) diubah lewat CMS, bukan di kode. Teks antarmuka di `src/data/profile.ts` (situs) dan `src/data/admin.ts` (CMS)
- Hanya data `public` yang dirender, masuk sitemap, dan masuk README. Data `private` hanya terlihat di CMS dan lewat tautan berbagi
- Setiap halaman dan Server Action admin wajib memanggil `requireAdmin()`. Server Action bisa dipanggil langsung tanpa halaman
- Field baru: tambah di `src/content/collections.ts` (formulir dan validasi ikut otomatis). Kolom tabel baru: `src/db/schema.ts` lalu `npm run db:generate`
- Aturan capaian (maksimal 6 sorotan, 5 HKI beranda, LinkedIn hanya sertifikat dan pelatihan) ada di `src/server/entries.ts`
- Metrik riset wajib bertanggal (`asOf`) dan bersumber
- Berkas unggahan disimpan di `UPLOAD_DIR` (di luar repo dan `public/`), disajikan lewat `/files/<id>/`
- Bagian README di antara penanda `<!-- ...:mulai -->` dibangkitkan skrip, jangan diedit manual
- `src/data/profile.ts`, `src/content/types.ts`, `src/lib/linkedin.ts`, dan `seed/` hanya boleh `import type` (dibaca skrip Node)
- Repo terbaru otomatis dari GitHub, atur lewat `recentRepos.exclude` di `profile.ts`
- Gaya komponen ditulis di `globals.css` (situs) atau `admin.css` (CMS) di dalam `@layer components`
- Jangan commit `.env.local`, `.env.production.local`, atau folder `storage/`

## Desain

- Palet dari logo: A hijau (`leaf` #3FD35A), N biru (`sky` #6B97FF), latar navy (`ink` #0A1633), krem (`paper`)
- Elemen utama: nama besar dua warna dan plot K-Means. Elemen lain tenang dan rata kiri
- Animasi: urutan masuk hero (huruf nama naik), running text dua arah dan running text raksasa, muncul saat scroll, heatmap bergelombang, angka menghitung naik, garis waktu terisi saat scroll, sorot kursor, scrollspy
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
npm test               # unit test URL LinkedIn
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
- Email publik sementara memakai Gmail, ganti ke alamat domain setelah aktif
- Angka sentimen di ilustrasi DataCraft (62/24/14) dan peluang kelas di ilustrasi RupiahVision hanya ilustrasi, bukan hasil riset

## Yang belum selesai

- Foto pribadi belum dipasang
- Tautan ke ngiliyun.my.id di README baru berfungsi setelah situs di-deploy dan DNS diarahkan
- Deploy ke VPS (database produksi, akun admin, OAuth App GitHub) belum dilakukan
