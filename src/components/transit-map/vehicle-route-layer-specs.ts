import type { LineLayerSpecification } from 'maplibre-gl';

const ACCENT = { light: 'hsl(35 95% 44%)', dark: 'hsl(38 100% 58%)' };
const CASING = { light: '#ffffff', dark: '#10161f' };

/**
 * The tapped vehicle's own line of travel (US: маршрут следования) —
 * a cased accent polyline distinct from the muted selected-line
 * routes, drawn under the fleet dots so the vehicle stays on top.
 */
export const vehicleRouteLayerSpecs = (
  theme: 'light' | 'dark',
): readonly LineLayerSpecification[] => {
  const casing: LineLayerSpecification = {
    id: 'vehicle-route-casing',
    type: 'line',
    source: 'vehicle-route',
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': CASING[theme], 'line-width': 8, 'line-opacity': 0.6 },
  };
  const line: LineLayerSpecification = {
    id: 'vehicle-route-line',
    type: 'line',
    source: 'vehicle-route',
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: {
      'line-color': ACCENT[theme],
      'line-width': 4.5,
      'line-opacity': 0.95,
    },
  };
  return [casing, line];
};
