import type {
  CircleLayerSpecification,
  ExpressionSpecification,
  LineLayerSpecification,
} from 'maplibre-gl';
import { modeColor } from '../../lib/map/mode-color.ts';
import { byModeColor } from './by-mode-color.ts';

const dimmed = (full: number): ExpressionSpecification => [
  'case',
  ['boolean', ['feature-state', 'dimmed'], false],
  0.2,
  full,
];

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
  const stops: CircleLayerSpecification = {
    id: 'stops-circle',
    type: 'circle',
    source: 'stops',
    minzoom: 13,
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 13, 1.5, 17, 6],
      'circle-color': { light: '#ffffff', dark: '#1c2733' }[theme],
      'circle-stroke-color': modeColor('bus', theme),
      'circle-stroke-width': [
        'case',
        ['boolean', ['feature-state', 'active'], false],
        3,
        1.5,
      ],
      'circle-opacity': dimmed(1),
      'circle-stroke-opacity': dimmed(1),
    },
  };
  return [routeLines, stops];
};
