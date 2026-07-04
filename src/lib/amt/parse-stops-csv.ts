import type { Stop } from './types.ts';

const toStop = (cells: readonly string[]): Stop => ({
  id: cells[0] ?? '',
  name: cells[1] ?? '',
  description: cells[2] ?? '',
  lat: Number(cells[3] ?? '0'),
  lon: Number(cells[4] ?? '0'),
  lines: (cells[5] ?? '').split(',').filter((id) => id !== ''),
  monitored: cells[6]?.trim() === '1',
});

/** Parse AMT app_stops.php semicolon CSV (no header row). */
export const parseStopsCsv = (csv: string): readonly Stop[] =>
  csv
    .split('\n')
    .map((row) => row.trim())
    .filter((row) => row !== '')
    .map((row) => toStop(row.split(';')));
