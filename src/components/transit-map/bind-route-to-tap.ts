import type { Map as MapLibreMap } from 'maplibre-gl';
import { onLongPress } from '../../lib/map/long-press.ts';
import { routeTo } from '../../lib/route/route-to.ts';

const label = (lat: number, lon: number): string =>
  `Pinned point (${lat.toFixed(4)}, ${lon.toFixed(4)})`;

/**
 * Route to an arbitrary map point: right-click on desktop,
 * long-press on touch — either sets the destination and opens the
 * planner (route US-5). Regular clicks stay reserved for stops,
 * civics and endpoint picking.
 */
export const bindRouteToTap = (map: MapLibreMap): void => {
  map.on('contextmenu', (event) => {
    event.preventDefault();
    routeTo({
      name: label(event.lngLat.lat, event.lngLat.lng),
      lat: event.lngLat.lat,
      lon: event.lngLat.lng,
    });
  });
  onLongPress(map.getCanvas(), (clientX, clientY) => {
    const rect = map.getCanvas().getBoundingClientRect();
    const at = map.unproject([clientX - rect.left, clientY - rect.top]);
    routeTo({ name: label(at.lat, at.lng), lat: at.lat, lon: at.lng });
  });
};
