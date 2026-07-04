import type { Map as MapLibreMap } from 'maplibre-gl';
import { appState } from '../../lib/store/app-state.ts';

/** Keep the viewport signal in sync for the ambient poller. */
export const publishViewport = (map: MapLibreMap): void => {
  const publish = (): void => {
    const bounds = map.getBounds();
    appState.viewport.set({
      west: bounds.getWest(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      north: bounds.getNorth(),
      zoom: map.getZoom(),
    });
  };
  map.on('moveend', publish);
  map.on('load', publish);
};
