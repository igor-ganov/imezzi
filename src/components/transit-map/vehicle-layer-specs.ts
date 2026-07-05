import type {
  CircleLayerSpecification,
  ExpressionSpecification,
  SymbolLayerSpecification,
} from 'maplibre-gl';
import { byModeColor } from './by-mode-color.ts';
import { vehicleArrowSpec } from './vehicle-arrow-spec.ts';
import { vehicleBadgeSpecs } from './vehicle-badge-specs.ts';

const CONTRAST = { light: '#ffffff', dark: '#10161f' };

const unlessDimmed = (full: number): ExpressionSpecification => [
  'case',
  ['get', 'dimmed'],
  full * 0.15,
  full,
];

/** Vehicle marker layers: halo, dot, then badge + label. */
export const vehicleLayerSpecs = (
  theme: 'light' | 'dark',
): readonly (CircleLayerSpecification | SymbolLayerSpecification)[] => {
  const halo: CircleLayerSpecification = {
    id: 'vehicles-halo',
    type: 'circle',
    source: 'vehicles',
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 11, 12, 16, 18],
      'circle-color': byModeColor(theme),
      'circle-opacity': unlessDimmed(0.28),
      'circle-blur': 0.4,
    },
  };
  const dot: CircleLayerSpecification = {
    id: 'vehicles-dot',
    type: 'circle',
    source: 'vehicles',
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 11, 8, 16, 13],
      'circle-color': byModeColor(theme),
      'circle-stroke-color': CONTRAST[theme],
      'circle-stroke-width': 2.5,
      'circle-opacity': unlessDimmed(1),
      'circle-stroke-opacity': unlessDimmed(1),
    },
  };
  const selected: CircleLayerSpecification = {
    id: 'vehicles-selected',
    type: 'circle',
    source: 'vehicles',
    filter: ['==', ['get', 'id'], '___none___'],
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 11, 14, 16, 20],
      'circle-color': 'transparent',
      'circle-stroke-color': { light: 'hsl(35 95% 44%)', dark: 'hsl(38 100% 58%)' }[theme],
      'circle-stroke-width': 3.5,
    },
  };
  return [selected, halo, dot, vehicleArrowSpec(), ...vehicleBadgeSpecs(theme)];
};
