import type { LineLayerSpecification } from 'maplibre-gl';
import { byModeColor } from './by-mode-color.ts';

const CASING = { light: '#ffffff', dark: '#10161f' };

/** Active-itinerary layers: casing + transit lines + dashed walks. */
export const routeLayerSpecs = (
  theme: 'light' | 'dark',
): readonly LineLayerSpecification[] => {
  const casing: LineLayerSpecification = {
    id: 'route-casing',
    type: 'line',
    source: 'route',
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': CASING[theme], 'line-width': 9, 'line-opacity': 0.7 },
  };
  const transit: LineLayerSpecification = {
    id: 'route-transit',
    type: 'line',
    source: 'route',
    filter: ['!=', ['get', 'mode'], 'walk'],
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': byModeColor(theme), 'line-width': 5 },
  };
  const walk: LineLayerSpecification = {
    id: 'route-walk',
    type: 'line',
    source: 'route',
    filter: ['==', ['get', 'mode'], 'walk'],
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: {
      'line-color': byModeColor(theme),
      'line-width': 4,
      'line-dasharray': [0.2, 2],
    },
  };
  return [casing, transit, walk];
};
