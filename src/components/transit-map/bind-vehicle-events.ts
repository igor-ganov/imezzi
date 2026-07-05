import type { Map as MapLibreMap } from 'maplibre-gl';
import { appState } from '../../lib/store/app-state.ts';

/**
 * Tapping a fleet icon opens its stop board sheet and highlights the
 * vehicle with the selection ring (vehicle-sheet US-1).
 */
export const bindVehicleEvents = (map: MapLibreMap): void => {
  map.on('click', 'vehicles-hit', (event) => {
    const id = `${event.features?.[0]?.properties?.['id'] ?? ''}`;
    const isFleet = id.startsWith('bus:');
    appState.activeVehicleId.set(
      { true: id, false: appState.activeVehicleId.get() }[`${isFleet}`],
    );
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
