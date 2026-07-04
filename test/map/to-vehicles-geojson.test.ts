import { describe, expect, test } from 'bun:test';
import { toVehiclesGeojson } from '../../src/lib/map/to-vehicles-geojson.ts';
import type { VehicleView } from '../../src/lib/vehicles/types.ts';

const vehicle = (overrides: Partial<VehicleView>): VehicleView => ({
  id: 'bus-42',
  label: '42',
  mode: 'bus',
  lineKey: '42-andata',
  lat: 44.41,
  lon: 8.93,
  approximated: false,
  ...overrides,
});

describe('toVehiclesGeojson', () => {
  test('empty input yields an empty FeatureCollection', () => {
    const result = toVehiclesGeojson([]);
    expect(result.type).toBe('FeatureCollection');
    expect(result.features).toEqual([]);
  });

  test('each feature is a Point Feature', () => {
    const [feature] = toVehiclesGeojson([vehicle({})]).features;
    expect(feature?.type).toBe('Feature');
    expect(feature?.geometry.type).toBe('Point');
  });

  test('coordinates are [lon, lat] in GeoJSON order', () => {
    const [feature] = toVehiclesGeojson([vehicle({ lat: 44.5, lon: 8.88 })]).features;
    expect(feature?.geometry.coordinates).toEqual([8.88, 44.5]);
  });

  test('properties carry id, label, mode and lineKey', () => {
    const [feature] = toVehiclesGeojson([
      vehicle({ id: 'metro-1', label: 'M', mode: 'metro', lineKey: 'M-andata' }),
    ]).features;
    expect(feature?.properties.id).toBe('metro-1');
    expect(feature?.properties.label).toBe('M');
    expect(feature?.properties.mode).toBe('metro');
    expect(feature?.properties.lineKey).toBe('M-andata');
  });

  test('approximated flag passes through', () => {
    const result = toVehiclesGeojson([
      vehicle({ id: 'a', approximated: true }),
      vehicle({ id: 'b', approximated: false }),
    ]);
    expect(result.features.map((feature) => feature.properties.approximated)).toEqual([
      true,
      false,
    ]);
  });

  test('dimmed defaults to false when omitted', () => {
    const [feature] = toVehiclesGeojson([vehicle({})]).features;
    expect(feature?.properties.dimmed).toBe(false);
  });

  test('explicit dimmed values are preserved', () => {
    const result = toVehiclesGeojson([
      vehicle({ id: 'a', dimmed: true }),
      vehicle({ id: 'b', dimmed: false }),
    ]);
    expect(result.features.map((feature) => feature.properties.dimmed)).toEqual([true, false]);
  });

  test('preserves vehicle order', () => {
    const result = toVehiclesGeojson([vehicle({ id: 'one' }), vehicle({ id: 'two' })]);
    expect(result.features.map((feature) => feature.properties.id)).toEqual(['one', 'two']);
  });
});
