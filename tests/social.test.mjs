// Uji aturan postingan media sosial: pembersihan caption, tagar, topik, tanggal, alamat gambar,
// dan pembacaan Shares.csv dari ekspor data LinkedIn.
// Jalankan: npm test

import assert from "node:assert/strict";
import { test } from "node:test";
import { importTs } from "../scripts/lib/load-ts.mjs";

const { cleanCaption, captionTitle, parseTopicRules, matchTopic, partialDateFrom, isAllowedMediaUrl, socialSlug, parseLinkedinShares, linkedinId } =
  await importTs(new URL("../src/lib/social.ts", import.meta.url));

const EM_DASH = String.fromCharCode(0x2014);
const AMPERSAND = String.fromCharCode(0x26);
const ROCKET = String.fromCodePoint(0x1f680);
const THUMBS = String.fromCodePoint(0x1f44d, 0x1f3fd);
const FLAG = String.fromCodePoint(0x1f1ee, 0x1f1e9);
const KEYCAP_ONE = `1${String.fromCharCode(0xfe0f, 0x20e3)}`;

test("caption dibersihkan dari emoji, em dash, dan ampersand", () => {
  const raw = `Hari pertama PIJAK ${ROCKET}${THUMBS}\nMateri AI ${EM_DASH} praktik${AMPERSAND}diskusi ${FLAG}\n${KEYCAP_ONE} sesi`;
  const { caption } = cleanCaption(raw);
  assert.equal(caption, "Hari pertama PIJAK\nMateri AI - praktik dan diskusi\n1 sesi");
  assert.ok(!caption.includes(EM_DASH));
  assert.ok(!caption.includes(AMPERSAND));
});

test("tagar dikumpulkan tanpa duplikat dan blok tagar di akhir dibuang", () => {
  const { caption, tags } = cleanCaption("Kelas #AI hari ini seru.\n\n#pijak #Beasiswa #ai\n#Cirebon");
  assert.equal(caption, "Kelas #AI hari ini seru.");
  assert.deepEqual(tags, ["AI", "pijak", "Beasiswa", "Cirebon"]);
});

test("spasi dan baris kosong berlebih dirapikan", () => {
  assert.equal(cleanCaption("  satu   dua \r\n\r\n\r\n\r\ntiga  ").caption, "satu dua\n\ntiga");
});

test("judul CMS memakai baris pertama dan dipotong di batas kata", () => {
  assert.equal(captionTitle("Judul pendek\nisi"), "Judul pendek");
  const long = captionTitle("Ini adalah kalimat panjang sekali yang harus dipotong supaya muat di daftar CMS tanpa memotong kata", 40);
  assert.ok(long.endsWith("..."));
  assert.ok(long.length <= 43);
  assert.ok(!long.includes("memotong"));
});

test("aturan topik dibaca per baris dan baris salah dilaporkan", () => {
  const { rules, errors } = parseTopicRules(["#PIJAK | Program PIJAK", "beasiswa | Beasiswa", "tanpa pemisah", " | kosong"]);
  assert.deepEqual(rules, [
    { keyword: "pijak", topic: "Program PIJAK" },
    { keyword: "beasiswa", topic: "Beasiswa" },
  ]);
  assert.deepEqual(errors, ["tanpa pemisah", " | kosong"]);
});

test("topik cocok lewat tagar atau isi caption, aturan pertama menang", () => {
  const { rules } = parseTopicRules(["pijak | Program PIJAK", "kelas | Mengajar"]);
  assert.equal(matchTopic(rules, "Kelas fasilitator", ["PIJAK"]), "Program PIJAK");
  assert.equal(matchTopic(rules, "Sesi Kelas AI", []), "Mengajar");
  assert.equal(matchTopic(rules, "Liburan", ["pantai"]), undefined);
});

