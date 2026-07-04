import { describe, expect, test } from 'bun:test';
import { toStopsGeojson } from '../../src/lib/map/to-stops-geojson.ts';
import type { Stop } from '../../src/lib/amt/types.ts';

const stop = (overrides: Partial<Stop>): Stop => ({
  id: 'S1',
  name: 'Piazza De Ferrari',
  description: 'central square',
  lat: 44.407,
  lon: 8.934,
  lines: ['1', '35'],
  monitored: true,
  ...overrides,
});

describe('toStopsGeojson', () => {
  test('empty input yields an empty FeatureCollection', () => {
    const result = toStopsGeojson([]);
    expect(result.type).toBe('FeatureCollection');
    expect(result.features).toEqual([]);
  });

  test('each feature is a Point Feature', () => {
    const [feature] = toStopsGeojson([stop({})]).features;
    expect(feature?.type).toBe('Feature');
    expect(feature?.geometry.type).toBe('Point');
  });

  test('coordinates are [lon, lat] in GeoJSON order', () => {
    const [feature] = toStopsGeojson([stop({ lat: 44.5, lon: 8.9 })]).features;
    expect(feature?.geometry.coordinates).toEqual([8.9, 44.5]);
  });

  test('feature ids are array indexes', () => {
    const result = toStopsGeojson([stop({ id: 'A' }), stop({ id: 'B' }), stop({ id: 'C' })]);
    expect(result.features.map((feature) => feature.id)).toEqual([0, 1, 2]);
  });

  test('properties carry id, name and monitored flag', () => {
    const [feature] = toStopsGeojson([
      stop({ id: 'X9', name: 'Brignole', monitored: false }),
    ]).features;
    expect(feature?.properties.id).toBe('X9');
    expect(feature?.properties.name).toBe('Brignole');
    expect(feature?.properties.monitored).toBe(false);
  });

  test('lines are joined with commas', () => {
    const [feature] = toStopsGeojson([stop({ lines: ['1', '35', '480'] })]).features;
    expect(feature?.properties.lines).toBe('1,35,480');
  });

  test('a single line has no separator', () => {
    const [feature] = toStopsGeojson([stop({ lines: ['9'] })]).features;
    expect(feature?.properties.lines).toBe('9');
  });

  test('no lines joins to the empty string', () => {
    const [feature] = toStopsGeojson([stop({ lines: [] })]).features;
    expect(feature?.properties.lines).toBe('');
  });

  test('description is not copied into properties', () => {
    const [feature] = toStopsGeojson([stop({ description: 'secret' })]).features;
    expect(Object.keys(feature?.properties ?? {}).sort()).toEqual(
      ['id', 'lines', 'monitored', 'name'].sort(),
    );
  });

  test('preserves stop order', () => {
    const result = toStopsGeojson([stop({ id: 'first' }), stop({ id: 'second' })]);
    expect(result.features.map((feature) => feature.properties.id)).toEqual([
      'first',
      'second',
    ]);
  });
});
