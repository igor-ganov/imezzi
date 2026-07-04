import type { Arrival } from '../amt/types.ts';
import { parseCountdown } from './parse-countdown.ts';
import type { BoardRow } from './board-row.ts';

const liveRow = (arrival: Arrival, nowSeconds: number): BoardRow => ({
  line: arrival.line.replace(/^0+(?=\d)/, ''),
  mode: 'bus',
  destination: arrival.destination,
  etaSeconds: parseCountdown(arrival.countdown, nowSeconds),
  approximated: arrival.theoretical,
  full: arrival.full,
});

/**
 * Merge live SIMON predictions with timetable rows into one board,
 * soonest first, capped for the sheet (live-map AC-3.1, AC-3.2).
 */
export const mergeBoardRows = (
  live: readonly Arrival[],
  timetable: readonly BoardRow[],
  nowSeconds: number,
  limit: number,
): readonly BoardRow[] =>
  [...live.map((arrival) => liveRow(arrival, nowSeconds)), ...timetable]
    .sort((a, b) => a.etaSeconds - b.etaSeconds)
    .slice(0, limit);
