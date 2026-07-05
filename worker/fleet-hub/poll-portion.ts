import { parsePrevisioni } from '../../src/lib/amt/parse-previsioni.ts';
import type { FleetSighting } from '../../src/lib/fleet/types.ts';
import { romeClock } from '../../src/lib/schedule/rome-clock.ts';
import { cachedFetch } from '../cached-fetch.ts';

const UPSTREAM =
  'https://www.amt.genova.it/amt/servizi/passaggi_xml.php?CodiceFermata=';

/** SIMON rows for one sweep portion, stamped with Rome clock time. */
export const pollPortion = async (
  stopIds: readonly string[],
): Promise<readonly FleetSighting[]> => {
  const portions = await Promise.all(
    stopIds.map(async (stopId) => {
      const upstream = await cachedFetch(`${UPSTREAM}${stopId}`, 15).catch(
        () => undefined,
      );
      const rows = parsePrevisioni((await upstream?.text()) ?? '');
      const fetchedAtSeconds = romeClock(new Date()).seconds;
      return rows.map(
        (row): FleetSighting => ({ stopId, row, fetchedAtSeconds }),
      );
    }),
  );
  return portions.flat();
};
