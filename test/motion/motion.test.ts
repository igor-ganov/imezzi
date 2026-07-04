import { describe, expect, test } from 'bun:test';
import { smoothStep, type MotionPoint } from '../../src/lib/motion/smooth-step.ts';
import { staleFactor } from '../../src/lib/motion/stale-factor.ts';
import type { VehicleView } from '../../src/lib/vehicles/types.ts';

const target = (over: Partial<VehicleView>): VehicleView => ({
  id: 'bus:09001',
  label: '1',
  mode: 'bus',
  lineKey: '1',
  lon: 8.94,
  lat: 44.41,
  approximated: false,
  ageSeconds: 0,
  ...over,
});

const at = (lon: number, lat: number): ReadonlyMap<string, MotionPoint> =>
  new Map([['bus:09001', { lon, lat }]]);

describe('staleFactor', () => {
  test('fresh data animates fully', () => {
    expect(staleFactor(0)).toBe(1);
    expect(staleFactor(45)).toBe(1);
  });

  test('aging data decelerates linearly', () => {
    expect(staleFactor(82.5)).toBeCloseTo(0.5);
  });

  test('stale data freezes entirely', () => {
    expect(staleFactor(120)).toBe(0);
    expect(staleFactor(999)).toBe(0);
  });
});

describe('smoothStep', () => {
  test('new ids appear directly at their target', () => {
    const next = smoothStep(new Map(), [target({})], 0.016);
    expect(next.get('bus:09001')).toEqual({ lon: 8.94, lat: 44.41 });
  });

  test('ids missing from the targets are dropped', () => {
    const next = smoothStep(at(8.94, 44.41), [], 0.016);
    expect(next.size).toBe(0);
  });

  test('glides toward the target without overshooting', () => {
    const start = at(8.94, 44.41);
    const goal = target({ lat: 44.412 });
    const one = smoothStep(start, [goal], 0.5);
    const lat1 = one.get('bus:09001')?.lat ?? 0;
    expect(lat1).toBeGreaterThan(44.41);
    expect(lat1).toBeLessThan(44.412);
    const two = smoothStep(one, [goal], 0.5);
    const lat2 = two.get('bus:09001')?.lat ?? 0;
    expect(lat2).toBeGreaterThan(lat1);
    expect(lat2).toBeLessThan(44.412);
  });

  test('repeated frames converge on the target (steady motion)', () => {
    const goal = target({ lat: 44.412 });
    const final = Array.from({ length: 40 }).reduce<
      ReadonlyMap<string, MotionPoint>
    >((state) => smoothStep(state, [goal], 0.25), at(8.94, 44.41));
    expect(final.get('bus:09001')?.lat).toBeCloseTo(44.412, 4);
  });

  test('stale targets freeze the displayed point', () => {
    const goal = target({ lat: 44.412, ageSeconds: 300 });
    const next = smoothStep(at(8.94, 44.41), [goal], 0.5);
    expect(next.get('bus:09001')?.lat).toBeCloseTo(44.41, 10);
  });

  test('aging targets move slower than fresh ones', () => {
    const fresh = smoothStep(at(8.94, 44.41), [target({ lat: 44.412 })], 0.25);
    const aging = smoothStep(
      at(8.94, 44.41),
      [target({ lat: 44.412, ageSeconds: 90 })],
      0.25,
    );
    const freshDelta = (fresh.get('bus:09001')?.lat ?? 0) - 44.41;
    const agingDelta = (aging.get('bus:09001')?.lat ?? 0) - 44.41;
    expect(agingDelta).toBeGreaterThan(0);
    expect(agingDelta).toBeLessThan(freshDelta);
  });

  test('a far-away target snaps instead of chasing across town', () => {
    const goal = target({ lat: 44.5 });
    const next = smoothStep(at(8.94, 44.41), [goal], 0.016);
    expect(next.get('bus:09001')?.lat).toBe(44.5);
  });
});
