# Identitas Logo ngiliyun v2 (draf untuk ditinjau)

Status: DISETUJUI Mas Ilyun (28 Okt 2026) untuk logo "A di dalam N" dan wordmark "ngiliyun". Sudah dipasang di `Monogram.tsx`, `Wordmark.tsx`, `SiteFooter.tsx`, dan `public/favicon.svg`. Dokumen ini menjelaskan alasan di balik bentuk logo supaya siapa pun yang memakainya paham maknanya, bukan hanya bentuknya.

Asal: turunan dari opsi 2 di `docs/logo-options/` (N solid dengan dua sudut berwarna) yang dipilih Mas Ilyun, dikerjakan dengan cara yang sama seperti logo NetA (lihat `NetA/docs/Dokumen_Identitas_Logo_NetA_v1.0.md`).

## Filosofi

Logo ini mengatakan satu hal: **nama adalah tempat identitas tinggal**. Di dalam huruf N dari "Ngiliyun" ada huruf A dari "Ahmad". Orang yang menyapa dari luar melihat sebuah N yang kokoh; yang melihat lebih dekat menemukan A yang tersembunyi di dalamnya. Berikut tafsir tiap elemen, ditulis supaya bisa dipertanggungjawabkan, bukan sekadar hiasan.

**1. N yang solid: fondasi.** Dua batang tegak dan satu diagonal tebal tanpa lengkung, tanpa gradasi. Ini cermin dari dua pekerjaan yang dijalani sehari-hari: mengajar dan membangun sistem. Keduanya menuntut fondasi yang kokoh, dan bentuk yang padat mengatakan hal itu tanpa kata-kata.

**2. A yang tersembunyi: awal yang tinggal di dalam.** A adalah huruf pertama, huruf awal dari segala yang dikerjakan. Ia tidak berdiri di samping N, ia menyatu di dalamnya, karena nama depan dan nama sebut adalah satu orang. Seperti makna logo NetA yang baru terasa setelah mata "menyelesaikan" bentuknya, A di sini baru terbaca setelah mata melihat lebih dekat.

**3. Palang hijau: penghubung.** Palang pada huruf A adalah bagian yang menyatukan dua kakinya. Itulah peran yang dijalani: menyambungkan teori dengan praktik, kelas dengan sistem yang nyata, riset dengan produk. Hijau dipilih karena itu warna daun, tanda bertumbuh, dan sudah menjadi warna aksen utama situs. Pertumbuhan Mas Ilyun sendiri berjalan pelan lalu cepat: bergabung di Dicoding sejak 2020, serius mengumpulkan sertifikat sejak 2025.

**4. Ujung biru yang naik: arah.** Diagonal N bergerak dari kiri atas ke kanan bawah lalu batang kanan naik lagi. Ujung kanan atas dipisahkan oleh sebuah celah dan diberi warna biru, seperti langit atau cakrawala: akhir sebuah goresan sekaligus awal yang berikutnya. Celah itu sejajar dengan diagonal, jadi seluruh logo hanya punya satu sudut miring, tanda bahwa semua bagian bergerak ke arah yang sama.

**5. Dua warna dengan tugas masing-masing.** Hijau milik A (awal, tumbuh), biru milik N (arah, jangkauan). Tidak ada warna yang dipasang hanya agar terlihat ramai. Inilah perbedaan terpenting dari opsi 2 lama.

**6. Wordmark "ngiliyun": nama yang akrab.** Ditulis huruf kecil seluruhnya agar terasa dekat dan tidak kaku, dengan Bricolage Grotesque yang sama dengan judul situs, sehingga logo dan halaman berbicara dalam satu suara. Kata ini kebetulan punya tepat dua huruf i, dan titiknya diganti palang hijau dan ujung biru dari logo: nama dan logo memakai bahasa yang sama.

**7. Footer: nama dan peran di atas, "ngiliyun" besar di dasar.** Bagian atas memuat monogram, nama lengkap, dan peran (AI engineer, dosen informatika, pengembang full-stack, spesialis IT support), jadi pengunjung langsung tahu siapa pemilik situs. Di dasar halaman, "ngiliyun" hadir besar dan transparan di atas cahaya biru dan hijau, selebar kontainer dan utuh (huruf g dan y tidak dipotong), seperti pola footer Laravel dan Dicoding yang Mas Ilyun sukai.

