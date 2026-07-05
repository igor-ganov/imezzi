import type { Map as MapLibreMap } from 'maplibre-gl';
import { appState } from '../../lib/store/app-state.ts';

const NONE = '___none___';

/**
 * Highlight ring for the vehicle a route leg was clicked on: the
 * layer filters to the selected id (route US-3/US-4).
 */
export const bindSelectedVehicle = (map: MapLibreMap): void => {
  appState.selectedVehicleId.subscribe((id) => {
    try {
      map.setFilter('vehicles-selected', ['==', ['get', 'id'], id ?? NONE]);
    } catch {
      return;
    }
  });
};
