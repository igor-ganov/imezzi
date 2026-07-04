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
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 13, 1, 17, 4.5],
      'circle-color': { light: '#ffffff', dark: '#1c2733' }[theme],
      'circle-stroke-color': {
        light: 'hsl(215 15% 62%)',
        dark: 'hsl(215 15% 42%)',
      }[theme],
      'circle-stroke-width': [
        'case',
        ['boolean', ['feature-state', 'active'], false],
        3,
        1.2,
      ],
      'circle-opacity': dimmed(0.85),
      'circle-stroke-opacity': dimmed(0.85),
    },
  };
  return [hit, dot];
};
