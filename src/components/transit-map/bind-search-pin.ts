import type { Map as MapLibreMap } from 'maplibre-gl';
import { appState } from '../../lib/store/app-state.ts';
import { setSourceData } from './set-source-data.ts';

/** Fly to the picked search result and drop the labelled pin. */
export const bindSearchPin = (map: MapLibreMap): void => {
  appState.searchPin.subscribe((hit) => {
    const features = [hit]
      .filter((value): value is NonNullable<typeof value> => value !== undefined)
      .map((value) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [value.lon, value.lat] },
        properties: { label: value.label },
      }));
    setSourceData(map, 'pin', { type: 'FeatureCollection', features });
    features.forEach(() =>
      map.flyTo({
        center: [hit?.lon ?? 0, hit?.lat ?? 0],
        zoom: Math.max(map.getZoom(), 17.2),
        duration: 900,
      }),
    );
  });
};
