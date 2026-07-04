import type { SearchHit } from '../../lib/search/search-hit.ts';
import { appState } from '../../lib/store/app-state.ts';

/** Apply a chosen result: drop the pin, open the matching sheet. */
export const pickHit = (hit: SearchHit): void => {
  switch (hit.kind) {
    case 'civic':
      appState.searchPin.set({
        label: hit.civic.display,
        lon: hit.civic.lon,
        lat: hit.civic.lat,
      });
      appState.activeCivic.set(hit.civic);
      return;
    case 'stop':
      appState.searchPin.set({
        label: hit.stop.name,
        lon: hit.stop.lon,
        lat: hit.stop.lat,
      });
      appState.activeStopId.set(hit.stop.id);
      return;
  }
};
