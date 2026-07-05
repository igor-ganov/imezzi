import type { Map as MapLibreMap } from 'maplibre-gl';
import { inMapArea } from '../../lib/map/in-map-area.ts';
import { appState } from '../../lib/store/app-state.ts';
import { setSourceData } from './set-source-data.ts';

/**
 * Located position → blue dot + centring (only inside the Liguria
 * extent, like the reference implementation: centring elsewhere
 * would show a blank/unrelated map).
 */
export const bindMe = (map: MapLibreMap): void => {
  appState.mePosition.subscribe((position) => {
    const features = [position]
      .filter((value): value is NonNullable<typeof value> => value !== undefined)
      .map((value) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [value.lon, value.lat] },
        properties: {},
      }));
    setSourceData(map, 'me', { type: 'FeatureCollection', features });
    [position]
      .filter(
        (value): value is NonNullable<typeof value> =>
          value !== undefined && inMapArea(value.lon, value.lat),
      )
      .forEach((value) =>
        map.easeTo({
          center: [value.lon, value.lat],
          zoom: Math.max(map.getZoom(), 14),
        }),
      );
  });
};
