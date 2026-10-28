# Catatan perubahan

Semua perubahan penting pada proyek ini dicatat di berkas ini. Format mengikuti
[Keep a Changelog](https://keepachangelog.com/id-ID/1.1.0/) dan penomoran versi mengikuti
[Semantic Versioning](https://semver.org/lang/id/).

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
