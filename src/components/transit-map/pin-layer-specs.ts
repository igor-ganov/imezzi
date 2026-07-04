import type {
  CircleLayerSpecification,
  SymbolLayerSpecification,
} from 'maplibre-gl';

const ACCENT = { light: 'hsl(35 95% 44%)', dark: 'hsl(38 100% 58%)' };
const HALO = { light: '#ffffff', dark: '#10161f' };

/** Search-pin marker layers (civic-addresses AC-2.2). */
export const pinLayerSpecs = (
  theme: 'light' | 'dark',
): readonly (CircleLayerSpecification | SymbolLayerSpecification)[] => {
  const ring: CircleLayerSpecification = {
    id: 'pin-ring',
    type: 'circle',
    source: 'pin',
    paint: {
      'circle-radius': 11,
      'circle-color': 'transparent',
      'circle-stroke-color': ACCENT[theme],
      'circle-stroke-width': 3,
    },
  };
  const label: SymbolLayerSpecification = {
    id: 'pin-label',
    type: 'symbol',
    source: 'pin',
    layout: {
      'text-field': ['get', 'label'],
      'text-font': ['Noto Sans Bold'],
      'text-size': 12,
      'text-offset': [0, 1.4],
      'text-anchor': 'top',
    },
    paint: {
      'text-color': ACCENT[theme],
      'text-halo-color': HALO[theme],
      'text-halo-width': 1.4,
    },
  };
  return [ring, label];
};
