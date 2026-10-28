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
| `npm run readme` | Buat ulang gambar README dan bagian teks README yang dibangkitkan |
| `npm run check:achievements` | Validasi `src/data/achievements.ts` dan `src/data/metrics.ts` |
| `npm run check:achievements -- --online` | Validasi plus cek setiap URL verifikasi benar-benar terbuka |
| `npm test` | Unit test pembangun URL LinkedIn dan teks siap tempel |
| `npm run thumbs` | Buat thumbnail WebP dari PDF di `public/sertifikat/` (opsional) |
| `npm run typecheck` | Pemeriksaan TypeScript |
| `npm run build` | Validasi capaian, ambil data GitHub, perbarui README, lalu build statis ke `out/` |
| `npm run preview` | Melayani folder `out/` secara lokal |

Di balik proxy (misalnya sandbox), jalankan `NODE_USE_ENV_PROXY=1 npm run data`. Opsional: set `GITHUB_TOKEN` agar batas rate limit API lebih longgar.

## Mengubah konten situs

Semua teks dan daftar ada di `src/data/profile.ts`.

| Yang ingin diubah | Bagian di `profile.ts` |
| --- | --- |
| Status semester di hero | `status` |
| Proyek unggulan | `featured` |
| Repo yang tidak ingin tampil di "Terbaru di GitHub" | `recentRepos.exclude` |
| Mata kuliah per kampus dan semester | `teaching`, `terms`, `currentTerm` |
| Bidang keahlian mengajar | `teachingFocus` |
| Sistem yang dikembangkan (repo privat) | `systems` |
| Tema riset dan profil riset | `researchThemes`, `researchProfiles` |
| Garis waktu | `journey` |
| Kontribusi di luar kode | `contributions` |
| Jenis kolaborasi | `collabs` |
| Email | `site.email` |
| Running text | `skills` dan `topics` |

### Ganti semester

1. Tambahkan kode semester baru di `terms` (misalnya `"26272": { id: "Genap 2026/2027", en: "Even semester 2026/2027" }`)
2. Ubah label semester lama menjadi tahun akademiknya saja, lalu set `currentTerm` ke kode baru
3. Tambahkan kode baru ke `terms` milik setiap mata kuliah yang diampu semester itu
4. Perbarui `status` di hero

## Sertifikat dan capaian

Semua sertifikat, pelatihan, hak cipta, buku, publikasi, hibah, reviewer, dan keanggotaan ada di satu berkas: `src/data/achievements.ts`. Dari berkas ini dibangun:

- Bagian "Sertifikat dan capaian" dan "Riset" di beranda
- Arsip `/sertifikat/` dan `/en/certificates/` (pencarian, saringan kategori dan tahun, bisa dibagikan lewat URL, misalnya `/sertifikat/?kategori=hki`)
- Halaman detail `/sertifikat/<id>/` dan `/en/certificates/<id>/` dengan tombol LinkedIn, teks siap tempel, dan JSON-LD
- Entri di `sitemap.xml` dan bagian "Sertifikat dan capaian" di README

### Menambah capaian

1. Tambahkan objek baru di array `achievements`. Untuk sertifikat Dicoding cukup panggil pembantu `dicoding(...)` (URL verifikasi dan masa berlaku tiga tahun terisi otomatis)
2. Isi `id` (slug unik, huruf kecil dan tanda hubung), `kind`, `title` (ID dan EN), `issuer`, `summary` (ID dan EN, wajib kecuali publikasi), dan `issued`
3. Kolom yang belum diketahui dikosongkan. Jangan mengarang nomor, tanggal, atau ID
4. Mulai dengan `visibility: "draft"`. Ganti ke `"public"` setelah data diperiksa
5. Jalankan `npm run check:achievements`, lalu `npm run readme`

| Kolom | Fungsi |
| --- | --- |
| `visibility` | `"draft"` tidak dirender, tidak masuk sitemap, tidak masuk README |
| `featured` | Tampil di sorotan beranda, maksimal 6 |
| `showOnHome` | Khusus HKI: tampil di tab "Hak cipta" beranda, maksimal 5 |
| `linkedin` | Tombol "Tambahkan ke LinkedIn", hanya untuk `sertifikat` dan `pelatihan` |
| `verifyUrl` | URL verifikasi resmi penerbit (https) |
| `file` | Berkas di `public/`, misalnya `sertifikat/pekerti-batch-30.pdf` |
| `related` | Tautan pendukung, misalnya repositori proyek akhir |
| `authorship` | Khusus publikasi: `sole`, `first`, `second`, atau `co` |

