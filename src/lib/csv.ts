export interface CsvColumn<T> {
  key: string;
  header: string;
  value: (row: T) => unknown;
}

function escapeCsvValue(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const header = columns.map((c) => escapeCsvValue(c.header)).join(",");
  const lines = rows.map((row) => columns.map((c) => escapeCsvValue(c.value(row))).join(","));
  return [header, ...lines].join("\r\n");
}