**Yang sengaja tidak ada:** ikon otak, sirkuit, chip, atau gradasi biru-ungu. Itu bahasa visual "AI" yang dipakai ribuan produk lain. Mas Ilyun seorang AI engineer, tetapi logonya tidak perlu berteriak soal itu; keahliannya sudah ada di isi situs.

## 1. Masalah pada opsi 2 lama

Opsi 2 sudah bersih dan tegas, tetapi dua segitiga di sudutnya hanya hiasan: tidak ada alasan kenapa hijau di kanan atas dan biru di kiri bawah. Logo yang warnanya tidak punya tugas mudah terasa "kurang", karena mata tidak menemukan apa pun untuk diselesaikan.

## 2. Konsep: A di dalam N

Logo utama adalah huruf N yang solid. Bagian kirinya (batang kiri dan diagonal) ditambah satu palang hijau membentuk huruf A. Jadi inisial **A**hmad tersimpan di dalam **N**giliyun.

Prinsipnya sama dengan NetA: makna baru terasa setelah mata menyelesaikan bentuknya sendiri. Bedanya, NetA membentuk N dari ruang negatif di antara dua bidang, sedangkan logo pribadi ini adalah N positif yang menyembunyikan huruf kedua. Keduanya terasa sekeluarga, tetapi tidak bisa tertukar.

## 3. Anatomi

- **Badan N**: batang kiri, diagonal, batang kanan, warna terang (`#EAF0FB`) di atas navy.
- **Palang hijau** (`#3FD35A`): menempel pada batang kiri dan diagonal, mengubah bagian kiri N menjadi A. Hijau menandai A.
- **Ujung biru** (`#6B97FF`): sudut kanan atas, dipisah dari badan oleh celah tipis. Ini akhir goresan N yang naik ke atas. Biru menandai N.

Aturan warna ini sama dengan komentar palet di `globals.css` saat ini: "A hijau dan N biru di atas navy". Logo baru tidak mengubah palet situs, hanya memberi palet itu bentuk.

## 4. Konstruksi

- Grid 512 x 512, sudut ubin (tile) radius 112.
- Badan N: x 120 sampai 392, y 112 sampai 400. Lebar batang 56.
- Kemiringan diagonal 5:4 (turun 200 untuk geser 160). Celah ujung biru dan sisi miring palang hijau memakai kemiringan yang sama, jadi seluruh logo hanya punya satu sudut miring.
- Palang hijau: y 268 sampai 300, dari batang kiri sampai sisi bawah diagonal.
- Ujung biru: segitiga (336,112), (392,112), (392,182); badan dipotong sejajar dengan celah sekitar 15 unit.
- Tanpa gradasi, bayangan, atau garis tepi. Semua bentuk lurus.

## 5. Wordmark

- Huruf: Bricolage Grotesque ExtraBold (800), huruf display yang sudah dipakai situs. Lisensi SIL Open Font License, boleh dipakai sebagai logo. Teks sudah diubah menjadi bentuk (outline) sehingga tidak bergantung font yang terpasang.
- Kata "ngiliyun" punya tepat dua huruf i. Titik pertama diganti palang hijau (A), titik kedua diganti ujung biru (N). Wordmark dan logo memakai dua elemen yang sama, jadi keduanya terbaca sebagai satu sistem.
- Lockup horizontal: tinggi N sama dengan tinggi huruf l, dasar N sejajar baseline.

## 6. Footer dengan wordmark besar

Yang dipasang di situs: **varian 2 (Cahaya)**, wordmark utuh tanpa terpotong (huruf g dan y tidak dipotong, seperti footer Dicoding). Bagian atas footer memuat monogram, nama lengkap, dan peran; baris hak cipta di sebelah kiri dan keterangan "Dibuat di Cirebon dengan Next.js dan Tailwind CSS" di sebelah kanan, cukup aman karena peran pemilik sudah dijelaskan tepat di atasnya. Dua varian lain tetap tersedia di `footer.html` bila ingin diganti.

Tiga varian di `footer.html`, semuanya mengikuti pola Laravel dan Dicoding (wordmark selebar kontainer, terpotong di dasar halaman):