Angka sitasi, h-index, skor SINTA, dan metrik Microsoft Learn ada di `src/data/metrics.ts`. Setiap angka wajib punya `asOf` dan sumber, dan selalu ditampilkan bersama tanggalnya. Perbarui angka dan tanggal sekaligus; jangan membulatkan ke atas.

### Tombol LinkedIn

`src/lib/linkedin.ts` merakit URL `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME` dengan `URLSearchParams` sesuai panduan resmi Add to Profile. `certUrl` memakai URL verifikasi penerbit bila ada, kalau tidak halaman detail di situs. Menurut halaman bantuan LinkedIn, tombol kustom untuk penerbit baru mungkin tidak lagi mengisi formulir secara otomatis; karena itu halaman detail juga menyediakan teks siap tempel. Penambahan ke LinkedIn tetap manual: masuk, periksa isian, lalu simpan.

### Berkas sertifikat dan privasi

- Simpan di `public/sertifikat/<id>.pdf` atau gambar, maksimal 2 MB per berkas (validator memberi peringatan bila lebih)
- Berkas lokal bersifat pelengkap. Sertifikat yang punya halaman verifikasi resmi tidak wajib diunggah
- **Sebelum PDF atau gambar masuk repo, tutup semua data pribadi secara manual:** NIK, alamat, nomor telepon, NIDN atau NUPTK, nomor anggota, dan kode QR keanggotaan. Validator TIDAK bisa mendeteksi data pribadi di dalam berkas
- Repo ini publik. Semua yang ada di `public/` ikut terbit dan tercatat di riwayat git
- Thumbnail opsional: `npm run thumbs` (butuh `pdftoppm` dan `magick` atau `cwebp`) membuat `public/sertifikat/thumbs/<nama>.webp`, yang otomatis dipakai halaman detail

### Yang tidak boleh masuk data publik

Nomor kontrak hibah, anggaran, topologi atau alamat IP jaringan kampus, nama mahasiswa, nama kolega atau atasan, isi telaah naskah (blind review), penelitian yang belum terbit, dan nomor anggota. Bila ragu, jadikan `draft`.

## README profil

- Teks pembuka, tabel "Yang saya kerjakan", dan ajakan kolaborasi ditulis langsung di `README.md`
- Bagian di antara penanda `<!-- proyek:mulai -->`, `<!-- capaian:mulai -->`, `<!-- mengajar:mulai -->`, dan `<!-- perjalanan:mulai -->` dibangkitkan oleh `scripts/readme-sections.mjs` dari `profile.ts`, `achievements.ts`, dan `metrics.ts`. Jangan mengedit isi di antara penanda secara manual
- Gambar dibuat oleh `scripts/readme-assets.mjs`:
  - `profile/banner.svg` banner nama dengan plot K-Means beranimasi
  - `profile/marquee.svg` running text teknologi dan topik
  - `profile/stats.svg` statistik kontribusi dan grafik per bulan
- Teks di dalam gambar (tagline, daftar teknologi) diatur di bagian atas `scripts/readme-assets.mjs`
- Font disematkan dari `profile/fonts/` (subset statis Bricolage Grotesque dan Instrument Sans, lisensi OFL). File `metrics.json` dipakai untuk mengukur lebar teks
- Setelah `npm run data`, commit perubahan `profile/stats.svg` agar angka di README ikut segar

## Skrip dan berkas TypeScript

Skrip Node (`check-achievements.mjs`, `readme-sections.mjs`, test) membaca berkas `.ts` lewat `scripts/lib/load-ts.mjs`, yang mentranspilasi dengan paket `typescript` dari devDependencies. Karena itu `profile.ts`, `achievements.ts`, `metrics.ts`, dan `src/lib/linkedin.ts` hanya boleh memuat `import type`, bukan impor nilai.

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

Tautan lompat ke konten, fokus keyboard terlihat, atribut `lang` per halaman, label untuk grafik dan plot, saringan dengan `aria-pressed`, jumlah hasil yang diumumkan ke pembaca layar, tautan tab baru yang dijelaskan, dan semua animasi (termasuk gambar README) mengikuti pengaturan "kurangi gerakan" di perangkat.

## Rilis

Versi mengikuti [Semantic Versioning](https://semver.org/lang/id/) dan dicatat di `CHANGELOG.md`.

1. Tambahkan bagian versi baru di `CHANGELOG.md`
2. Jalankan `npm version X.Y.Z --no-git-tag-version` untuk menaikkan versi di `package.json` dan `package-lock.json`
3. Commit, lalu buat tag `vX.Y.Z` dan push beserta tagnya
4. Buat rilis GitHub dari tag tersebut, isi catatannya dari `CHANGELOG.md`
