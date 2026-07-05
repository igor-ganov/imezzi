import type {
  CircleLayerSpecification,
  ExpressionSpecification,
} from 'maplibre-gl';

const dimmed = (full: number): ExpressionSpecification => [
  'case',
  ['boolean', ['feature-state', 'dimmed'], false],
  0.2,
  full,
];

/**
 * Stop dot + its generously sized invisible hit target (AC-1.2).
 * Stops are quiet, neutral background chrome: the moving vehicles
 * are the loud layer — never the other way around.
 */
export const stopLayerSpecs = (
  theme: 'light' | 'dark',
): readonly CircleLayerSpecification[] => {
  const hit: CircleLayerSpecification = {
    id: 'stops-hit',
    type: 'circle',
    source: 'stops',
    minzoom: 13,
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 13, 12, 17, 20],
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
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 13, 2.5, 17, 7],
      'circle-color': { light: '#ffffff', dark: '#0f151d' }[theme],
      'circle-stroke-color': {
        light: 'hsl(196 75% 34%)',
        dark: 'hsl(196 70% 58%)',
      }[theme],
      'circle-stroke-width': [
        'case',
        ['boolean', ['feature-state', 'active'], false],
        3.5,
        2,
      ],
      'circle-opacity': dimmed(1),
      'circle-stroke-opacity': dimmed(1),
    },
  };
  return [hit, dot];
};
