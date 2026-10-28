# Portofolio Ahmad Ngiliyun

Situs portofolio pribadi di [ngiliyun.my.id](https://ngiliyun.my.id), dibangun dengan Next.js, TypeScript, dan Tailwind CSS. Tersedia dalam bahasa Indonesia (`/`) dan Inggris (`/en/`).

## Menjalankan

```bash
npm install
npm run dev
```

Buka http://localhost:3000. Memerlukan Node.js 20.9 atau lebih baru (lihat `.nvmrc`).

## Mengubah konten

Semua teks, daftar proyek, kontak, dan mata kuliah ada di `src/data/profile.ts`.

- Tambah proyek: tambahkan satu objek ke array `projects`
- Isi email: set `site.email`, baris Email akan muncul otomatis di bagian Kontak
- Ubah teknologi di pita bergeser: edit array `skills`

## Build

```bash
npm run build
```

Hasilnya HTML statis di folder `out/`. Untuk mencoba secara lokal: `npm run preview`.

## Deploy

| Tujuan | Pengaturan |
| --- | --- |
| Vercel | Import repo, preset Next.js |
| Cloudflare Pages | Build command `npm run build`, output directory `out` |
| VPS dengan Nginx atau aaPanel | Unggah isi `out/` ke root situs, gunakan `try_files $uri $uri/ =404` |

Jika DNS dikelola Cloudflare dan situs di Vercel, set record ke "DNS only" supaya sertifikat SSL Vercel tidak bentrok.

## Aksesibilitas

Tautan lompat ke konten, fokus keyboard terlihat, atribut `lang` per halaman, dan semua animasi mengikuti pengaturan "kurangi gerakan" di perangkat.
