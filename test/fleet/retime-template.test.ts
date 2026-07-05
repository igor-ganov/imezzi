import { describe, expect, test } from 'bun:test';
import { retimeTemplate } from '../../src/lib/fleet/retime-template.ts';
import type { BusDirectionTemplate } from '../../src/lib/fleet/types.ts';

const coords = new Map<string, readonly [number, number]>([
  ['A', [0, 0]],
  ['B', [0, 0.001]],
  ['C', [0, 0.004]],
  ['D', [0, 0.005]],
]);

const template = (offsets: readonly number[]): BusDirectionTemplate => ({
  stops: ['A', 'B', 'C', 'D'],
  offsets: [...offsets],
  lastStopName: 'D',
});

const strictlyIncreasing = (offsets: readonly number[]): boolean =>
  offsets.every((offset, i) => i === 0 || offset > (offsets[i - 1] ?? 0));

describe('retimeTemplate — no infinite-speed segments', () => {
  test('already-monotonic offsets are untouched', () => {
    expect(retimeTemplate(template([0, 60, 120, 180]), coords).offsets).toEqual(
      [0, 60, 120, 180],
    );
  });

  test('a flat run is spread by inter-stop distance', () => {
    // Anchors stay fixed (B at 120, D at 240); the flat C is re-timed
    // between them ∝ distance: B→C=3 of 4 legs → C = 120 + 90 = 210.
    const out = retimeTemplate(template([0, 120, 120, 240]), coords).offsets;
    expect(strictlyIncreasing(out)).toBe(true);
    expect(out).toEqual([0, 120, 210, 240]);
  });

  test('a flat tail gets the fallback pace', () => {
    // Tail B..D re-timed from B(60) to 60 + 30 s × 2 stops = 120,
    // spread by distance (B→C=3, C→D=1): C = 105, D = 120.
    const out = retimeTemplate(template([0, 60, 60, 60]), coords).offsets;
    expect(strictlyIncreasing(out)).toBe(true);
    expect(out[2]).toBeCloseTo(105, 5);
    expect(out[3]).toBeCloseTo(120, 5);
  });

  test('the AMT reality: 26% flat minutes become finite speeds', () => {
    const out = retimeTemplate(template([120, 120, 120, 180]), coords).offsets;
    expect(strictlyIncreasing(out)).toBe(true);
  });
});
