import { groupBy } from '../group-by.ts';
import { normalizeLineLabel } from './normalize-line-label.ts';
import type { StopArrival } from './stop-arrival.ts';

/**
 * Line labels present in a batch of SIMON rows, busiest first —
 * the ambient poller infers vehicles for these (live-map US-1).
 */
export const discoverLines = (
  arrivals: readonly StopArrival[],
  limit: number,
): readonly string[] =>
  Array.from(
    groupBy(
      arrivals.filter(({ row }) => row.vehicle !== ''),
      ({ row }) => normalizeLineLabel(row.line),
    ).entries(),
  )
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, limit)
    .map(([label]) => label);
