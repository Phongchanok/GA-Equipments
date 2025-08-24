// src/utils/csv.js
export function toCSV(rows, headers) {
const escape = (v) => {
if (v === null || v === undefined) return '';
const s = String(v);
if (s.includes(',') || s.includes('"') || s.includes('\n')) return '"' + s.replace(/"/g, '""') + '"';
return s;
};
const head = headers.join(',');
const body = rows.map(r => headers.map(h => escape(r[h])).join(',')).join('\n');
return head + '\n' + body + '\n';
}