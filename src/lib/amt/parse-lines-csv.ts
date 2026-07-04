import type { Line } from './types.ts';

const toLine = (cells: readonly string[]): Line => ({
  id: cells[0] ?? '',
  name: cells[1] ?? '',
  from: cells[2] ?? '',
  to: cells[3] ?? '',
  category: cells[4]?.trim() ?? '',
});

/** Parse AMT app_lines.php semicolon CSV (no header row). */
export const parseLinesCsv = (csv: string): readonly Line[] =>
  csv
    .split('\n')
    .map((row) => row.trim())
    .filter((row) => row !== '')
    .map((row) => toLine(row.split(';')));
