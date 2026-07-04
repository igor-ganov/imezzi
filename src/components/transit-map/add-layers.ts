import type { Map as MapLibre } from 'maplibre-gl';
import { addArrowImage } from './add-arrow-image.ts';
import { baseLayerSpecs } from './base-layer-specs.ts';
import { civicLayerSpecs } from './civic-layer-specs.ts';
import { pinLayerSpecs } from './pin-layer-specs.ts';
import { routeLayerSpecs } from './route-layer-specs.ts';
import { vehicleLayerSpecs } from './vehicle-layer-specs.ts';

/** (Re)create imezzi sources and layers after a style (re)load. */
export const addLayers = (map: MapLibre, theme: 'light' | 'dark'): void => {
  addArrowImage(map);
  ['stops', 'route-lines', 'route', 'vehicles', 'civics', 'pin'].forEach(
    (id) =>
      map.getSource(id) ??
      map.addSource(id, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      }),
  );
  [
    ...civicLayerSpecs(theme),
    ...baseLayerSpecs(theme),
    ...routeLayerSpecs(theme),
    ...vehicleLayerSpecs(theme),
    ...pinLayerSpecs(theme),
  ].forEach((spec) => map.getLayer(spec.id) ?? map.addLayer(spec));
};
