# Penataan beranda: keputusan dan peta pemindahan

Cabang `feat/penataan-beranda`, dimulai 29 Oktober 2026. Isi situs tidak dihapus: setiap bagian lama
punya tempat baru di beranda atau di halaman dalam. Data di database tidak diubah.

## Baseline sebelum penataan

- `npm run typecheck` lulus, `npm test` 41 tes lulus
- Beranda berisi 11 bagian (`section`) ditambah dua pita teks berjalan dan satu pita teks raksasa
- Tinggi beranda Indonesia: 31.204 px di lebar 375 (38,4 layar ponsel 812 px), 23.735 px di 768, 20.148 px di 1280
- Tinggi beranda Inggris: 30.989 px di 375, 23.558 px di 768, 20.139 px di 1280

## Rute halaman baru

Mengikuti pola yang sudah ada (`/sertifikat/` dan `/en/certificates/`, `/kabar/` dan `/en/news/`):
slug Indonesia untuk situs Indonesia, slug Inggris di bawah `/en/`.

| Halaman | Indonesia | Inggris |
|---|---|---|
| Proyek | `/proyek/` | `/en/projects/` |
| Riset dan Publikasi | `/riset/` | `/en/research/` |
| Mengajar | `/mengajar/` | `/en/teaching/` |
| Perjalanan | `/perjalanan/` | `/en/journey/` |

## Peta pemindahan dan daftar periksa

Kolom terakhir dicentang setelah tujuan baru diperiksa di peramban (server produksi lokal, 29 Oktober 2026).

| Bagian lama di beranda | Sumber data | Tujuan baru | Periksa |
|---|---|---|---|
| Hero: status semester, nama, kalimat peran, paragraf, dua tombol, tiga angka, plot K-Means | Pengaturan profil, `github.json` | Beranda, Hero (plot lebih pendek di ponsel) | [x] |
| Pita teks berjalan teknologi (`profile.skills`) | Pengaturan profil | Beranda, Tentang (8 alat pertama) dan Proyek, Teknologi dan topik (daftar lengkap) | [x] |
| Pita teks berjalan topik (`profile.topics`) | Pengaturan profil | Proyek, Teknologi dan topik | [x] |
| Tentang: pernyataan dan empat fakta | Pengaturan profil | Beranda, Tentang | [x] |
| Yang saya kerjakan: ikon, judul, isi | Koleksi `area` | Beranda, Tentang (empat baris pendek tanpa tag) | [x] |
| Yang saya kerjakan: tag alat per bidang | Koleksi `area` | Proyek, Teknologi dan topik (alat per bidang) | [x] |
| Proyek unggulan (kartu penuh dengan ilustrasi, tag, demo, kode) | Koleksi `project` | Proyek (penuh) dan Beranda (kartu ringkas, tautan Semua proyek) | [x] |
| Sistem yang saya kembangkan | Koleksi `system` | Proyek | [x] |
| Terbaru di GitHub | `github.json` | Proyek | [x] |
| Kontribusi: empat angka dan grafik | `github.json` | Proyek, Kontribusi | [x] |
| Di luar kode (hak cipta, reviewer, publikasi) | Koleksi `contribution` | Proyek, Kontribusi; hak cipta juga di Beranda, Sorotan capaian | [x] |
| Indikator capaian (sitasi, h-index, SINTA, hak cipta, publikasi) bertanggal | Metrik, koleksi `achievement` | Beranda, Sorotan capaian; angka riset lengkap juga di Riset | [x] |
| Sorotan sertifikat (maksimal 6) dan tab Hak cipta (maksimal 5) | Koleksi `achievement` | Beranda, Sorotan capaian (3 per tab) dan arsip `/sertifikat/` | [x] |
| Tombol Lihat semua dan baris "Semua kredensial di" | Pengaturan profil | Tombol di Beranda; profil kredensial di arsip `/sertifikat/` (sudah ada) | [x] |
| Kabar dan liputan (3 terbaru) | Koleksi `post` | Beranda, Kabar terbaru (2) dan arsip `/kabar/` | [x] |
| Riset: tema, hibah, profil riset, publikasi per tahun | Pengaturan profil, koleksi `achievement` | Riset dan Publikasi | [x] |
| Reviewer jurnal | Koleksi `achievement` (jenis reviewer) | Riset dan Publikasi | [x] |
| Mengajar: dua kampus, semester ini, pernah diampu, materi | Koleksi `institution`, `course`, `term` | Mengajar | [x] |
| Bidang keahlian mengajar | Koleksi `focus` | Mengajar | [x] |
| Perjalanan (garis waktu) | Koleksi `milestone` | Perjalanan | [x] |
| Arah ke depan: rencana 2026 sampai 2030, cara bekerja dengan AI, sedang didalami | Koleksi `plan`, `principle`, profil `learning` | Perjalanan, bagian Arah ke depan di bawah garis waktu | [x] |
| Pita teks raksasa "Mari berkolaborasi" | Teks antarmuka | Beranda, sebelum Kontak (tetap) | [x] |
| Kartu jenis kerja sama | Koleksi `collab` | Judul menjadi pilihan topik formulir; keterangannya tampil di bawah pilihan topik | [x] |
| Formulir, email, tombol salin | Pengaturan profil | Beranda, Kontak (tetap) | [x] |
| Tujuh kanal sosial | Koleksi `channel` | Beranda, Kontak: empat kanal bertanda "Tampil di kontak beranda"; tiga lainnya tetap di CMS dan JSON-LD | [x] |
| JSON-LD Person | Pengaturan profil, koleksi `post` | Beranda (tetap) | [x] |

