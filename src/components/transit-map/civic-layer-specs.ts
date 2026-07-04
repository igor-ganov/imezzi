import type {
  CircleLayerSpecification,
  ExpressionSpecification,
  SymbolLayerSpecification,
} from 'maplibre-gl';

const COLORS = {
  light: { red: 'hsl(356 78% 42%)', black: 'hsl(215 45% 14%)', halo: '#ffffff' },
  dark: { red: 'hsl(356 90% 66%)', black: 'hsl(45 35% 88%)', halo: '#10161f' },
};

const byColore = (theme: 'light' | 'dark'): ExpressionSpecification => [
  'case',
  ['==', ['get', 'COLORE'], 'R'],
  COLORS[theme].red,
  COLORS[theme].black,
];

/** Red/black civic number layers, street-level zooms only (US-1). */
export const civicLayerSpecs = (
  theme: 'light' | 'dark',
): readonly (CircleLayerSpecification | SymbolLayerSpecification)[] => {
  const dots: CircleLayerSpecification = {
    id: 'civics-circle',
    type: 'circle',
    source: 'civics',
    minzoom: 16.5,
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 16.5, 2.5, 19, 5],
      'circle-color': byColore(theme),
      'circle-stroke-color': COLORS[theme].halo,
      'circle-stroke-width': 1,
    },
  };
  const labels: SymbolLayerSpecification = {
    id: 'civics-label',
    type: 'symbol',
    source: 'civics',
    minzoom: 17.4,
    layout: {
      'text-field': ['get', 'TESTO'],
      'text-font': ['Noto Sans Bold'],
      'text-size': 11,
      'text-offset': [0, 0.9],
      'text-anchor': 'top',
    },
    paint: {
      'text-color': byColore(theme),
      'text-halo-color': COLORS[theme].halo,
      'text-halo-width': 1.2,
    },
  };
  return [dots, labels];
};
