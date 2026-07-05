import type {
  CircleLayerSpecification,
  ExpressionSpecification,
  SymbolLayerSpecification,
} from 'maplibre-gl';
import { stopActiveSpec } from './stop-active-spec.ts';

const dimmed = (full: number): ExpressionSpecification => [
  'case',
  ['boolean', ['feature-state', 'dimmed'], false],
  0.2,
  full,
];

/**
 * Stops as in the reference map: the Maki bus symbol from the POI
 * sprite (white-recoloured on dark) instead of abstract circles —
 * with the invisible padded hit target for taps (AC-1.2) and an
 * accent ring on the active (opened) stop.
 */
export const stopLayerSpecs = (
  theme: 'light' | 'dark',
): readonly (CircleLayerSpecification | SymbolLayerSpecification)[] => {
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
  const icons: SymbolLayerSpecification = {
    id: 'stops-icon',
    type: 'symbol',
    source: 'stops',
    minzoom: 13,
    layout: {
      'icon-image': 'bus_11',
      'icon-size': ['interpolate', ['linear'], ['zoom'], 13, 0.9, 17, 1.4],
    },
    paint: {
      'icon-opacity': dimmed(1),
    },
  };
  return [hit, stopActiveSpec(theme), icons];
};
