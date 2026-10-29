// Tulis dan baca berkas Excel (.xlsx) sederhana untuk ekspor dan impor data CMS, tanpa pustaka luar.
// Berkas .xlsx adalah arsip zip berisi XML. Kompresi (zlib) diberikan pemanggil lewat ZipCodec,
// supaya berkas ini tetap hanya berisi import type dan bisa diuji langsung (tests/transfer.test.mjs).
//
// Yang ditulis: lembar teks saja (semua sel berformat Teks, supaya Excel tidak mengubah nomor
// panjang menjadi 1,23E+17 atau tanggal menjadi angka seri), baris judul tebal dan dibekukan,
// lebar kolom, dan pilihan dropdown. Yang dibaca: lembar pertama, sel teks, angka, dan boolean.

export type ZipCodec = {
  deflate: (data: Uint8Array) => Uint8Array;
  inflate: (data: Uint8Array, maxLength: number) => Uint8Array;
  crc32: (data: Uint8Array) => number;
};

export type SheetColumn = { width?: number; options?: string[] };
export type Sheet = { name: string; rows: string[][]; columns?: SheetColumn[]; header?: boolean };

const AMP = String.fromCharCode(38);
const MAIN_NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
const REL_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
const PKG_REL_NS = "http://schemas.openxmlformats.org/package/2006/relationships";
const XML_HEAD = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
// Batas ukuran satu bagian arsip setelah dibuka, pelindung dari berkas zip bom.
const MAX_PART = 40 * 1024 * 1024;

// ---------- XML ----------

// Karakter kontrol selain tab dan baris baru tidak sah di XML 1.0.
function cleanText(text: string): string {
  return text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g, "");
}

function escapeXml(text: string): string {
  return cleanText(text)
    // Teks yang kebetulan berbentuk _xHHHH_ ditulis _x005F_xHHHH_, seperti Excel, supaya tidak dibaca sebagai kode karakter.
    .replace(/_x([0-9A-Fa-f]{4})_/g, "_x005F_x$1_")
    .split(AMP)
    .join(`${AMP}amp;`)
    .split("<")
    .join(`${AMP}lt;`)
    .split(">")
    .join(`${AMP}gt;`)
    .split('"')
    .join(`${AMP}quot;`);
}

const ENTITIES: Record<string, string> = { amp: AMP, lt: "<", gt: ">", quot: '"', apos: "'" };

function decodeXml(text: string): string {
  return text
    .replace(new RegExp(`${AMP}(#x[0-9a-fA-F]+|#[0-9]+|[a-z]+);`, "g"), (whole, name: string) => {
      if (name.startsWith("#x")) return String.fromCodePoint(parseInt(name.slice(2), 16));
      if (name.startsWith("#")) return String.fromCodePoint(parseInt(name.slice(1), 10));
      return ENTITIES[name] ?? whole;
    })
    // Excel menyimpan karakter kontrol (misalnya CR) sebagai _x000D_.
    .replace(/_x([0-9A-Fa-f]{4})_/g, (_, hex: string) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\r\n?/g, "\n");
}

function attrs(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of text.matchAll(/([\w:]+)\s*=\s*"([^"]*)"/g)) out[m[1]] = decodeXml(m[2]);
  for (const m of text.matchAll(/([\w:]+)\s*=\s*'([^']*)'/g)) out[m[1]] = decodeXml(m[2]);
  return out;
}

// Gabungan semua <t> di dalam satu string kaya (<si> atau <is>), tanpa teks bantu ejaan (<rPh>).
function runText(xml: string): string {
  const plain = xml.replace(/<rPh\b[\s\S]*?<\/rPh>/g, "");
  let out = "";
  for (const m of plain.matchAll(/<t\b[^>]*?(?:\/>|>([\s\S]*?)<\/t>)/g)) out += decodeXml(m[1] ?? "");
  return out;
}

