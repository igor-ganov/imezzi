import type { Arrival } from '../../lib/amt/types.ts';
import { fetchJson } from '../../lib/api/fetch-json.ts';
import { chunk } from '../../lib/chunk.ts';
import type { FleetSighting } from '../../lib/fleet/types.ts';
import { romeClock } from '../../lib/schedule/rome-clock.ts';

/** Matches the worker's per-invocation subrequest budget. */
const BATCH = 40;

/**
 * SIMON rows for a set of stops via the BATCH endpoint — one worker
 * invocation per 40 stops instead of one per stop (the per-stop
 * transport burned the account's daily free quota; see
 * worker/handlers/arrivals-batch.ts).
 */
export const fetchStopArrivals = async (
  stopIds: readonly string[],
): Promise<readonly FleetSighting[]> => {
  const portions = await Promise.all(
    chunk(stopIds, BATCH).map(async (ids) => {
      const byStop = await fetchJson<
        Readonly<Record<string, readonly Arrival[]>>
      >(`/api/arrivals-batch/${ids.join(',')}`).catch(
        (): Readonly<Record<string, readonly Arrival[]>> => ({}),
      );
      const fetchedAtSeconds = romeClock(new Date()).seconds;
      return Object.entries(byStop).flatMap(([stopId, rows]) =>
        rows.map((row): FleetSighting => ({ stopId, row, fetchedAtSeconds })),
      );
    }),
  );
  return portions.flat();
};
