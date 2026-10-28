# CLAUDE.md

Konteks proyek untuk Claude Code. Baca ini di awal setiap sesi.

## Proyek

Situs portofolio pribadi Ahmad Ngiliyun, M.Kom. (dipanggil Mas Ilyun), di `https://ngiliyun.my.id`.
Dosen informatika di Cirebon, pengembang full-stack, peminat machine learning.
Prioritas 1 adalah situs web ini. Prioritas 2 adalah portofolio di GitHub (README profil), belum dikerjakan.

## Stack

- Next.js (App Router) dengan TypeScript, Tailwind CSS v4
- `output: "export"` dan `trailingSlash: true`: hasil build adalah HTML statis di `out/`
- Font lewat paket `@fontsource-variable/*` (Bricolage Grotesque untuk judul, Instrument Sans untuk isi), tanpa panggilan ke Google Fonts saat build
- Dua bahasa lewat dua route: `/` (Indonesia) dan `/en/` (Inggris). Tidak ada state bahasa di klien

## Struktur

```
src/
  app/
    (id)/layout.tsx, page.tsx      root layout bahasa Indonesia
    (en)/en/layout.tsx, page.tsx   root layout bahasa Inggris
    globals.css                    token warna, font, animasi, komponen CSS
    robots.ts, sitemap.ts
  components/
    PortfolioPage.tsx              seluruh tata letak halaman (server component)
    KMeans.tsx                     visualisasi K-Means interaktif di hero (client)
    Reveal.tsx                     animasi muncul saat scroll (client)
    Marquee.tsx                    pita teknologi
    ExternalLink.tsx, RootShell.tsx
  data/profile.ts                  SEMUA konten: teks ID/EN, proyek, kontak, mata kuliah, skill
  lib/metadata.ts
public/favicon.svg
```

Aturan kerja: ubah konten di `src/data/profile.ts`, jangan menulis teks langsung di komponen.
Menambah proyek cukup menambah satu entri di array `projects`.

## Gaya dan desain

- Palet dari logo: A hijau (`leaf`), N biru (`sky`), latar navy (`ink`). Token ada di `globals.css` bagian `@theme`
- Satu elemen utama yang bergerak: K-Means di hero. Elemen lain tenang, rata kiri, garis tipis, tanpa kartu seragam
- Animasi yang ada: urutan masuk hero (`.rise`), muncul saat scroll (`Reveal`), pita teknologi, penanda hijau pada baris proyek
- Semua animasi wajib menghormati `prefers-reduced-motion`
- Hindari: label huruf kapital di atas judul, penomoran yang bukan urutan, gradien dekoratif, panah di teks tombol
- Kualitas minimum: responsif sampai 360px, fokus keyboard terlihat, kontras teks sesuai WCAG AA

## Aturan penulisan (wajib, berlaku untuk kode, komentar, dokumen)

- Jangan pakai em dash. Gunakan tanda hubung "-"
- Jangan pakai simbol ampersand. Tulis "dan" (Indonesia) atau "and" (Inggris). Di kode, hindari operator ganda dan-logika bila ada alternatif yang setara (if bertingkat, ternary)
- Panggil pengguna "Mas Ilyun"
- Bahasa Indonesia untuk dokumentasi dan komentar

## Privasi konten publik

Repo ini bisa menjadi publik dan situsnya pasti publik. Boleh tampil: nama, gelar, afiliasi akademik umum, proyek yang sudah dirilis, tautan profil.
Jangan masukkan: urusan internal kampus, nama atasan atau kolega, mahasiswa, penelitian yang belum terbit, detail sistem internal, kredensial, alamat IP server.

## Perintah

```
npm install
npm run dev        # http://localhost:3000
npm run typecheck
npm run build      # menghasilkan folder out/
npm run preview    # melayani out/ secara lokal
```

## Deploy

- Vercel: import repo GitHub, preset Next.js, tidak perlu pengaturan tambahan. Paket Hobby hanya untuk non-komersial
- Cloudflare Pages: build command `npm run build`, output directory `out`
- VPS (aaPanel, Nginx): unggah isi folder `out/` ke root situs statis. Pastikan `try_files $uri $uri/ =404` agar `/en/` terbaca
- Untuk DNS di Cloudflare yang mengarah ke Vercel, set record ke "DNS only" (awan abu-abu)

## Yang belum selesai

- Isi `site.email` di `src/data/profile.ts` setelah email pribadi aktif (baris Email otomatis muncul)
- Proyek lain menyusul (Mas Ilyun akan menambahkan)
- Periksa afiliasi dan daftar mata kuliah di `profile.ts` sebelum rilis
- Foto atau logo pribadi belum dipasang
- README profil GitHub (repo `ahmadngiliyun00/ahmadngiliyun00`) belum dibuat
