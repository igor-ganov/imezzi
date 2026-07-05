import type { CircleLayerSpecification } from 'maplibre-gl';

/** Invisible tap target + selection ring for the fleet icons. */
export const vehicleHaloSpecs = (
  theme: 'light' | 'dark',
): readonly CircleLayerSpecification[] => {
  const hit: CircleLayerSpecification = {
    id: 'vehicles-hit',
    type: 'circle',
    source: 'vehicles',
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 11, 12, 16, 18],
      'circle-color': 'transparent',
      'circle-opacity': 0,
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
      'circle-stroke-color': {
        light: 'hsl(35 95% 44%)',
        dark: 'hsl(38 100% 58%)',
      }[theme],
      'circle-stroke-width': 3.5,
    },
  };
  return [hit, selected];
};
