// Aturan kecil untuk beranda ringkas. Tanpa impor nilai, supaya bisa diuji langsung dari tests/home.test.mjs.

export const HOME_TOOLS_LIMIT = 8;

// Kanal yang tampil di Kontak beranda bila penanda "Tampil di kontak beranda" belum pernah disimpan.
export const DEFAULT_CONTACT_CHANNELS = ["linkedin", "github", "orcid", "youtube"];

// Baris alat utama di bagian Tentang: isian CMS bila ada, kalau tidak bergiliran satu alat dari
// tiap bidang kerja (urutan bidang di CMS) supaya keempat bidang terwakili. Tanpa duplikat.
export function mainTools(custom: string[] | undefined, areaTools: string[][], limit = HOME_TOOLS_LIMIT): string[] {
  const own = (custom ?? []).map((t) => t.trim()).filter((t) => t !== "");
  if (own.length > 0) return [...new Set(own)].slice(0, limit);
  const picked: string[] = [];
  const longest = Math.max(0, ...areaTools.map((list) => list.length));
  for (let round = 0; round < longest; round++) {
    for (const list of areaTools) {
      const tool = list[round];
      if (tool === undefined) continue;
      if (picked.includes(tool)) continue;
      if (picked.length < limit) picked.push(tool);
    }
  }
  return picked;
}

// Tahun paling awal di garis waktu, dari teks seperti "2017" atau "Februari 2022".
export function firstYear(whens: string[]): number | null {
  const years = whens
    .map((w) => w.match(/\b(19|20)\d{2}\b/))
    .filter((m): m is RegExpMatchArray => m !== null)
    .map((m) => Number(m[0]));
  return years.length === 0 ? null : Math.min(...years);
}

// Kanal tampil di Kontak beranda: ikuti penanda CMS bila sudah diisi, kalau belum pakai daftar bawaan.
export function showsInContact(slug: string, onHome: boolean | undefined): boolean {
  if (onHome !== undefined) return onHome;
  return DEFAULT_CONTACT_CHANNELS.includes(slug);
}