## Hasil setelah penataan

| Ukuran | Sebelum | Sesudah |
|---|---|---|
| Jumlah bagian beranda | 11 bagian, dua pita teks berjalan, satu pita raksasa | 7 bagian, satu pita raksasa |
| Tinggi beranda ID di 375 px | 31.204 px (38,4 layar 812 px) | 8.416 px (10,4 layar) |
| Tinggi beranda ID di 768 px | 23.735 px | 8.606 px |
| Tinggi beranda ID di 1280 px | 20.148 px | 6.947 px |
| Tinggi beranda EN di 375 px | 30.989 px | 8.407 px |

Halaman baru di 375 px: Proyek 9.761 px, Riset 6.059 px, Mengajar 4.728 px, Perjalanan 6.439 px.
Semua halaman (ID dan EN, termasuk `/sertifikat/` dan `/kabar/`) tanpa gulir horizontal di 375, 768, dan
1280 px, satu h1 per halaman, urutan heading tanpa lompatan, dan tanpa galat konsol.

Pemeriksaan lain: `npm run typecheck`, `npm test` (59 tes), dan `npm run build` lulus. Perayap tautan
internal memeriksa 122 halaman dan 616 tautan jangkar tanpa status selain 200 dan tanpa jangkar hilang.
Pengalihan `/#research`, `/en/#teaching`, `/#next`, dan `/#activity` ke halaman barunya bekerja. Menu
ponsel terbuka dengan fokus ke tautan pertama, tertutup dengan Escape, dan fokus kembali ke tombol.

## Keputusan

1. **Target tinggi belum sepenuhnya tercapai.** Beranda di 375 px sekitar 10,4 layar, bukan di bawah 8.
   Tiga bagian yang diminta tetap utuh memakan hampir separuhnya: hero dengan plot K-Means (sekitar 1,6
   layar), formulir kontak (sekitar 2,2 layar), dan footer dengan wordmark (sekitar 0,9 layar). Memangkas
   lebih jauh berarti membuang isi atau mengubah ciri khas situs, jadi keputusan itu diserahkan ke Mas Ilyun.
2. **Rute** mengikuti tabel di prompt karena sudah sesuai konvensi repo (slug Indonesia, padanan Inggris di `/en/`).
3. **Header** berisi enam tautan sesuai prompt. Kabar tetap terjangkau dari bagian Kabar terbaru di beranda
   dan dari footer. Menu desktop tampil mulai 1024 px karena kini cukup enam tautan.
