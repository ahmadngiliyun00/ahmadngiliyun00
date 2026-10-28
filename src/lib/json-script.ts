// JSON yang aman ditulis di dalam <script> (misalnya JSON-LD). JSON.stringify tidak meng-escape
// "<", jadi teks dari database yang berisi "</script>" bisa menutup tag lebih awal lalu
// menyisipkan skrip. Tanda kurung sudut dan ampersand diganti escape Unicode; hasilnya tetap
// JSON yang sama bagi pembacanya. Tanpa impor supaya bisa dipakai tests/json-script.test.mjs.

const UNSAFE = new RegExp(`[<>${String.fromCharCode(38)}  ]`, "g");

export function jsonForScript(value: unknown): string {
  return JSON.stringify(value).replace(UNSAFE, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`);
}
