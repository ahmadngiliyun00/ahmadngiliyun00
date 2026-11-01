// Uji impor ekspor data Instagram dan Facebook serta pembaca ZIP di peramban.
// Semua fixture di berkas ini data buatan; jangan menyalin isi ekspor asli ke sini.
// Jalankan: npm test

import assert from "node:assert/strict";
import { test } from "node:test";
import { deflateRawSync } from "node:zlib";
import { importTs } from "../scripts/lib/load-ts.mjs";

const ex = await importTs(new URL("../src/lib/social-export.ts", import.meta.url));
const zip = await importTs(new URL("../src/lib/zip-reader.ts", import.meta.url));

// Meta menulis UTF-8 sebagai byte per huruf: "é" menjadi "Ã©", emoji piala menjadi 4 huruf.
const mojibake = (text) => Array.from(new TextEncoder().encode(text), (b) => String.fromCharCode(b)).join("");
const TROPHY = String.fromCodePoint(0x1f3c6);

test("mojibake Meta dibaca ulang sebagai UTF-8, teks yang sudah benar dibiarkan", () => {
  assert.equal(ex.fixMetaText(mojibake(`Kafé ${TROPHY} juara`)), `Kafé ${TROPHY} juara`);
  assert.equal(ex.fixMetaText("Teks biasa"), "Teks biasa");
  assert.equal(ex.fixMetaText(`Sudah benar ${TROPHY}`), `Sudah benar ${TROPHY}`);
  // Byte yang bukan UTF-8 sah tidak diubah.
  assert.equal(ex.fixMetaText("harga £ 5"), "harga £ 5");
});

test("jenis arsip dikenali dari daftar isi ZIP", () => {
  assert.deepEqual(ex.detectExport(["your_instagram_activity/media/posts_1.json", "your_instagram_activity/media/posts.json", "media/posts/1.jpg"]), {
    kind: "instagram",
    files: ["your_instagram_activity/media/posts.json", "your_instagram_activity/media/posts_1.json"],
  });
  assert.equal(ex.detectExport(["ekspor/content/posts_1.json"]).kind, "instagram");
  assert.deepEqual(ex.detectExport(["your_facebook_activity/posts/your_posts__check_ins__photos_and_videos_1.json", "your_facebook_activity/posts/album/0.json"]), {
    kind: "facebook",
    files: ["your_facebook_activity/posts/your_posts__check_ins__photos_and_videos_1.json"],
  });
  assert.equal(ex.detectExport(["posts/your_posts_1.json"]).kind, "facebook");
  assert.deepEqual(ex.detectExport(["Profile.csv", "Shares.csv"]), { kind: "linkedin", file: "Shares.csv" });
});

test("arsip yang salah ditolak dengan pesan yang menjelaskan langkah berikutnya", () => {
  assert.throws(() => ex.detectExport(["your_instagram_activity/media/posts_1.html"]), /HTML.*JSON/);
  assert.throws(() => ex.detectExport(["Profile.csv"]), /Shares\.csv.*Posts/);
  assert.throws(() => ex.detectExport(["your_instagram_activity/messages/inbox/a.json"]), /tidak memuat postingan/);
  assert.throws(() => ex.detectExport(["foto.jpg"]), /tidak dikenali/);
});

// ---------- Instagram ----------

const igLabeled = (fbid, timestamp, caption, uri, extra = {}) => ({
  timestamp,
  media: [],
  fbid,
  label_values: [
    { label: "Media", media: [{ uri, creation_timestamp: timestamp - 1, title: caption }] },
    { label: "Draft", value: extra.draft ?? "False" },
    { label: "Published", value: extra.published ?? "True" },
    { label: "Caption", value: caption },
    { title: "Hashtags", dict: [] },
  ],
});

test("Instagram: format berlabel didahulukan, carousel memakai daftar gambar format lama", () => {
  const labeled = [
    igLabeled("11112222333344445", 1760000000, mojibake(`Kelas fasilitator ${TROPHY} #pijak`), "media/posts/11112222333344445.jpg"),
    igLabeled("55556666777788889", 1750000000, "Album kegiatan", "media/posts/90000000000000001.webp"),
    igLabeled("99990000111122223", 1740000000, "Draf", "media/posts/99990000111122223.jpg", { draft: "True" }),
  ];
  const legacy = [
    { media: [{ uri: "media/posts/11112222333344445.jpg", creation_timestamp: 1759999999, title: "Kelas fasilitator" }] },
    {
      title: "Album kegiatan",
      creation_timestamp: 1749999999,
      media: [
        { uri: "media/posts/80000000000000001.webp", creation_timestamp: 1749999998, title: "" },
        { uri: "media/posts/80000000000000002.webp", creation_timestamp: 1749999998, title: "" },
        { uri: "media/posts/80000000000000003.mp4", creation_timestamp: 1749999998, title: "" },
      ],
    },
    { media: [{ uri: "media/posts/70000000000000001.jpg", creation_timestamp: 1700000000, title: "Hanya di format lama" }] },
  ];
  const res = ex.parseInstagramExport({
    "your_instagram_activity/media/posts.json": JSON.stringify(labeled),
    "your_instagram_activity/media/posts_1.json": JSON.stringify(legacy),
  });
  assert.equal(res.platform, "instagram");
  assert.deepEqual(res.skipped, { draft: 1 });
  assert.deepEqual(res.posts.map((p) => p.sourceId), ["11112222333344445", "55556666777788889", "t1700000000-70000000000000001"]);
  assert.equal(res.posts[0].text, `Kelas fasilitator ${TROPHY} #pijak`);
  assert.deepEqual(res.posts[1].media.map((m) => m.kind), ["image", "image", "video"]);
  assert.equal(ex.coverImage(res.posts[1]).path, "media/posts/80000000000000001.webp");
  assert.match(res.posts[1].notes[0], /3 media/);
});

