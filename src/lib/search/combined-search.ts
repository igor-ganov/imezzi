import { branch } from '../branch.ts';
import type { CivicHit } from '../civic/civic-hit.ts';
import { searchCivics } from '../civic/search-civics.ts';
import { loadStops } from '../data/load-stops.ts';
import type { Stop } from '../amt/types.ts';
import type { SearchHit } from './search-hit.ts';
import { searchStops } from './search-stops.ts';

const LIMIT = 8;

/**
 * One search box, two worlds: civic addresses and AMT stops. Queries
 * with digits are address-shaped (civics first); plain text leads
 * with stops (civic-addresses US-2 + live-map US-3).
 */
export const combinedSearch = async (
  query: string,
): Promise<readonly SearchHit[]> => {
  const [civics, stops] = await Promise.all([
    searchCivics(query).catch((): readonly CivicHit[] => []),
    loadStops()
      .then((all) => searchStops(all, query, 4))
      .catch((): readonly Stop[] => []),
  ]);
  const civicHits = civics.map(
    (civic): SearchHit => ({ kind: 'civic', civic }),
  );
  const stopHits = stops.map((stop): SearchHit => ({ kind: 'stop', stop }));
  return branch(/\d/.test(query))(
    () => [...civicHits, ...stopHits],
    () => [...stopHits, ...civicHits],
  ).slice(0, LIMIT);
};
