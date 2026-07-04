import { describe, expect, test } from 'bun:test';
import { matchPath } from '../../src/lib/fleet/match-path.ts';
import { pointAlongPath } from '../../src/lib/fleet/point-along-path.ts';
import { positionOnDirection } from '../../src/lib/fleet/position-on-direction.ts';
import { nearestPathIndex } from '../../src/lib/geo/nearest-path-index.ts';

const template = {
  stops: ['A', 'B', 'C'],
  offsets: [0, 120, 300],
  lastStopName: 'NORD',
};
const coords = new Map<string, readonly [number, number]>([
  ['A', [8.9, 44.0]],
  ['B', [8.9, 44.1]],
  ['C', [8.9, 44.2]],
]);

// A road that detours east between B and C — straight-line
// interpolation would fly over the block, the path must not.
const road: readonly (readonly [number, number])[] = [
  [8.9, 44.0],
  [8.9, 44.05],
  [8.9, 44.1],
  [8.95, 44.12],
  [8.95, 44.17],
  [8.9, 44.2],
];

describe('nearestPathIndex', () => {
  test('projects a coordinate onto its closest path point', () => {
    expect(nearestPathIndex(road, [8.9, 44.1])).toBe(2);
    expect(nearestPathIndex(road, [8.94, 44.16])).toBe(4);
    expect(nearestPathIndex([], [8.9, 44.1])).toBe(0);
  });
});

describe('matchPath', () => {
  test('picks the candidate ending nearest the terminus', () => {
    const reversed = [...road].reverse();
    expect(matchPath([reversed], template, coords)?.[0]).toEqual([8.9, 44.0]);
    expect(matchPath([road], template, coords)).toBe(road);
  });

  test('no usable candidates yields undefined', () => {
    expect(matchPath([], template, coords)).toBeUndefined();
    expect(matchPath([[[8.9, 44]]], template, coords)).toBeUndefined();
  });
});

describe('pointAlongPath', () => {
  test('midway between B and C sits on the detour, not the chord', () => {
    const placed = pointAlongPath(road, [8.9, 44.1], [8.9, 44.2], 0.5);
    expect(placed.point[0]).toBeCloseTo(8.95, 5);
    expect(placed.point).not.toEqual([8.9, 44.15]);
  });

  test('bearing follows the local road segment', () => {
    const start = pointAlongPath(road, [8.9, 44.1], [8.9, 44.2], 0);
    // at B the road heads north-east toward the detour
    expect(start.bearing).toBeGreaterThan(0);
    expect(start.bearing).toBeLessThan(90);
  });

  test('fraction 1 lands on the target stop projection', () => {
    const placed = pointAlongPath(road, [8.9, 44.1], [8.9, 44.2], 1);
    expect(placed.point).toEqual([8.9, 44.2]);
  });
});

describe('positionOnDirection with a road', () => {
  test('snaps to the polyline when one is provided', () => {
    const placed = positionOnDirection(template, coords, 'C', 90, road);
    // moment 210 of 300 → between B (120) and C (300), on the detour
    expect(placed?.point[0]).toBeCloseTo(8.95, 5);
  });

  test('falls back to the straight segment without a path', () => {
    const placed = positionOnDirection(template, coords, 'C', 90);
    expect(placed?.point[0]).toBeCloseTo(8.9, 5);
  });
});
