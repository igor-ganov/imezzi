import { parsePrevisioni } from '../../src/lib/amt/parse-previsioni.ts';
import type { FleetSighting } from '../../src/lib/fleet/types.ts';
import { romeClock } from '../../src/lib/schedule/rome-clock.ts';
import { cachedFetch } from '../cached-fetch.ts';

const UPSTREAM =
  'https://www.amt.genova.it/amt/servizi/passaggi_xml.php?CodiceFermata=';

export interface PortionResult {
  readonly sightings: readonly FleetSighting[];
  /** Upstream fetches that failed or returned nothing parseable. */
  readonly errors: number;
}

/** SIMON rows for one sweep portion, stamped with Rome clock time. */
export const pollPortion = async (
  stopIds: readonly string[],
): Promise<PortionResult> => {
  const portions = await Promise.all(
    stopIds.map(async (stopId) => {
      const upstream = await cachedFetch(`${UPSTREAM}${stopId}`, 15).catch(
        () => undefined,
      );
      const body = (await upstream?.text()) ?? '';
      const rows = parsePrevisioni(body);
      const fetchedAtSeconds = romeClock(new Date()).seconds;
      return {
        failed: upstream === undefined || body === '',
        sightings: rows.map(
          (row): FleetSighting => ({ stopId, row, fetchedAtSeconds }),
        ),
      };
    }),
  );
  return {
    sightings: portions.flatMap(({ sightings }) => sightings),
    errors: portions.filter(({ failed }) => failed).length,
  };
};