1. **Tegas**: wordmark putih solid. Paling percaya diri, paling dekat dengan gaya Laravel.
2. **Cahaya**: wordmark transparan dengan gradasi tipis di atas cahaya biru dan hijau yang diburamkan. Paling dekat dengan gaya Dicoding.
3. **Sorot**: wordmark bergaris tipis; di sekitar kursor huruf terisi gradasi hijau ke biru. Mengikuti gaya `Spotlight` yang sudah ada di situs. Bila pengguna memilih kurangi gerakan, sorotan diam di satu titik.

Wordmark di footer bersifat dekoratif (`aria-hidden`), karena nama sudah tertulis sebagai teks di lockup dan hak cipta.

## 7. Skalabilitas

- 16 px: siluet N tetap terbaca; palang dan ujung mengecil menjadi titik warna. Ini wajar untuk favicon.
- 32 px ke atas: huruf A mulai terlihat.
- Versi latar terang memakai badan navy, hijau `#1C9A3A`, dan biru `#2F5FD6` agar kontrasnya cukup di atas krem `#F2EFE6`.

## 8. Penerapan

Boleh:
- Ubin navy dengan N terang sebagai favicon dan ikon aplikasi.
- N tanpa ubin (`mark-utama-tanpa-latar.svg`) di header dan footer di atas latar gelap situs.
- Versi terang di atas putih atau krem.

Hindari:
- Menukar warna palang dan ujung (makna A hijau dan N biru hilang).
- Menambah gradasi, bayangan, atau efek 3D pada logo.
- Menghapus celah ujung biru, atau mengubah sudut miring yang berbeda dari diagonal.
- Meregangkan proporsi.

## 9. Arah lain yang dieksplorasi

- **A. Satu Jalur**: N sebagai satu goresan, ujung awal biru dan ujung akhir hijau. Rapi, tetapi tidak memuat huruf A.
- **C. Satu Tarikan**: A dan N digabung dalam tiga goresan. Sekilas terbaca "AI", berisiko terlihat seperti logo AI generik.
- **D. Dua Bidang**: N sebagai ruang negatif di antara bidang biru dan hijau. Paling terbaca di 16 px, tetapi memakai prinsip yang sama dengan NetA sehingga identitas pribadi dan NetA bisa tertukar.

## 10. Berkas

- `index.html`: halaman tinjauan (buka di browser).
- `footer.html`: mockup footer interaktif dengan tombol pilih varian.
- `mark-utama-a-dalam-n.svg`, `mark-utama-a-dalam-n-terang.svg`: logo dengan ubin.
- `mark-utama-tanpa-latar.svg`, `mark-utama-tanpa-latar-terang.svg`: logo tanpa ubin.
- `wordmark-ngiliyun.svg`, `wordmark-ngiliyun-terang.svg`, `lockup-horizontal.svg`, `lockup-horizontal-terang.svg`.
- `arah-a-*`, `arah-c-*`, `arah-d-*`: arah alternatif.
- `preview-*.png`: tangkapan layar untuk dilihat cepat.

## 11. Penerapan di situs (sudah dikerjakan)

- `src/components/Monogram.tsx`: logo utama tanpa ubin, warna lewat `--color-fg`, `--color-leaf`, `--color-sky`. Dipakai di header, footer, halaman login admin, dan AdminShell.
- `src/components/Wordmark.tsx`: wordmark `ngiliyun` sebagai SVG berisi path (tidak bergantung font).
- `src/components/SiteFooter.tsx` dan `.footer-wordmark` di `globals.css`: lockup atas dan wordmark besar di dasar.
- `public/favicon.svg`: logo dengan ubin navy. Belum ada: `apple-touch-icon` 180 px dan ikon PWA.
- Belum diperbarui: gambar README yang dihasilkan `npm run readme` bila masih memakai monogram lama.

---
Riwayat versi:
- v2 draf (28 Okt 2026): konsep A di dalam N, wordmark dengan titik i dari elemen logo, tiga varian footer.
- v2 disetujui (28 Okt 2026): ditambah bagian Filosofi, dipasang di situs. Footer memakai varian 2 (Cahaya) dengan peran lengkap di bagian atas.