4. **Jangkar lama** dialihkan di peramban oleh `LegacyAnchors`, karena bagian `#...` dari alamat tidak dikirim
   ke server sehingga tidak bisa dialihkan lewat Nginx atau Next.js.
5. **Di luar kode** (hak cipta, reviewer, publikasi) ditempatkan di halaman Proyek di bawah grafik Kontribusi,
   sesuai letak aslinya. Hak cipta juga tampil di Sorotan capaian beranda (angka dan tab Hak cipta).
   Tautan `#research` di data CMS otomatis menuju `/riset/`.
6. **Sorotan capaian** tetap memakai dua tab (Sertifikat dan pelatihan, Hak cipta) dengan tiga kartu terbaru
   per tab dari penanda CMS yang sudah ada (Sorot di beranda, Tampilkan di tab Hak cipta). Pilihan ini
   menjaga kurasi Mas Ilyun di CMS dan memasukkan HKI ke bagian ini seperti diminta. Batas CMS 6 dan 5 tidak diubah.
7. **Alat utama** di Tentang memakai isian CMS baru "Alat utama di beranda". Selama kosong, situs mengambil satu
   alat bergiliran dari tiap bidang kerja supaya keempat bidang terwakili.
8. **Pita teks berjalan** teknologi dan topik pindah ke halaman Proyek, bagian Teknologi dan topik, bersama alat
   per bidang dan isi tiap bidang kerja. Gambar `profile/marquee.svg` di README tidak diubah.
9. **Pita raksasa "Mari berkolaborasi"** dipertahankan sebelum Kontak karena tidak termasuk yang diminta dihapus
   dan merupakan bagian dari desain (CLAUDE.md, bagian Animasi).
10. **Kartu jenis kerja sama** dihapus dari Kontak. Supaya isinya tidak hilang, keterangan tiap jenis kerja sama
    tampil di bawah pilihan topik formulir saat topik itu dipilih.
11. **Kanal kontak** mendapat penanda "Tampil di kontak beranda". Database tidak diubah: kanal yang belum pernah
    disimpan dengan penanda ini memakai daftar bawaan LinkedIn, GitHub, ORCID, dan YouTube, dan formulir CMS
    menampilkan nilai bawaan itu supaya menyimpan tanpa mengubah centang tidak menyembunyikan kanal. Alasan:
    database produksi MariaDB, dan migrasi data JSON lintas MySQL dan MariaDB berisiko.
12. **Tanpa migrasi.** Judul dan deskripsi SEO halaman baru disimpan di pengaturan `seo` yang sudah berbentuk JSON,
    jadi skema tabel tidak berubah.
13. **Teks SEO bawaan** beranda, arsip sertifikat, dan arsip kabar ikut ditulis ulang mengikuti aturan konten
    (sebelumnya memakai strip pemisah, titik dua, kota, dan "M.Kom."). Isian CMS tetap didahulukan bila sudah diisi.
    Teks Inggris memakai nama, bukan kata ganti orang ketiga.
14. **Ponsel**: kartu proyek, sorotan, dan kabar di beranda menjadi baris geser horizontal di dalam bagiannya
    (halaman tetap tanpa gulir horizontal). Isi tiap bidang kerja hanya judul di ponsel; teks lengkapnya tampil
    di desktop dan di halaman Proyek.
15. **Judul bagian beranda**: "Sertifikat dan capaian" menjadi "Sorotan capaian" dan "Kabar dan liputan" menjadi
    "Kabar terbaru"; halaman arsipnya tetap memakai judul lama.
16. **Arsip sertifikat dan kabar** memakai kepala halaman yang sama dengan halaman baru, sehingga ikut mendapat
    BreadcrumbList dan tautan kembali ke beranda.
17. **Rencana lima tahun** dipindah utuh ke halaman Perjalanan sesuai keputusan bawaan, tidak diringkas.
