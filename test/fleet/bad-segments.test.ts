import { describe, expect, test } from 'bun:test';
import { badSegments } from '../../src/lib/fleet/bad-segments.ts';
import { placeAtMoment } from '../../src/lib/fleet/place-at-moment.ts';

// A straight west→east path with a long detour between vertices 2..30.
const detour: (readonly [number, number])[] = [
  [0, 0],
  [0.001, 0],
  ...Array.from({ length: 28 }, (_, i): readonly [number, number] => [
    0.001 + 0.0005 * (i + 1),
    0.02,
  ]),
  [0.002, 0],
  [0.003, 0],
];

describe('badSegments — slipped projections fall back to the chord', () => {
  test('a wildly stretched segment is flagged', () => {
    const stops: (readonly [number, number])[] = [
      [0, 0],
      [0.002, 0],
      [0.003, 0],
    ];
    const bad = badSegments(detour, [0, 30, 31], stops);
    expect(bad).toEqual([true, false]);
  });

  test('an honest road stays unflagged', () => {
    const path: (readonly [number, number])[] = [
      [0, 0],
      [0.001, 0],
      [0.002, 0],
    ];
    expect(badSegments(path, [0, 1, 2], [[0, 0], [0.001, 0], [0.002, 0]])).toEqual([
      false,
      false,
    ]);
  });

  test('placeAtMoment uses the chord on a flagged segment', () => {
    const template = {
      stops: ['A', 'B', 'C'],
      offsets: [0, 100, 200],
      lastStopName: 'C',
    };
    const coords = new Map<string, readonly [number, number]>([
      ['A', [0, 0]],
      ['B', [0.002, 0]],
      ['C', [0.003, 0]],
    ]);
    const road = { path: detour, indices: [0, 30, 31], bad: [true, false] };
    // Halfway A→B: the detour would sit at ~0.02 lat (2.2 km off);
    // the chord keeps the marker on the street.
    const placed = placeAtMoment(template, coords, 50, road);
    expect(placed?.point[1] ?? 1).toBeCloseTo(0, 5);
    expect(placed?.point[0] ?? 0).toBeCloseTo(0.001, 5);
  });
});