// Huruf kolom (A, B, ..., AA) ke indeks mulai 0, dan sebaliknya.
function columnIndex(ref: string): number {
  const letters = /^[A-Z]+/.exec(ref);
  if (letters === null) return -1;
  let n = 0;
  for (const ch of letters[0]) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

function columnName(index: number): string {
  let n = index + 1;
  let out = "";
  while (n > 0) {
    const r = (n - 1) % 26;
    out = String.fromCharCode(65 + r) + out;
    n = Math.floor((n - 1) / 26);
  }
  return out;
}

// ---------- Zip ----------

type ZipPart = { name: string; data: Uint8Array };

const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8");

function dosDateTime(date: Date): { time: number; day: number } {
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const day = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { time, day };
}

function zip(parts: ZipPart[], codec: ZipCodec, now: Date): Uint8Array {
  const { time, day } = dosDateTime(now);
  const chunks: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;

  for (const part of parts) {
    const name = encoder.encode(part.name);
    const packed = codec.deflate(part.data);
    const crc = codec.crc32(part.data) >>> 0;

    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true);
    local.setUint16(4, 20, true);
    local.setUint16(6, 0x0800, true); // nama berkas UTF-8
    local.setUint16(8, 8, true); // deflate
    local.setUint16(10, time, true);
    local.setUint16(12, day, true);
    local.setUint32(14, crc, true);
    local.setUint32(18, packed.length, true);
    local.setUint32(22, part.data.length, true);
    local.setUint16(26, name.length, true);
    local.setUint16(28, 0, true);
    chunks.push(new Uint8Array(local.buffer), name, packed);

    const entry = new DataView(new ArrayBuffer(46));
    entry.setUint32(0, 0x02014b50, true);
    entry.setUint16(4, 20, true);
    entry.setUint16(6, 20, true);
    entry.setUint16(8, 0x0800, true);
    entry.setUint16(10, 8, true);
    entry.setUint16(12, time, true);
    entry.setUint16(14, day, true);
    entry.setUint32(16, crc, true);
    entry.setUint32(20, packed.length, true);
    entry.setUint32(24, part.data.length, true);
    entry.setUint16(28, name.length, true);
    entry.setUint32(42, offset, true);
    central.push(new Uint8Array(entry.buffer), name);

    offset += 30 + name.length + packed.length;
  }

  const centralSize = central.reduce((n, c) => n + c.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true);
  end.setUint16(8, parts.length, true);
  end.setUint16(10, parts.length, true);
  end.setUint32(12, centralSize, true);
  end.setUint32(16, offset, true);

  const all = [...chunks, ...central, new Uint8Array(end.buffer)];
  const out = new Uint8Array(all.reduce((n, c) => n + c.length, 0));
  let at = 0;
  for (const c of all) {
    out.set(c, at);
    at += c.length;
  }
  return out;
}

function unzip(data: Uint8Array, codec: ZipCodec): Map<string, () => Uint8Array> {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  let end = -1;
  for (let i = data.length - 22; i >= Math.max(0, data.length - 22 - 65535); i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      end = i;
      break;
    }
  }
  if (end < 0) throw new Error("Berkas bukan Excel (.xlsx) yang sah.");

  const count = view.getUint16(end + 10, true);
  let at = view.getUint32(end + 16, true);
  const parts = new Map<string, () => Uint8Array>();
  for (let i = 0; i < count; i++) {
    if (at + 46 > data.length) throw new Error("Berkas Excel rusak.");
    if (view.getUint32(at, true) !== 0x02014b50) throw new Error("Berkas Excel rusak.");
    const method = view.getUint16(at + 10, true);
    const packedSize = view.getUint32(at + 20, true);
    const size = view.getUint32(at + 24, true);
    const nameLen = view.getUint16(at + 28, true);
    const extraLen = view.getUint16(at + 30, true);
    const commentLen = view.getUint16(at + 32, true);
    const localAt = view.getUint32(at + 42, true);
    const name = decoder.decode(data.subarray(at + 46, at + 46 + nameLen));
    at += 46 + nameLen + extraLen + commentLen;

    parts.set(name, () => {
      if (localAt + 30 > data.length) throw new Error("Berkas Excel rusak.");
      const start = localAt + 30 + view.getUint16(localAt + 26, true) + view.getUint16(localAt + 28, true);
      const packed = data.subarray(start, start + packedSize);
      if (method === 0) return packed;
      if (method !== 8) throw new Error("Kompresi berkas Excel tidak didukung.");
      if (size > MAX_PART) throw new Error("Isi berkas Excel terlalu besar.");
      return codec.inflate(packed, MAX_PART);
    });
  }
  return parts;
}

// ---------- Tulis ----------

