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

Kolom terakhir dicentang setelah tujuan baru diperiksa di peramban.

| Bagian lama di beranda | Sumber data | Tujuan baru | Periksa |
|---|---|---|---|
| Hero: status semester, nama, kalimat peran, paragraf, dua tombol, tiga angka, plot K-Means | Pengaturan profil, `github.json` | Beranda, Hero (plot lebih pendek di ponsel) | [ ] |
| Pita teks berjalan teknologi (`profile.skills`) | Pengaturan profil | Beranda, Tentang (8 alat pertama) dan Proyek, Teknologi dan topik (daftar lengkap) | [ ] |
| Pita teks berjalan topik (`profile.topics`) | Pengaturan profil | Proyek, Teknologi dan topik | [ ] |
| Tentang: pernyataan dan empat fakta | Pengaturan profil | Beranda, Tentang | [ ] |
| Yang saya kerjakan: ikon, judul, isi | Koleksi `area` | Beranda, Tentang (empat baris pendek tanpa tag) | [ ] |
| Yang saya kerjakan: tag alat per bidang | Koleksi `area` | Proyek, Teknologi dan topik (alat per bidang) | [ ] |
| Proyek unggulan (kartu penuh dengan ilustrasi, tag, demo, kode) | Koleksi `project` | Proyek (penuh) dan Beranda (kartu ringkas, tautan Semua proyek) | [ ] |
| Sistem yang saya kembangkan | Koleksi `system` | Proyek | [ ] |
| Terbaru di GitHub | `github.json` | Proyek | [ ] |
| Kontribusi: empat angka dan grafik | `github.json` | Proyek, Kontribusi | [ ] |
| Di luar kode (hak cipta, reviewer, publikasi) | Koleksi `contribution` | Proyek, Kontribusi; hak cipta juga di Beranda, Sorotan capaian | [ ] |
| Indikator capaian (sitasi, h-index, SINTA, hak cipta, publikasi) bertanggal | Metrik, koleksi `achievement` | Beranda, Sorotan capaian; angka riset lengkap juga di Riset | [ ] |
| Sorotan sertifikat (maksimal 6) dan tab Hak cipta (maksimal 5) | Koleksi `achievement` | Beranda, Sorotan capaian (3 per tab) dan arsip `/sertifikat/` | [ ] |
| Tombol Lihat semua dan baris "Semua kredensial di" | Pengaturan profil | Tombol di Beranda; profil kredensial di arsip `/sertifikat/` (sudah ada) | [ ] |
| Kabar dan liputan (3 terbaru) | Koleksi `post` | Beranda, Kabar terbaru (2) dan arsip `/kabar/` | [ ] |
| Riset: tema, hibah, profil riset, publikasi per tahun | Pengaturan profil, koleksi `achievement` | Riset dan Publikasi | [ ] |
| Reviewer jurnal | Koleksi `achievement` (jenis reviewer) | Riset dan Publikasi | [ ] |
| Mengajar: dua kampus, semester ini, pernah diampu, materi | Koleksi `institution`, `course`, `term` | Mengajar | [ ] |
| Bidang keahlian mengajar | Koleksi `focus` | Mengajar | [ ] |
| Perjalanan (garis waktu) | Koleksi `milestone` | Perjalanan | [ ] |
| Arah ke depan: rencana 2026 sampai 2030, cara bekerja dengan AI, sedang didalami | Koleksi `plan`, `principle`, profil `learning` | Perjalanan, bagian Arah ke depan di bawah garis waktu | [ ] |
| Pita teks raksasa "Mari berkolaborasi" | Teks antarmuka | Beranda, sebelum Kontak (tetap) | [ ] |
| Kartu jenis kerja sama | Koleksi `collab` | Judul menjadi pilihan topik formulir; keterangannya tampil di bawah pilihan topik | [ ] |
| Formulir, email, tombol salin | Pengaturan profil | Beranda, Kontak (tetap) | [ ] |
| Tujuh kanal sosial | Koleksi `channel` | Beranda, Kontak: empat kanal bertanda "Tampil di kontak beranda"; tiga lainnya tetap di CMS dan JSON-LD | [ ] |
| JSON-LD Person | Pengaturan profil, koleksi `post` | Beranda (tetap) | [ ] |

## Keputusan

Diisi selama pengerjaan. Setiap butir menyebut alasannya.
