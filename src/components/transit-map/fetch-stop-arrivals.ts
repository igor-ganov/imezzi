import type { Arrival } from '../../lib/amt/types.ts';
import { fetchJson } from '../../lib/api/fetch-json.ts';
import type { FleetSighting } from '../../lib/fleet/types.ts';
import { poolMap } from '../../lib/pool-map.ts';
import { romeClock } from '../../lib/schedule/rome-clock.ts';

const PARALLEL = 6;

/** SIMON rows for a set of stops, stamped with their fetch time. */
export const fetchStopArrivals = async (
  stopIds: readonly string[],
): Promise<readonly FleetSighting[]> => {
  const batches = await poolMap(stopIds, PARALLEL, async (stopId) => {
    const rows = await fetchJson<readonly Arrival[]>(
      `/api/arrivals/${stopId}`,
    ).catch((): readonly Arrival[] => []);
    const fetchedAtSeconds = romeClock(new Date()).seconds;
    return rows.map(
      (row): FleetSighting => ({ stopId, row, fetchedAtSeconds }),
    );
  });
  return batches.flat();
};
