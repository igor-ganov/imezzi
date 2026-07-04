import type { Map as MapLibre } from 'maplibre-gl';
import { baseLayerSpecs } from './base-layer-specs.ts';
import { vehicleLayerSpecs } from './vehicle-layer-specs.ts';

/** (Re)create imezzi sources and layers after a style (re)load. */
export const addLayers = (map: MapLibre, theme: 'light' | 'dark'): void => {
  ['stops', 'route-lines', 'vehicles'].forEach(
    (id) =>
      map.getSource(id) ??
      map.addSource(id, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      }),
  );
  [...baseLayerSpecs(theme), ...vehicleLayerSpecs(theme)].forEach(
    (spec) => map.getLayer(spec.id) ?? map.addLayer(spec),
  );
};
