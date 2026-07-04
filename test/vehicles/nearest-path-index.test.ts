import { describe, expect, test } from 'bun:test';
import { nearestPathIndex } from '../../src/lib/vehicles/nearest-path-index.ts';

const path: readonly (readonly [number, number])[] = [
  [8.0, 44.0],
  [8.1, 44.1],
  [8.2, 44.2],
  [8.3, 44.3],
];

describe('nearestPathIndex', () => {
  test('empty path falls back to index 0', () => {
    expect(nearestPathIndex([], [8.0, 44.0])).toBe(0);
  });

  test('single-point path always yields index 0', () => {
    expect(nearestPathIndex([[8.0, 44.0]], [99, 99])).toBe(0);
  });

  test('exact coordinate match returns that index', () => {
    expect(nearestPathIndex(path, [8.2, 44.2])).toBe(2);
  });

  test('exact match on the first point', () => {
    expect(nearestPathIndex(path, [8.0, 44.0])).toBe(0);
  });

  test('exact match on the last point', () => {
    expect(nearestPathIndex(path, [8.3, 44.3])).toBe(3);
  });

  test('nearby point snaps to the closest vertex', () => {
    expect(nearestPathIndex(path, [8.12, 44.09])).toBe(1);
  });

  test('equidistant vertices resolve to the first one', () => {
    const straight: readonly (readonly [number, number])[] = [
      [0, 0],
      [2, 0],
    ];
    expect(nearestPathIndex(straight, [1, 0])).toBe(0);
  });

  test('duplicate vertices resolve to the first occurrence', () => {
    const looped: readonly (readonly [number, number])[] = [
      [0, 0],
      [5, 5],
      [0, 0],
    ];
    expect(nearestPathIndex(looped, [0.1, 0])).toBe(0);
  });
});