test("Instagram: berkas rusak atau tanpa postingan ditolak", () => {
  assert.throws(() => ex.parseInstagramExport({ "posts_1.json": "{bukan json" }), /rusak atau bukan JSON/);
  assert.throws(() => ex.parseInstagramExport({ "posts_1.json": "[{\"apa\":1}]" }), /tidak dikenali/);
});

test("ID turunan stabil dari waktu dan media, atau hash teks bila tanpa media", () => {
  const a = ex.derivedSourceId(1700000000, [{ path: "x/media/123456_789.jpg", kind: "image" }], "teks");
  assert.equal(a, "t1700000000-123456_789");
  assert.equal(ex.derivedSourceId(1700000000, [], "teks"), ex.derivedSourceId(1700000000, [], "teks"));
  assert.notEqual(ex.derivedSourceId(1700000000, [], "teks satu"), ex.derivedSourceId(1700000000, [], "teks dua"));
  assert.match(ex.derivedSourceId(1700000000, [], "teks"), /^t1700000000-[0-9a-f]{8}$/);
});

// ---------- Facebook ----------

const fbPost = (timestamp, title, post, attachments = []) => ({
  timestamp,
  title: mojibake(title),
  data: post === null ? [{ update_timestamp: timestamp }] : [{ post: mojibake(post) }, {}],
  attachments,
});
const photo = (uri) => ({ data: [{ media: { uri, creation_timestamp: 1, title: "Foto", media_metadata: { photo_metadata: { exif_data: [{ upload_ip: "192.0.2.1" }] } } } }] });
const link = (url) => ({ data: [{ external_context: { url } }] });

test("pemilik akun dibaca dari awalan judul yang paling umum", () => {
  assert.equal(ex.ownerName(["Budi Contoh membagikan tautan.", "Budi Contoh memperbarui statusnya.", "Budi Contoh menambahkan foto baru.", "Sari menulis di profil Budi Contoh."]), "Budi Contoh");
  assert.equal(ex.ownerName([]), "");
});

test("Facebook: postingan sendiri diimpor dengan catatan, profil orang lain dan isian kosong dilewati", () => {
  const posts = [
    fbPost(1760000300, "Budi Contoh menambahkan 2 foto baru.", `Lokakarya ${TROPHY} hari ini`, [
      photo("your_facebook_activity/posts/media/Foto_1/1111111111111111.jpg"),
      photo("your_facebook_activity/posts/media/Foto_1/2222222222222222.jpg"),
    ]),
    fbPost(1760000200, "Budi Contoh memperbarui statusnya.", "Status tanpa gambar"),
    fbPost(1760000200, "Budi Contoh memperbarui statusnya.", "Status lain di detik yang sama"),
    fbPost(1760000100, "Budi Contoh menulis di profil Sari Rekaan.", "Selamat ulang tahun"),
    fbPost(1760000050, "Budi Contoh menulis di profil Budi Contoh.", "Catatan di profil sendiri"),
    fbPost(1760000000, "Budi Contoh membagikan tautan.", null, [link("https://contoh.id/artikel")]),
    fbPost(1759999000, "Budi Contoh membagikan tautan ke Grup Belajar.", "Materi minggu ini", [link("https://contoh.id/materi?utm_source=fb")]),
    fbPost(1759998000, "Budi Contoh Membagikan dari Instagram", "Sama dengan Instagram", [photo("your_facebook_activity/posts/media/Foto_1/3333333333333333.jpg")]),
    fbPost(1759997000, "Budi Contoh memperbarui statusnya.", "Video kelas", [photo("your_facebook_activity/posts/media/videos/4444.mp4")]),
  ];
  const res = ex.parseFacebookExport({ "your_facebook_activity/posts/your_posts__check_ins__photos_and_videos_1.json": JSON.stringify(posts) });
  assert.equal(res.platform, "facebook");
  assert.deepEqual(res.skipped, { "other-profile": 1, empty: 1 });
  assert.equal(res.posts.length, 7);
  const [first, statusA, statusB, ownProfile, shared, fromIg, video] = res.posts;
  assert.equal(first.text, `Lokakarya ${TROPHY} hari ini`);
  assert.equal(first.sourceId, "t1760000300-1111111111111111");
  assert.equal(ex.coverImage(first).path, "your_facebook_activity/posts/media/Foto_1/1111111111111111.jpg");
  // Setiap postingan Facebook diberi peringatan audiens; tidak ada yang otomatis aman.
  assert.ok(res.posts.every((p) => /audiens/.test(p.notes[0])));
  assert.match(first.notes.join(" "), /2 media/);
  // Dua status di detik yang sama tetap punya ID berbeda.
  assert.notEqual(statusA.sourceId, statusB.sourceId);
  assert.equal(ownProfile.text, "Catatan di profil sendiri");
  assert.match(shared.notes.join(" "), /grup, halaman/);
  assert.match(shared.notes.join(" "), /Tautan yang dibagikan: https:\/\/contoh\.id\/materi$/m);
  assert.ok(!shared.notes.join(" ").includes(String.fromCharCode(38)));
  assert.match(fromIg.notes.join(" "), /dari Instagram/);
  assert.equal(ex.coverImage(video), undefined);
  assert.match(video.notes.join(" "), /video tidak disalin/);
  // Data teknis seperti IP unggahan tidak pernah ikut hasil.
  assert.ok(!JSON.stringify(res).includes("192.0.2.1"));
});

