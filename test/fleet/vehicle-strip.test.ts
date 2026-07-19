import { describe, expect, test } from 'bun:test';
import type { FleetTarget } from '../../src/lib/fleet/fleet-target.ts';
import { vehicleStrip } from '../../src/lib/fleet/vehicle-strip.ts';

const names = new Map([
  ['A', 'Alpha'],
  ['B', 'Bravo'],
  ['C', 'Charlie'],
]);

const target: FleetTarget = {
  id: 'bus:7',
  label: '7',
  templateKey: '7:0',
  template: { stops: ['A', 'B', 'C'], offsets: [0, 120, 300], lastStopName: 'Charlie' },
  road: undefined,
  targetMoment: 180,
  ageSeconds: 0,
  builtAtMs: 1000,
  anchor: [0, 0],
  dimmed: false,
};

describe('vehicleStrip', () => {
  test('flags passed stops and names every stop of the trip', () => {
    const strip = vehicleStrip(target, names, 1000);
    expect(strip.stops.map((stop) => stop.name)).toEqual(['Alpha', 'Bravo', 'Charlie']);
    expect(strip.stops.map((stop) => stop.passed)).toEqual([true, true, false]);
  });

  test('progress is the moment over the last offset, clamped to 0–1', () => {
    expect(vehicleStrip(target, names, 1000).fraction).toBeCloseTo(180 / 300);
  });

  test('progress never exceeds 1 past the terminus', () => {
    expect(vehicleStrip(target, names, 400000).fraction).toBe(1);
  });
});
