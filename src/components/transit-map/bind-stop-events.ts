import type { Map as MapLibreMap } from 'maplibre-gl';
import { appState } from '../../lib/store/app-state.ts';

/** Stop layer interactivity: click opens the sheet, hover cursor. */
export const bindStopEvents = (map: MapLibreMap): void => {
  map.on('click', 'stops-circle', (event) => {
    const id = event.features?.[0]?.properties?.['id'];
    appState.activeStopId.set(`${id ?? ''}` || undefined);
  });
  map.on('mouseenter', 'stops-circle', () => {
    map.getCanvas().style.cursor = 'pointer';
  });
  map.on('mouseleave', 'stops-circle', () => {
    map.getCanvas().style.cursor = '';
  });
};