test("Facebook: judul berbahasa Inggris dan postingan orang lain di linimasa", () => {
  const posts = [
    fbPost(1700000300, "Budi Contoh updated his status.", "Hello"),
    fbPost(1700000200, "Budi Contoh shared a link.", "Read this"),
    fbPost(1700000100, "Budi Contoh wrote on Sari Rekaan's timeline.", "Happy birthday"),
    fbPost(1700000000, "Sari Rekaan posted on Budi Contoh's timeline.", "Hi Budi"),
  ];
  const res = ex.parseFacebookExport({ "posts/your_posts_1.json": JSON.stringify(posts) });
  assert.deepEqual(res.posts.map((p) => p.text), ["Hello", "Read this"]);
  assert.deepEqual(res.skipped, { "other-profile": 1, "not-owner": 1 });
});

test("Facebook: berkas tanpa postingan ditolak", () => {
  assert.throws(() => ex.parseFacebookExport({ "your_posts_1.json": "[]" }), /kosong atau tidak dikenali/);
});

// ---------- Pembaca ZIP ----------

// ZIP kecil buatan: satu berkas stored, satu deflate, satu nama UTF-8, dibungkus folder.
function makeZip(files) {
  const locals = [];
  const central = [];
  let offset = 0;
  for (const { name, data, deflate } of files) {
    const nameBuf = Buffer.from(name, "utf8");
    const body = deflate ? deflateRawSync(data) : data;
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(deflate ? 8 : 0, 8);
    local.writeUInt32LE(body.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    locals.push(local, nameBuf, body);
    const cen = Buffer.alloc(46);
    cen.writeUInt32LE(0x02014b50, 0);
    cen.writeUInt16LE(20, 4);
    cen.writeUInt16LE(20, 6);
    cen.writeUInt16LE(0x0800, 8);
    cen.writeUInt16LE(deflate ? 8 : 0, 10);
    cen.writeUInt32LE(body.length, 20);
    cen.writeUInt32LE(data.length, 24);
    cen.writeUInt16LE(nameBuf.length, 28);
    cen.writeUInt32LE(offset, 42);
    central.push(cen, nameBuf);
    offset += 30 + nameBuf.length + body.length;
  }
  const dir = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(dir.length, 12);
  end.writeUInt32LE(offset, 16);
  return new Blob([Buffer.concat([...locals, dir, end])]);
}

test("ZIP dibaca per berkas: stored, deflate, nama UTF-8, dan path di dalam folder", async () => {
  const json = Buffer.from(JSON.stringify([{ media: [{ uri: "media/posts/1.jpg", creation_timestamp: 1700000000, title: "Halo" }] }]));
  const image = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3]);
  const blob = makeZip([
    { name: "ekspor/your_instagram_activity/media/posts_1.json", data: json, deflate: true },
    { name: "ekspor/media/posts/1.jpg", data: image, deflate: false },
    { name: "ekspor/catatan-é.txt", data: Buffer.from("isi"), deflate: true },
  ]);
  const entries = await zip.listZip(blob);
  assert.deepEqual(entries.map((e) => e.name), ["ekspor/your_instagram_activity/media/posts_1.json", "ekspor/media/posts/1.jpg", "ekspor/catatan-é.txt"]);
  const kind = ex.detectExport(entries.map((e) => e.name));
  assert.equal(kind.kind, "instagram");
  const text = await zip.readZipText(blob, zip.findEntry(entries, kind.files[0]));
  const res = ex.parseInstagramExport({ [kind.files[0]]: text });
  const cover = zip.findEntry(entries, ex.coverImage(res.posts[0]).path);
  assert.equal(cover.name, "ekspor/media/posts/1.jpg");
  assert.deepEqual(Buffer.from(await (await zip.readZipEntry(blob, cover)).arrayBuffer()), image);
});

test("berkas yang bukan ZIP ditolak dengan pesan jelas", async () => {
  await assert.rejects(() => zip.listZip(new Blob(["bukan zip sama sekali"])), /bukan arsip ZIP/);
});