test("tanggal dibaca dalam waktu Indonesia barat", () => {
  assert.deepEqual(partialDateFrom("2026-05-10T08:12:33+0000"), { year: 2026, month: 5, day: 10 });
  // 20.00 UTC sudah berganti hari di WIB.
  assert.deepEqual(partialDateFrom("2026-05-10T20:00:00+0000"), { year: 2026, month: 5, day: 11 });
  assert.deepEqual(partialDateFrom("2026-12-31 18:30:00"), { year: 2027, month: 1, day: 1 });
  assert.equal(partialDateFrom("bukan tanggal"), null);
});

test("gambar hanya diunduh dari CDN Meta lewat https", () => {
  assert.ok(isAllowedMediaUrl("https://scontent-sin6-1.cdninstagram.com/v/t51.jpg?x=1"));
  assert.ok(isAllowedMediaUrl("https://scontent.xx.fbcdn.net/v/t39.jpg"));
  assert.ok(!isAllowedMediaUrl("http://scontent.cdninstagram.com/a.jpg"));
  assert.ok(!isAllowedMediaUrl("https://evil.example/cdninstagram.com/a.jpg"));
  assert.ok(!isAllowedMediaUrl("https://cdninstagram.com.evil.example/a.jpg"));
  assert.ok(!isAllowedMediaUrl("https://127.0.0.1/a.jpg"));
});

test("slug dibentuk dari platform dan ID sumber", () => {
  assert.equal(socialSlug("instagram", "17912345678901234"), "instagram-17912345678901234");
  assert.equal(socialSlug("facebook", "1000123_5678"), "facebook-1000123-5678");
});

test("ID LinkedIn dibaca dari tautan postingan", () => {
  assert.equal(linkedinId("https://www.linkedin.com/feed/update/urn%3Ali%3Ashare%3A7123456789012345678"), "share-7123456789012345678");
  assert.equal(linkedinId("https://www.linkedin.com/feed/update/urn:li:activity:7000000000000000001/"), "activity-7000000000000000001");
  assert.equal(linkedinId("https://www.linkedin.com/in/ahmadngiliyun"), null);
  assert.equal(linkedinId("https://evil.example/urn:li:share:1"), null);
});

test("Shares.csv LinkedIn dibaca, baris tanpa tautan postingan dilewati", () => {
  const rows = [
    ["Date", "ShareLink", "ShareCommentary", "SharedUrl", "MediaUrl", "Visibility"],
    ["2026-03-02 01:15:00", "https://www.linkedin.com/feed/update/urn%3Ali%3Ashare%3A111", 'Baris satu\nBaris "dua"', "", "", "MEMBER_NETWORK"],
    ["2026-03-01 10:00:00", "", "Tanpa tautan", "", "", "MEMBER_NETWORK"],
    ["", "", "", "", "", ""],
  ];
  const { items, skipped } = parseLinkedinShares(rows);
  assert.equal(skipped, 1);
  assert.equal(items.length, 1);
  assert.deepEqual(items[0], {
    sourceId: "share-111",
    url: "https://www.linkedin.com/feed/update/urn%3Ali%3Ashare%3A111",
    text: 'Baris satu\nBaris "dua"',
    date: { year: 2026, month: 3, day: 2 },
  });
  assert.throws(() => parseLinkedinShares([["Nama", "Email"]]), /Shares\.csv/);
});

test("postingan dikelompokkan per topik, terbaru di atas, tanpa topik di akhir", async () => {
  const { groupByTopic } = await importTs(new URL("../src/lib/social.ts", import.meta.url));
  const d = (year, month, day) => ({ year, month, day });
  const groups = groupByTopic([
    { slug: "a", topic: "Mengajar", date: d(2026, 1, 5) },
    { slug: "b", date: d(2026, 9, 1) },
    { slug: "c", topic: "Program PIJAK", date: d(2026, 8, 20) },
    { slug: "d", topic: "program pijak", date: d(2026, 10, 2) },
    { slug: "e", topic: " ", date: null },
  ]);
  assert.deepEqual(
    groups.map((g) => [g.topic, g.id, g.items.map((i) => i.slug)]),
    [
      ["program pijak", "topik-program-pijak", ["d", "c"]],
      ["Mengajar", "topik-mengajar", ["a"]],
      [null, "lainnya", ["b", "e"]],
    ],
  );
});
