import type {
  CircleLayerSpecification,
  ExpressionSpecification,
  SymbolLayerSpecification,
} from 'maplibre-gl';

const CONTRAST = { light: '#ffffff', dark: '#10161f' };
const WARN = { light: 'hsl(35 95% 44%)', dark: 'hsl(38 100% 58%)' };

const unlessDimmed = (full: number): ExpressionSpecification => [
  'case',
  ['get', 'dimmed'],
  full * 0.15,
  full,
];

/** ⚠ approximation badge + line-number label layers. */
export const vehicleBadgeSpecs = (
  theme: 'light' | 'dark',
): readonly (CircleLayerSpecification | SymbolLayerSpecification)[] => {
  const warn: CircleLayerSpecification = {
    id: 'vehicles-warn',
    type: 'circle',
    source: 'vehicles',
    filter: ['==', ['get', 'approximated'], true],
    paint: {
      'circle-radius': 4.5,
      'circle-color': WARN[theme],
      'circle-stroke-color': CONTRAST[theme],
      'circle-stroke-width': 1.5,
      'circle-translate': [9, -9],
      'circle-opacity': unlessDimmed(1),
      'circle-stroke-opacity': unlessDimmed(1),
    },
  };
  const label: SymbolLayerSpecification = {
    id: 'vehicles-label',
    type: 'symbol',
    source: 'vehicles',
    layout: {
      'text-field': ['get', 'label'],
      'text-font': ['Noto Sans Bold'],
      'text-size': ['interpolate', ['linear'], ['zoom'], 11, 10, 16, 13],
      // Overlapping vehicles must not blend their numbers: labels
      // participate in collision (ignore-placement would keep them
      // OUT of the index — they would not see each other). The
      // number stays CENTERED in its own dot — variable anchors made
      // labels drift outside their circles next to foreign dots —
      // and in a pile-up the loser's text hides while its dot stays.
      'text-allow-overlap': false,
      'text-ignore-placement': false,
      'text-optional': true,
    },
    paint: {
      'text-color': CONTRAST[theme],
      'text-opacity': unlessDimmed(1),
    },
  };
  return [warn, label];
};
