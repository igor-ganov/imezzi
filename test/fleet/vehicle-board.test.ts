import { describe, expect, test } from 'bun:test';
import type { FleetTarget } from '../../src/lib/fleet/fleet-target.ts';
import { vehicleBoard } from '../../src/lib/fleet/vehicle-board.ts';

const target: FleetTarget = {
  id: 'bus:09001',
  label: '18',
  templateKey: '18#0',
  template: {
    stops: ['A', 'B', 'C'],
    offsets: [0, 120, 300],
    lastStopName: 'SAMPIERDARENA',
  },
  road: undefined,
  targetMoment: 60,
  ageSeconds: 0,
  builtAtMs: 100000,
  anchor: [8.9, 44.1],
  dimmed: false,
};

const names = new Map([
  ['A', 'PRINCIPE'],
  ['B', 'DINEGRO'],
  ['C', 'SAMPIERDARENA'],
]);

describe('vehicleBoard — remaining stops with wait + arrival', () => {
  test('lists only the stops ahead of the LIVE moment', () => {
    // Built at moment 60; 30 s later the live moment is 90 — stop A
    // (offset 0) is behind, B (120) is 30 s ahead, C (300) 210 s.
    const rows = vehicleBoard(target, names, 130000);
    expect(rows.map((row) => row.name)).toEqual(['DINEGRO', 'SAMPIERDARENA']);
    expect(rows[0]?.etaSeconds).toBe(30);
    expect(rows[1]?.etaSeconds).toBe(210);
  });

  test('arrival is a wall-clock HH:MM stamp', () => {
    const rows = vehicleBoard(target, names, 130000);
    expect(rows[0]?.arrival).toMatch(/^\d{2}:\d{2}$/);
  });

  test('unknown stop ids fall back to the id itself', () => {
    const rows = vehicleBoard(target, new Map(), 130000);
    expect(rows[0]?.name).toBe('B');
  });

  test('a vehicle at the terminus shows only it, arriving now', () => {
    const rows = vehicleBoard(target, names, 400000);
    expect(rows.map((row) => row.name)).toEqual(['SAMPIERDARENA']);
    expect(rows[0]?.etaSeconds).toBe(0);
  });

  test('no template — no rows, no crash', () => {
    expect(
      vehicleBoard({ ...target, template: undefined }, names, 130000),
    ).toEqual([]);
  });
});
