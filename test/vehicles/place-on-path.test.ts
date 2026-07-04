import { describe, expect, test } from 'bun:test';
import { placeOnPath } from '../../src/lib/vehicles/place-on-path.ts';

const path: readonly (readonly [number, number])[] = [
  [8.0, 44.0],
  [8.05, 44.05],
  [8.1, 44.1],
  [8.15, 44.15],
  [8.2, 44.2],
];

describe('placeOnPath', () => {
  test('empty path interpolates the straight segment', () => {
    const [lon, lat] = placeOnPath([], [8.0, 44.0], [8.2, 44.2], 0.5);
    expect(lon).toBeCloseTo(8.1, 10);
    expect(lat).toBeCloseTo(44.1, 10);
  });

  test('single-point path also falls back to the straight segment', () => {
    const [lon, lat] = placeOnPath([[50, 50]], [8.0, 44.0], [8.2, 44.2], 0.25);
    expect(lon).toBeCloseTo(8.05, 10);
    expect(lat).toBeCloseTo(44.05, 10);
  });

  test('straight-segment fraction 0 and 1 return the exact endpoints', () => {
    expect(placeOnPath([], [8.0, 44.0], [8.2, 44.2], 0)).toEqual([8.0, 44.0]);
    expect(placeOnPath([], [8.0, 44.0], [8.2, 44.2], 1)).toEqual([8.2, 44.2]);
  });

  test('fraction 0 sits on the path vertex nearest the previous stop', () => {
    expect(placeOnPath(path, [8.01, 44.01], [8.2, 44.2], 0)).toEqual([
      8.0, 44.0,
    ]);
  });

  test('fraction 1 sits on the path vertex nearest the target stop', () => {
    expect(placeOnPath(path, [8.0, 44.0], [8.19, 44.19], 1)).toEqual([
      8.2, 44.2,
    ]);
  });

  test('fraction 0.5 lands on the mid-path vertex', () => {
    expect(placeOnPath(path, [8.0, 44.0], [8.2, 44.2], 0.5)).toEqual([
      8.1, 44.1,
    ]);
  });

  test('snaps off-path stops onto path vertices', () => {
    expect(placeOnPath(path, [8.06, 44.04], [8.16, 44.16], 0.5)).toEqual([
      8.1, 44.1,
    ]);
  });

  test('works when the path runs opposite to travel direction', () => {
    expect(placeOnPath(path, [8.2, 44.2], [8.0, 44.0], 0.25)).toEqual([
      8.15, 44.15,
    ]);
  });
});
