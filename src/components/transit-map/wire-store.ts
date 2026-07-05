import type { Map as MapLibreMap } from 'maplibre-gl';
import { buildStyle } from '../../lib/map/build-style.ts';
import { hasHardwareGl } from '../../lib/map/has-hardware-gl.ts';
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
  appState.theme.subscribe((theme) =>
    map.setStyle(buildStyle(theme, hasHardwareGl())),
  );
  appState.selectedLines.subscribe(hooks.syncSelection);
  appState.itinerary.subscribe(() => {
    hooks.syncSelection();
    hooks.syncVehicles();
  });
  appState.fleetSightings.subscribe(hooks.syncVehicles);
  startFleetPoller();
};
