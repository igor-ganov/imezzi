import type {
  CircleLayerSpecification,
  SymbolLayerSpecification,
} from 'maplibre-gl';
import { byModeColor } from './by-mode-color.ts';

const HALO = { light: '#ffffff', dark: '#10161f' };

/**
 * Non-bus stations (funicular / cremagliera / metro / lift): loud
 * mode-coloured dots shown from a lower zoom than the small grey bus
 * chrome — these are landmarks, and the CSV-only bus stops never drew
 * them at all. Names label in once the viewer is close.
 */
export const specialStopLayerSpecs = (
  theme: 'light' | 'dark',
): readonly (CircleLayerSpecification | SymbolLayerSpecification)[] => {
  const hit: CircleLayerSpecification = {
    id: 'special-stops-hit',
    type: 'circle',
    source: 'special-stops',
    minzoom: 10,
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 10, 17, 18],
      'circle-color': 'transparent',
      'circle-opacity': 0,
    },
  };
  const dot: CircleLayerSpecification = {
    id: 'special-stops-dot',
    type: 'circle',
    source: 'special-stops',
    minzoom: 10,
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 4, 17, 8],
      'circle-color': byModeColor(theme),
      'circle-stroke-color': HALO[theme],
      'circle-stroke-width': 2,
    },
  };
  const label: SymbolLayerSpecification = {
    id: 'special-stops-label',
    type: 'symbol',
    source: 'special-stops',
    minzoom: 13,
    layout: {
      'text-field': ['get', 'name'],
      'text-font': ['Noto Sans Regular'],
      'text-size': 11,
      'text-offset': [0, 1.1],
      'text-anchor': 'top',
    },
    paint: {
      'text-color': byModeColor(theme),
      'text-halo-color': HALO[theme],
      'text-halo-width': 1.4,
    },
  };
  return [hit, dot, label];
};