function sheetXml(sheet: Sheet): string {
  const header = sheet.header === true;
  const columns = sheet.columns ?? [];
  const width = Math.max(columns.length, ...sheet.rows.map((r) => r.length), 1);

  const cols = Array.from({ length: width }, (_, i) => {
    const w = columns[i]?.width ?? 18;
    // style="1": format Teks, supaya isian baru di kolom ini juga tetap teks.
    return `<col min="${i + 1}" max="${i + 1}" width="${w}" style="1" customWidth="1"/>`;
  }).join("");

  const rows = sheet.rows
    .map((row, r) => {
      const style = header ? (r === 0 ? 2 : 1) : 1;
      const cells = row
        .map((value, c) => {
          if (value === "") return "";
          const ref = `${columnName(c)}${r + 1}`;
          return `<c r="${ref}" s="${style}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`;
        })
        .join("");
      return `<row r="${r + 1}">${cells}</row>`;
    })
    .join("");

  const pane = header
    ? '<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft" activeCell="A2" sqref="A2"/></sheetView></sheetViews>'
    : '<sheetViews><sheetView workbookViewId="0"/></sheetViews>';

  // Dropdown pilihan. Daftar langsung di rumus dibatasi Excel 255 karakter.
  const lastRow = Math.max(sheet.rows.length + 500, 1000);
  const validations = columns
    .map((col, i) => {
      if (col.options === undefined) return "";
      const list = col.options.join(",");
      if (list.length > 250) return "";
      if (col.options.some((o) => o.includes(",") || o.includes('"'))) return "";
      const ref = `${columnName(i)}2:${columnName(i)}${lastRow}`;
      return `<dataValidation type="list" allowBlank="1" showErrorMessage="1" sqref="${ref}"><formula1>"${escapeXml(list)}"</formula1></dataValidation>`;
    })
    .filter((v) => v !== "");
  const dv = validations.length === 0 ? "" : `<dataValidations count="${validations.length}">${validations.join("")}</dataValidations>`;

  return `${XML_HEAD}<worksheet xmlns="${MAIN_NS}" xmlns:r="${REL_NS}">${pane}<sheetFormatPr defaultRowHeight="15"/><cols>${cols}</cols><sheetData>${rows}</sheetData>${dv}</worksheet>`;
}

