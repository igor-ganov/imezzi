import type { Map as MapLibreMap } from 'maplibre-gl';
import { appState } from '../../lib/store/app-state.ts';

/**
 * Tapping a fleet icon draws its line of travel (bind-vehicle-route)
 * and rings it — the stop list is not what the user wants here; the
 * board sheet stays reachable from a stop's live row (row-click.ts).
 */
export const bindVehicleEvents = (map: MapLibreMap): void => {
  map.on('click', 'vehicles-hit', (event) => {
    const id = `${event.features?.[0]?.properties?.['id'] ?? ''}`;
    const isFleet = id.startsWith('bus:');
    appState.selectedVehicleId.set(
      { true: id, false: appState.selectedVehicleId.get() }[`${isFleet}`],
    );
  });
  map.on('mouseenter', 'vehicles-hit', () => {
    map.getCanvas().style.cursor = 'pointer';
  });
  map.on('mouseleave', 'vehicles-hit', () => {
    map.getCanvas().style.cursor = '';
  });
};
