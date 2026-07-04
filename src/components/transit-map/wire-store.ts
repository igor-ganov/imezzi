import type { Map as MapLibreMap } from 'maplibre-gl';
import { styleUrl } from '../../lib/map/style-url.ts';
import { appState } from '../../lib/store/app-state.ts';
import { startFleetPoller } from './fleet-poller.ts';

/** Store → map reactions: theme, selection, route mode, live fleet. */
export const wireStore = (
  map: MapLibreMap,
  hooks: {
    readonly syncSelection: () => void;
    readonly syncVehicles: () => void;
  },
): void => {
  appState.theme.subscribe((theme) => map.setStyle(styleUrl(theme)));
  appState.selectedLines.subscribe(hooks.syncSelection);
  appState.itinerary.subscribe(() => {
    hooks.syncSelection();
    hooks.syncVehicles();
  });
  appState.fleetSightings.subscribe(hooks.syncVehicles);
  startFleetPoller();
};
