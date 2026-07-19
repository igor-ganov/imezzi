import type {
  CircleLayerSpecification,
  SymbolLayerSpecification,
} from 'maplibre-gl';
import { byModeIcon } from './by-mode-icon.ts';

const TEXT = { light: 'hsl(215 25% 27%)', dark: 'hsl(210 20% 92%)' };
const HALO = { light: '#ffffff', dark: '#10161f' };

/**
 * Non-bus stations (funicular / cremagliera / metro / lift): the same
 * monochrome POI symbols as the bus stops, but each drawn with the
 * sprite icon that names its type. The station name fades in a zoom
 * later so the icons stay clean when the city is in view.
 */
export const specialStopLayerSpecs = (
  theme: 'light' | 'dark',
): readonly (CircleLayerSpecification | SymbolLayerSpecification)[] => {
  const hit: CircleLayerSpecification = {
    id: 'special-stops-hit',
    type: 'circle',
    source: 'special-stops',
    minzoom: 13,
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 13, 12, 17, 20],
      'circle-color': 'transparent',
      'circle-opacity': 0,
    },
  };
  const icon: SymbolLayerSpecification = {
    id: 'special-stops-icon',
    type: 'symbol',
    source: 'special-stops',
    minzoom: 13,
    layout: {
      'icon-image': byModeIcon(),
      'icon-size': ['interpolate', ['linear'], ['zoom'], 13, 0.95, 17, 1.5],
      'icon-allow-overlap': true,
      'text-field': ['get', 'name'],
      'text-font': ['Noto Sans Regular'],
      'text-size': 11,
      'text-offset': [0, 1.2],
      'text-anchor': 'top',
      'text-optional': true,
    },
    paint: {
      'text-color': TEXT[theme],
      'text-halo-color': HALO[theme],
      'text-halo-width': 1.4,
      'text-opacity': ['interpolate', ['linear'], ['zoom'], 13.5, 0, 14.5, 1],
    },
  };
  return [hit, icon];
};
