import type {
  CircleLayerSpecification,
  ExpressionSpecification,
  SymbolLayerSpecification,
} from 'maplibre-gl';

const COLORS = {
  light: { red: '#d1483f', black: '#33404f', halo: '#ffffff' },
  dark: { red: '#e0685f', black: '#c6ccd6', halo: '#12151c' },
};

const byColore = (theme: 'light' | 'dark'): ExpressionSpecification => [
  'case',
  ['==', ['get', 'COLORE'], 'R'],
  COLORS[theme].red,
  COLORS[theme].black,
];

/**
 * Civic numbers styled as in the reference map: commercial (red)
 * civics get the shop icon, residential the marker, with the number
 * beneath — plus an invisible padded hit layer so the tap-to-card
 * interaction stays comfortable on touch.
 */
export const civicLayerSpecs = (
  theme: 'light' | 'dark',
): readonly (CircleLayerSpecification | SymbolLayerSpecification)[] => {
  const hit: CircleLayerSpecification = {
    id: 'civics-hit',
    type: 'circle',
    source: 'civics',
    minzoom: 16.5,
    paint: { 'circle-radius': 12, 'circle-opacity': 0 },
  };
  const icons: SymbolLayerSpecification = {
    id: 'civics',
    type: 'symbol',
    source: 'civics',
    minzoom: 16.5,
    layout: {
      'icon-image': [
        'case',
        ['==', ['get', 'COLORE'], 'R'],
        'shop_11',
        'marker_11',
      ],
      'icon-size': 0.9,
      'icon-optional': true,
      'text-field': ['get', 'TESTO'],
      'text-font': ['Noto Sans Bold'],
      'text-size': 10,
      'text-offset': [0, 0.9],
      'text-anchor': 'top',
      'text-optional': true,
    },
    paint: {
      'text-color': byColore(theme),
      'text-halo-color': COLORS[theme].halo,
      'text-halo-width': 1.1,
    },
  };
  return [hit, icons];
};
