import { describe, expect, test } from 'bun:test';
import { toRouteLinesGeojson } from '../../src/lib/map/to-route-lines-geojson.ts';
import type { RoutePath } from '../../src/lib/map/to-route-lines-geojson.ts';

const path = (overrides: Partial<RoutePath>): RoutePath => ({
  key: '1-andata',
  mode: 'bus',
  path: [
    [8.93, 44.4],
    [8.94, 44.41],
  ],
  ...overrides,
});

describe('toRouteLinesGeojson', () => {
  test('empty input yields an empty FeatureCollection', () => {
    const result = toRouteLinesGeojson([]);
    expect(result.type).toBe('FeatureCollection');
    expect(result.features).toEqual([]);
  });

  test('each feature is a LineString Feature', () => {
    const [feature] = toRouteLinesGeojson([path({})]).features;
    expect(feature?.type).toBe('Feature');
    expect(feature?.geometry.type).toBe('LineString');
  });

  test('coordinates carry the path verbatim', () => {
    const coordinates: readonly (readonly [number, number])[] = [
      [8.9, 44.4],
      [8.91, 44.42],
      [8.92, 44.43],
    ];
    const [feature] = toRouteLinesGeojson([path({ path: coordinates })]).features;
    expect(feature?.geometry.coordinates).toBe(coordinates);
  });

  test('properties carry key and mode', () => {
    const [feature] = toRouteLinesGeojson([path({ key: 'M-ritorno', mode: 'metro' })]).features;
    expect(feature?.properties).toEqual({ key: 'M-ritorno', mode: 'metro' });
  });

  test('features have no numeric id', () => {
    const [feature] = toRouteLinesGeojson([path({})]).features;
    expect(feature?.id).toBeUndefined();
  });

  test('preserves path order and count', () => {
    const result = toRouteLinesGeojson([
      path({ key: 'a' }),
      path({ key: 'b' }),
      path({ key: 'c' }),
    ]);
    expect(result.features.map((feature) => feature.properties.key)).toEqual(['a', 'b', 'c']);
  });

  test('an empty path yields an empty coordinates list', () => {
    const [feature] = toRouteLinesGeojson([path({ path: [] })]).features;
    expect(feature?.geometry.coordinates).toEqual([]);
  });
});
