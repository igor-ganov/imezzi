import type { CircleLayerSpecification } from 'maplibre-gl';

/** The classic blue "you are here" dot with a soft accuracy halo. */
export const meLayerSpecs = (): readonly CircleLayerSpecification[] => {
  const halo: CircleLayerSpecification = {
    id: 'me-halo',
    type: 'circle',
    source: 'me',
    paint: {
      'circle-radius': 18,
      'circle-color': 'hsl(211 100% 50%)',
      'circle-opacity': 0.18,
    },
  };
  const dot: CircleLayerSpecification = {
    id: 'me-dot',
    type: 'circle',
    source: 'me',
    paint: {
      'circle-radius': 8,
      'circle-color': 'hsl(211 100% 50%)',
      'circle-stroke-color': '#ffffff',
      'circle-stroke-width': 3,
    },
  };
  return [halo, dot];
};