const STYLES = `${XML_HEAD}<styleSheet xmlns="${MAIN_NS}">
<fonts count="2"><font><sz val="11"/><name val="Calibri"/><family val="2"/></font><font><b/><sz val="11"/><name val="Calibri"/><family val="2"/></font></fonts>
<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>
<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="49" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf><xf numFmtId="49" fontId="1" fillId="0" borderId="0" xfId="0" applyNumberFormat="1" applyFont="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf></cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;

export function writeXlsx(sheets: Sheet[], codec: ZipCodec, now: Date = new Date()): Uint8Array {
  const sheetList = sheets
    .map((s, i) => `<sheet name="${escapeXml(s.name.slice(0, 31))}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`)
    .join("");
  const workbook = `${XML_HEAD}<workbook xmlns="${MAIN_NS}" xmlns:r="${REL_NS}"><bookViews><workbookView activeTab="0"/></bookViews><sheets>${sheetList}</sheets></workbook>`;
  const sheetRels = sheets
    .map((_, i) => `<Relationship Id="rId${i + 1}" Type="${REL_NS}/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`)
    .join("");
  const workbookRels = `${XML_HEAD}<Relationships xmlns="${PKG_REL_NS}">${sheetRels}<Relationship Id="rId${sheets.length + 1}" Type="${REL_NS}/styles" Target="styles.xml"/></Relationships>`;
  const rootRels = `${XML_HEAD}<Relationships xmlns="${PKG_REL_NS}"><Relationship Id="rId1" Type="${REL_NS}/officeDocument" Target="xl/workbook.xml"/></Relationships>`;
  const sheetTypes = sheets
    .map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`)
    .join("");
  const types = `${XML_HEAD}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>${sheetTypes}<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`;

  const parts: ZipPart[] = [
    { name: "[Content_Types].xml", data: encoder.encode(types) },
    { name: "_rels/.rels", data: encoder.encode(rootRels) },
    { name: "xl/workbook.xml", data: encoder.encode(workbook) },
    { name: "xl/_rels/workbook.xml.rels", data: encoder.encode(workbookRels) },
    { name: "xl/styles.xml", data: encoder.encode(STYLES) },
    ...sheets.map((s, i) => ({ name: `xl/worksheets/sheet${i + 1}.xml`, data: encoder.encode(sheetXml(s)) })),
  ];
  return zip(parts, codec, now);
}

// ---------- Baca ----------

function partText(parts: Map<string, () => Uint8Array>, name: string): string | undefined {
  const read = parts.get(name);
  return read === undefined ? undefined : decoder.decode(read());
}

// Alamat lembar pertama di urutan buku kerja (bukan selalu sheet1.xml).
function firstSheetPath(parts: Map<string, () => Uint8Array>): string {
  const fallback = "xl/worksheets/sheet1.xml";
  const workbook = partText(parts, "xl/workbook.xml");
  const rels = partText(parts, "xl/_rels/workbook.xml.rels");
  if (workbook === undefined) return fallback;
  if (rels === undefined) return fallback;
  const sheet = /<(?:\w+:)?sheet\b([^>]*)\/?>/.exec(workbook);
  if (sheet === null) return fallback;
  const a = attrs(sheet[1]);
  const relId = a["r:id"] ?? Object.entries(a).find(([k]) => k.endsWith(":id"))?.[1];
  if (relId === undefined) return fallback;
  for (const m of rels.matchAll(/<Relationship\b([^>]*)\/?>/g)) {
    const r = attrs(m[1]);
    if (r.Id !== relId) continue;
    const target = r.Target ?? "";
    if (target.startsWith("/")) return target.slice(1);
    return `xl/${target}`.replace(/\/\.\//g, "/");
  }
  return fallback;
}

// Isi lembar pertama sebagai baris teks. Sel kosong menjadi "".
export function readXlsx(data: Uint8Array, codec: ZipCodec): string[][] {
  const parts = unzip(data, codec);
  const shared: string[] = [];
  const sst = partText(parts, "xl/sharedStrings.xml");
  if (sst !== undefined) {
    for (const m of sst.matchAll(/<si\b[^>]*?(?:\/>|>([\s\S]*?)<\/si>)/g)) shared.push(runText(m[1] ?? ""));
  }

  const xml = partText(parts, firstSheetPath(parts));
  if (xml === undefined) throw new Error("Lembar pertama tidak ditemukan di berkas Excel.");

  const rows: string[][] = [];
  let nextRow = 0;
  for (const rm of xml.matchAll(/<row\b([^>]*?)(?:\/>|>([\s\S]*?)<\/row>)/g)) {
    const ra = attrs(rm[1]);
    const r = ra.r ? Number(ra.r) - 1 : nextRow;
    nextRow = r + 1;
    const row: string[] = [];
    let nextCol = 0;
    for (const cm of (rm[2] ?? "").matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const ca = attrs(cm[1]);
      const c = ca.r ? columnIndex(ca.r) : nextCol;
      nextCol = c + 1;
      const inner = cm[2] ?? "";
      const v = /<v\b[^>]*>([\s\S]*?)<\/v>/.exec(inner);
      const raw = v === null ? "" : decodeXml(v[1]);
      let value = "";
      if (ca.t === "s") value = shared[Number(raw)] ?? "";
      else if (ca.t === "inlineStr") value = runText(inner);
      else if (ca.t === "b") value = raw === "1" ? "TRUE" : "FALSE";
      else if (ca.t === "e") value = "";
      else value = raw;
      if (c >= 0) row[c] = value;
    }
    rows[r] = Array.from(row, (x) => x ?? "");
  }
  return Array.from(rows, (x) => x ?? []);
}

// ---------- CSV ----------

// CSV dari Google Sheets, Numbers, atau Excel. Pemisah (koma, titik koma, tab) ditebak dari baris pertama.
export function parseCsv(input: string): string[][] {
  const text = input.replace(/^﻿/, "");
  const firstLine = text.split("\n", 1)[0] ?? "";
  const counts = [",", ";", "\t"].map((d) => ({ d, n: firstLine.split(d).length }));
  const delimiter = counts.sort((a, b) => b.n - a.n)[0].d;

  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else quoted = false;
      } else cell += ch;
      continue;
    }
    if (ch === '"') quoted = true;
    else if (ch === delimiter) {
      row.push(cell);
      cell = "";
    } else if (ch === "\n") {
      row.push(cell.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  if (cell !== "" || row.length > 0) {
    row.push(cell.replace(/\r$/, ""));
    rows.push(row);
  }
  return rows.map((r) => r.map((c) => c.replace(/\r\n?/g, "\n")));
}
