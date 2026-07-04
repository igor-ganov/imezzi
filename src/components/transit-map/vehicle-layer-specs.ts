import type {
  CircleLayerSpecification,
  SymbolLayerSpecification,
} from 'maplibre-gl';
import { byModeColor } from './by-mode-color.ts';
import { vehicleBadgeSpecs } from './vehicle-badge-specs.ts';

const CONTRAST = { light: '#ffffff', dark: '#10161f' };

/** Vehicle marker layers: halo, dot, then badge + label. */
export const vehicleLayerSpecs = (
  theme: 'light' | 'dark',
): readonly (CircleLayerSpecification | SymbolLayerSpecification)[] => {
  const halo: CircleLayerSpecification = {
    id: 'vehicles-halo',
    type: 'circle',
    source: 'vehicles',
    paint: {
      'circle-radius': 13,
      'circle-color': byModeColor(theme),
      'circle-opacity': 0.22,
      'circle-blur': 0.4,
    },
  };
  const dot: CircleLayerSpecification = {
    id: 'vehicles-dot',
    type: 'circle',
    source: 'vehicles',
    paint: {
      'circle-radius': 9,
      'circle-color': byModeColor(theme),
      'circle-stroke-color': CONTRAST[theme],
      'circle-stroke-width': 2,
    },
  };
  return [halo, dot, ...vehicleBadgeSpecs(theme)];
};
