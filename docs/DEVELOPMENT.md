# Panduan pengembangan

Repositori ini berisi dua hal sekaligus:

1. Kode sumber situs portofolio [ngiliyun.my.id](https://ngiliyun.my.id) (Next.js, TypeScript, Tailwind CSS), dua bahasa di `/` dan `/en/`
2. README profil GitHub (`README.md` di akar repo) beserta gambarnya di folder `profile/`

## Menjalankan

```bash
npm install
npm run dev
```

Buka http://localhost:3000. Memerlukan Node.js 20.9 atau lebih baru (lihat `.nvmrc`).

## Perintah

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Server pengembangan |
| `npm run data` | Ambil data GitHub ke `src/data/github.json`, lalu buat ulang gambar README |
| `npm run readme` | Buat ulang gambar README saja dari data yang ada |
| `npm run typecheck` | Pemeriksaan TypeScript |
| `npm run build` | Menjalankan `data` lalu build statis ke folder `out/` |
| `npm run preview` | Melayani folder `out/` secara lokal |

Di balik proxy (misalnya sandbox), jalankan `NODE_USE_ENV_PROXY=1 npm run data`. Opsional: set `GITHUB_TOKEN` agar batas rate limit API lebih longgar.

## Mengubah konten situs

Semua teks dan daftar ada di `src/data/profile.ts`.

| Yang ingin diubah | Bagian di `profile.ts` |
| --- | --- |
| Status semester di hero | `status` |
| Proyek unggulan | `featured` |
| Repo yang tidak ingin tampil di "Terbaru di GitHub" | `recentRepos.exclude` |
| Mata kuliah | `teaching` |
| Garis waktu | `journey` |
| Kontribusi di luar kode | `contributions` |
| Jenis kolaborasi | `collabs` |
| Email | `site.email` |
| Running text | `skills` dan `topics` |

## README profil

- Teks README ditulis langsung di `README.md`
- Gambar dibuat oleh `scripts/readme-assets.mjs`:
  - `profile/banner.svg` banner nama dengan plot K-Means beranimasi
  - `profile/marquee.svg` running text teknologi dan topik
  - `profile/stats.svg` statistik kontribusi dan grafik per bulan
- Teks di dalam gambar (tagline, daftar teknologi) diatur di bagian atas `scripts/readme-assets.mjs`
- Font disematkan dari `profile/fonts/` (subset statis Bricolage Grotesque dan Instrument Sans, lisensi OFL). File `metrics.json` dipakai untuk mengukur lebar teks
- Setelah `npm run data`, commit perubahan `profile/stats.svg` agar angka di README ikut segar

## Data GitHub

`scripts/fetch-github.mjs` mengambil profil, repositori, dan grafik kontribusi. Setiap bagian yang gagal diambil memakai data lama di `src/data/github.json`, jadi build tidak pernah gagal karena skrip ini.

Supaya grafik di situs selalu segar, buat Deploy Hook di Vercel lalu panggil secara terjadwal (misalnya sehari sekali).

## Build dan deploy

| Tujuan | Pengaturan |
| --- | --- |
| Vercel | Import repo, preset Next.js |
| Cloudflare Pages | Build command `npm run build`, output directory `out` |
| VPS dengan Nginx atau aaPanel | Unggah isi `out/` ke root situs, gunakan `try_files $uri $uri/ =404` |

Jika DNS dikelola Cloudflare dan situs di Vercel, set record ke "DNS only" supaya sertifikat SSL Vercel tidak bentrok.

## Aksesibilitas

Tautan lompat ke konten, fokus keyboard terlihat, atribut `lang` per halaman, label untuk grafik dan plot, dan semua animasi (termasuk gambar README) mengikuti pengaturan "kurangi gerakan" di perangkat.

## Rilis

Versi mengikuti [Semantic Versioning](https://semver.org/lang/id/) dan dicatat di `CHANGELOG.md`.

1. Tambahkan bagian versi baru di `CHANGELOG.md`
2. Jalankan `npm version X.Y.Z --no-git-tag-version` untuk menaikkan versi di `package.json` dan `package-lock.json`
3. Commit, lalu buat tag `vX.Y.Z` dan push beserta tagnya
4. Buat rilis GitHub dari tag tersebut, isi catatannya dari `CHANGELOG.md`
