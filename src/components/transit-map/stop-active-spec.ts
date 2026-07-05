import type { CircleLayerSpecification } from 'maplibre-gl';

/** Accent ring around the active (opened) stop, feature-state driven. */
export const stopActiveSpec = (
  theme: 'light' | 'dark',
): CircleLayerSpecification => ({
  id: 'stops-active',
  type: 'circle',
  source: 'stops',
  minzoom: 13,
  paint: {
    'circle-radius': ['interpolate', ['linear'], ['zoom'], 13, 9, 17, 14],
    'circle-color': 'transparent',
    'circle-stroke-color': {
      light: 'hsl(35 95% 44%)',
      dark: 'hsl(38 100% 58%)',
    }[theme],
    'circle-stroke-width': [
      'case',
      ['boolean', ['feature-state', 'active'], false],
      3,
      0,
    ],
  },
});
