import type { CivicHit } from '../../lib/civic/civic-hit.ts';
import { searchCivics } from '../../lib/civic/search-civics.ts';
import { debounce } from '../../lib/debounce.ts';
import type { RoutePlannerHost } from './planner-host.ts';

/** Debounced civic-aware destination lookup for the panel. */
export const makeDestinationSearch = (
  host: RoutePlannerHost,
): ((query: string) => void) =>
  debounce(350, (query: string) => {
    void {
      true: async () => {
        host.destinationHits = await searchCivics(query).catch(
          (): readonly CivicHit[] => [],
        );
      },
      false: () => {
        host.destinationHits = [];
      },
    }[`${query.trim().length >= 3}`]();
  });
