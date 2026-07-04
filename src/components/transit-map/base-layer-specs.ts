import type {
  CircleLayerSpecification,
  LineLayerSpecification,
} from 'maplibre-gl';
import { byModeColor } from './by-mode-color.ts';
import { stopLayerSpecs } from './stop-layer-specs.ts';

/** Route-line and stop layers (live-map design §4). */
export const baseLayerSpecs = (
  theme: 'light' | 'dark',
): readonly (LineLayerSpecification | CircleLayerSpecification)[] => {
  const routeLines: LineLayerSpecification = {
    id: 'route-lines',
    type: 'line',
    source: 'route-lines',
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: {
      'line-color': byModeColor(theme),
      'line-width': 3.5,
      'line-opacity': 0.85,
    },
  };
  return [routeLines, ...stopLayerSpecs(theme)];
};
