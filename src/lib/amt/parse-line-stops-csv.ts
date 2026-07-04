import type { LineStopRef } from './types.ts';

const toRef = (cells: readonly string[]): LineStopRef => ({
  lineId: (cells[0] ?? '').split('_')[0] ?? '',
  direction: Number((cells[0] ?? '').split('_')[1] ?? '0'),
  stopId: cells[1] ?? '',
  position: Number(cells[2] ?? '0'),
});

/** Parse AMT app_lines_stops.php `variant_dir;stop;pos` CSV. */
export const parseLineStopsCsv = (csv: string): readonly LineStopRef[] =>
  csv
    .split('\n')
    .map((row) => row.trim())
    .filter((row) => row !== '')
    .map((row) => toRef(row.split(';')));
