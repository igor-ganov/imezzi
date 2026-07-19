import type { Map as MapLibreMap } from 'maplibre-gl';
import { branch } from '../../lib/branch.ts';
import { appState } from '../../lib/store/app-state.ts';

/**
 * Tapping a fleet icon behaves exactly like tapping its live row in a
 * stop board: draw its line of travel, ring it, and open its stop
 * sheet (bind-vehicle-route + vehicle-sheet). Schedule pictograms
 * carry no live target, so only `bus:` ids act.
 */
export const bindVehicleEvents = (map: MapLibreMap): void => {
  map.on('click', 'vehicles-hit', (event) => {
    const id = `${event.features?.[0]?.properties?.['id'] ?? ''}`;
    branch(id.startsWith('bus:'))(
      () => {
        appState.selectedVehicleId.set(id);
        appState.activeVehicleId.set(id);
      },
      () => undefined,
    );
  });
  map.on('mouseenter', 'vehicles-hit', () => {
    map.getCanvas().style.cursor = 'pointer';
  });
  map.on('mouseleave', 'vehicles-hit', () => {
    map.getCanvas().style.cursor = '';
  });
};
