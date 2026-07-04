import type { Arrival } from '../../lib/amt/types.ts';
import { fetchJson } from '../../lib/api/fetch-json.ts';
import { poolMap } from '../../lib/pool-map.ts';
import type { StopArrival } from '../../lib/vehicles/stop-arrival.ts';

const PARALLEL = 6;

/** SIMON rows for a set of stops, tagged with their stop id. */
export const fetchStopArrivals = async (
  stopIds: readonly string[],
): Promise<readonly StopArrival[]> => {
  const batches = await poolMap(stopIds, PARALLEL, async (stopId) => {
    const rows = await fetchJson<readonly Arrival[]>(
      `/api/arrivals/${stopId}`,
    ).catch((): readonly Arrival[] => []);
    return rows.map((row): StopArrival => ({ stopId, row }));
  });
  return batches.flat();
};
