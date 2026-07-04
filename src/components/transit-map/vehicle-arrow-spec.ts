import type {
  ExpressionSpecification,
  SymbolLayerSpecification,
} from 'maplibre-gl';

const unlessDimmed = (full: number): ExpressionSpecification => [
  'case',
  ['get', 'dimmed'],
  full * 0.15,
  full,
];

/** Direction arrow gliding ahead of the vehicle dot (US-1). */
export const vehicleArrowSpec = (): SymbolLayerSpecification => ({
  id: 'vehicles-arrow',
  type: 'symbol',
  source: 'vehicles',
  filter: ['>=', ['get', 'bearing'], 0],
  layout: {
    'icon-image': 'vehicle-arrow',
    'icon-size': ['interpolate', ['linear'], ['zoom'], 11, 0.5, 16, 0.75],
    'icon-rotate': ['get', 'bearing'],
    'icon-rotation-alignment': 'map',
    'icon-allow-overlap': true,
    'icon-offset': [0, -24],
  },
  paint: { 'icon-opacity': unlessDimmed(1) },
});
