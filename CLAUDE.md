# CLAUDE.md

Konteks proyek untuk Claude Code. Baca ini di awal setiap sesi.

## Proyek

Situs portofolio pribadi Ahmad Ngiliyun, M.Kom. (dipanggil Mas Ilyun), di `https://ngiliyun.my.id`.
Dosen informatika di Cirebon, pengembang full-stack, peneliti machine learning.

Repo ini adalah `ahmadngiliyun00/ahmadngiliyun00`, jadi `README.md` di akar repo tampil sebagai profil GitHub.
- `README.md` = profil GitHub (ringkasan isi situs, bukan dokumentasi teknis). Jaga isinya selaras dengan `src/data/profile.ts`
- Dokumentasi teknis ada di `docs/DEVELOPMENT.md`
- Gambar README di `profile/` dibuat oleh `scripts/readme-assets.mjs` (jangan diedit manual)

## Stack

- Next.js 16 (App Router), TypeScript, Tailwind CSS v4
- `output: "export"` dan `trailingSlash: true`: hasil build adalah HTML statis di `out/`
- Font dari paket `@fontsource-variable/*`: Bricolage Grotesque (judul), Instrument Sans (isi)
- Dua bahasa lewat dua route: `/` (Indonesia) dan `/en/` (Inggris)

## Struktur

```
README.md                        profil GitHub
docs/DEVELOPMENT.md              panduan pengembangan
CHANGELOG.md                     catatan perubahan per versi rilis
profile/                         banner.svg, marquee.svg, stats.svg, dan fonts/ untuk README
scripts/fetch-github.mjs         ambil data GitHub (prebuild), fallback ke data lama bila gagal
scripts/readme-assets.mjs        buat gambar SVG README dari data GitHub
src/
  app/
    (id)/layout.tsx, page.tsx    root layout bahasa Indonesia
    (en)/en/layout.tsx, page.tsx root layout bahasa Inggris
    globals.css                  token warna, tekstur, animasi, gaya semua komponen
    robots.ts, sitemap.ts
  components/
    PortfolioPage.tsx            susunan semua bagian halaman (server component)
    Header.tsx                   navigasi, scrollspy, garis progres, menu ponsel (client)
    KMeans.tsx                   plot K-Means interaktif di hero (client)
    ContributionGraph.tsx        heatmap kontribusi GitHub dengan tooltip (client)
    CountUp.tsx                  angka statistik yang menghitung naik (client)
    Timeline.tsx                 garis waktu perjalanan dengan tahun yang lengket (client)
    ContactPanel.tsx             email, salin email, formulir mailto (client)
    Spotlight.tsx                cahaya sorot kursor untuk panel [data-spot] (client)
    Marquee.tsx                  running text (solid, outline, giant)
    Reveal.tsx                   animasi muncul saat scroll (client)
    ProjectVisual.tsx            ilustrasi SVG proyek unggulan
    Monogram.tsx, AreaIcon.tsx, LiveClock.tsx, ExternalLink.tsx, RootShell.tsx
  data/
    profile.ts                   SEMUA konten teks ID/EN dan daftar data
    github.json                  data GitHub hasil skrip (jangan diedit manual)
  lib/
    github.ts                    olah github.json: grid heatmap, statistik, repo terbaru
    metadata.ts
```

## Aturan kerja

- Ubah konten di `src/data/profile.ts`, jangan menulis teks langsung di komponen
- Proyek unggulan: array `featured`. Repo terbaru otomatis dari GitHub, atur lewat `recentRepos.exclude`
- Status di hero (semester berjalan): konstanta `status`
- Email: `site.email` (nama dan domain terpisah). Kosongkan `user` untuk menyembunyikan email dan formulir
- Gaya komponen ditulis di `globals.css` di dalam `@layer components`, supaya utilitas Tailwind tetap bisa menimpanya

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
npm run dev        # http://localhost:3000
npm run data       # perbarui src/data/github.json dari GitHub dan gambar README
npm run readme     # buat ulang gambar README saja
npm run typecheck
npm run build      # menjalankan data lalu next build, hasil di out/
npm run preview    # melayani out/ secara lokal
```

Di balik proxy (misalnya sandbox), jalankan `NODE_USE_ENV_PROXY=1 npm run data`.

## Deploy

- Vercel: import repo GitHub, preset Next.js. Data GitHub ikut diperbarui setiap deploy
- Cloudflare Pages: build command `npm run build`, output directory `out`
- VPS (aaPanel, Nginx): unggah isi `out/` ke root situs statis, pastikan `try_files $uri $uri/ =404`
- DNS di Cloudflare yang mengarah ke Vercel: set record ke "DNS only"

## Perlu dikonfirmasi Mas Ilyun

- Tahun dan isi garis waktu di `journey` (terutama 2017, 2020, 2023)
- Peran "Sekretaris Program Studi" dan mengajar di UNU Cirebon boleh tampil publik atau tidak
- Daftar mata kuliah per kampus
- Email publik sementara memakai Gmail, ganti ke alamat domain setelah aktif
- Angka sentimen di ilustrasi DataCraft (62/24/14) hanya ilustrasi, bukan hasil riset

## Yang belum selesai

- Foto pribadi belum dipasang
- Tautan ke ngiliyun.my.id di README baru berfungsi setelah situs di-deploy dan DNS diarahkan
