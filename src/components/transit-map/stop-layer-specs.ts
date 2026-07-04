import type {
  CircleLayerSpecification,
  ExpressionSpecification,
} from 'maplibre-gl';
import { modeColor } from '../../lib/map/mode-color.ts';

const dimmed = (full: number): ExpressionSpecification => [
  'case',
  ['boolean', ['feature-state', 'dimmed'], false],
  0.2,
  full,
];

/** Stop dot + its generously sized invisible hit target (AC-1.2). */
export const stopLayerSpecs = (
  theme: 'light' | 'dark',
): readonly CircleLayerSpecification[] => {
  const hit: CircleLayerSpecification = {
    id: 'stops-hit',
    type: 'circle',
    source: 'stops',
    minzoom: 13,
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 13, 8, 17, 16],
      'circle-color': 'transparent',
      'circle-opacity': 0,
    },
  };
  const dot: CircleLayerSpecification = {
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
  return [hit, dot];
};
