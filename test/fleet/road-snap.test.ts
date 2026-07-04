import { describe, expect, test } from 'bun:test';
import { matchPath } from '../../src/lib/fleet/match-path.ts';
import { placeAtMoment } from '../../src/lib/fleet/place-at-moment.ts';
import { roadOf } from '../../src/lib/fleet/road-of.ts';
import { bearingAt } from '../../src/lib/geo/bearing-at.ts';
import { projectStops } from '../../src/lib/geo/project-stops.ts';

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

// Outbound leg going north, then the route doubles back south along
// a parallel street 30 m east — the classic wrong-pass trap.
const doubleBack: readonly (readonly [number, number])[] = [
  [8.9, 44.0],
  [8.9, 44.1],
  [8.9, 44.2],
  [8.9003, 44.2],
  [8.9003, 44.1],
  [8.9003, 44.0],
];

describe('projectStops — the wrong-pass regression', () => {
  test('projections are monotonic even when the return pass is nearer', () => {
    // Stop B sits marginally nearer the RETURN pass point (index 4)
    // than the outbound one? Equal here — monotonic search must pick
    // the outbound pass (index 1), never jump to 4.
    const indices = projectStops(doubleBack, [
      [8.9, 44.0],
      [8.9001, 44.1],
      [8.9, 44.2],
    ]);
    expect(indices).toEqual([0, 1, 2]);
  });

  test('each projection never precedes the previous one', () => {
    const indices = projectStops(doubleBack, [
      [8.9003, 44.0],
      [8.9, 44.05],
      [8.9003, 44.05],
    ]);
    const sorted = [...indices].sort((a, b) => a - b);
    expect(indices).toEqual(sorted);
  });

  test('missing stop coordinates inherit the previous index', () => {
    expect(projectStops(doubleBack, [[8.9, 44.1], undefined])).toEqual([1, 1]);
  });
});

describe('bearingAt — arrow stability', () => {
  const withDuplicates: readonly (readonly [number, number])[] = [
    [8.9, 44.0],
    [8.9, 44.1],
    [8.9, 44.1],
    [8.91, 44.1],
  ];

  test('duplicate vertices do not spin the arrow north', () => {
    // At index 1 the next distinct vertex is [8.91, 44.1] → east.
    expect(bearingAt(withDuplicates, 1)).toBeCloseTo(90, 0);
  });

  test('at the path end the last real segment bearing is kept', () => {
    expect(bearingAt(withDuplicates, 3)).toBeCloseTo(90, 0);
  });

  test('bearing always follows increasing indices (travel order)', () => {
    // Northbound outbound pass of the double-back: must be 0°, and
    // NEVER 180° even though the return pass runs south nearby.
    expect(bearingAt(doubleBack, 0)).toBeCloseTo(0, 0);
    expect(bearingAt(doubleBack, 1)).toBeCloseTo(0, 0);
    // On the return pass, travel order points south.
    expect(bearingAt(doubleBack, 4)).toBeCloseTo(180, 0);
  });
});

describe('matchPath — orientation by both endpoints', () => {
  test('a loop with близкими ends is oriented by the first stop too', () => {
    // Loop: starts at A, ends 20 m from A. Terminus-only scoring
    // cannot tell the orientations apart; the first stop can.
    const loop: readonly (readonly [number, number])[] = [
      [8.9, 44.0],
      [8.9, 44.1],
      [8.91, 44.1],
      [8.9002, 44.0],
    ];
    const loopTemplate = {
      stops: ['A', 'B'],
      offsets: [0, 120],
      lastStopName: 'LOOP END',
    };
    const loopCoords = new Map<string, readonly [number, number]>([
      ['A', [8.9, 44.0]],
      ['B', [8.9, 44.1]],
    ]);
    const oriented = matchPath([loop], loopTemplate, loopCoords);
    expect(oriented?.[0]).toEqual([8.9, 44.0]);
    expect(oriented?.[1]).toEqual([8.9, 44.1]);
  });

  test('a reversed candidate is flipped back', () => {
    const reversed = [...doubleBack].reverse();
    const oriented = matchPath([reversed], template, coords);
    expect(oriented?.[0]).toEqual([8.9003, 44.0]);
  });
});

describe('placeAtMoment', () => {
  const road = roadOf(template, [doubleBack], coords);

  test('walks the outbound pass between B and C', () => {
    const placed = placeAtMoment(template, coords, 210, road);
    expect(placed?.point[0]).toBeCloseTo(8.9, 4);
    expect(placed?.point[1]).toBeGreaterThan(44.1);
    expect(placed?.point[1]).toBeLessThanOrEqual(44.2);
  });

  test('bearing on the outbound pass is northbound, never flipped', () => {
    const placed = placeAtMoment(template, coords, 210, road);
    expect(placed?.bearing).toBeCloseTo(0, 0);
  });

  test('moment beyond the last offset clamps to the terminus', () => {
    const placed = placeAtMoment(template, coords, 9999, road);
    expect(placed?.point[1]).toBeCloseTo(44.2, 4);
  });

  test('falls back to the straight chord without a road', () => {
    const placed = placeAtMoment(template, coords, 210);
    expect(placed?.point[1]).toBeCloseTo(44.15, 5);
  });
});
