import { describe, expect, test } from 'bun:test';
import type { Arrival, LineStopRef, Stop } from '../../src/lib/amt/types.ts';
import { effectiveCountdown } from '../../src/lib/fleet/effective-countdown.ts';
import { fleetPlan } from '../../src/lib/fleet/fleet-plan.ts';
import { inferFleet } from '../../src/lib/fleet/infer-fleet.ts';
import { mergeSightings } from '../../src/lib/fleet/merge-sightings.ts';
import { pickTemplate } from '../../src/lib/fleet/pick-template.ts';
import { positionOnDirection } from '../../src/lib/fleet/position-on-direction.ts';
import type { BusOffsets, FleetSighting } from '../../src/lib/fleet/types.ts';
import { uniqueFleetCount } from '../../src/lib/fleet/unique-fleet-count.ts';
import { bearingOf } from '../../src/lib/geo/bearing-of.ts';

const stop = (id: string, lat: number, monitored = true): Stop => ({
  id,
  name: `STOP ${id}`,
  description: '',
  lat,
  lon: 8.9,
  lines: [],
  monitored,
});

const ref = (
  lineId: string,
  direction: number,
  stopId: string,
  position: number,
): LineStopRef => ({ lineId, direction, stopId, position });

describe('fleetPlan', () => {
  test('takes every Nth monitored stop plus the terminus', () => {
    const stops = ['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((id, i) =>
      stop(id, 44 + i * 0.01),
    );
    const refs = stops.map((entry, i) => ref('001-00', 1, entry.id, i + 1));
    expect(fleetPlan(stops, refs, 3)).toEqual(['A', 'D', 'G']);
  });

  test('skips unmonitored stops and dedupes across lines', () => {
    const stops = [stop('A', 44), stop('B', 44.1, false), stop('C', 44.2)];
    const refs = [
      ref('001-00', 1, 'A', 1),
      ref('001-00', 1, 'B', 2),
      ref('001-00', 1, 'C', 3),
      ref('009-00', 1, 'A', 1),
      ref('009-00', 1, 'C', 2),
    ];
    expect([...fleetPlan(stops, refs, 2)].sort()).toEqual(['A', 'C']);
  });

  test('empty inputs produce an empty plan', () => {
    expect(fleetPlan([], [], 6)).toEqual([]);
  });
});

describe('bearingOf', () => {
  test('north, east, south, west', () => {
    expect(bearingOf([8.9, 44], [8.9, 44.1])).toBeCloseTo(0);
    expect(bearingOf([8.9, 44], [9.0, 44])).toBeCloseTo(90);
    expect(bearingOf([8.9, 44], [8.9, 43.9])).toBeCloseTo(180);
    expect(bearingOf([8.9, 44], [8.8, 44])).toBeCloseTo(270);
  });
});

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

describe('positionOnDirection', () => {
  test('places between the two stops bracketing the moment', () => {
    const placed = positionOnDirection(template, coords, 'C', 120);
    // arrival at C = 300, moment = 180 → between B (120) and C (300)
    expect(placed?.point[1]).toBeCloseTo(44.1 + (60 / 180) * 0.1, 5);
    expect(placed?.bearing).toBeCloseTo(0);
  });

  test('zero countdown puts the vehicle at its stop', () => {
    const placed = positionOnDirection(template, coords, 'B', 0);
    expect(placed?.point[1]).toBeCloseTo(44.1, 5);
  });

  test('countdown beyond route start clamps to the first stop', () => {
    const placed = positionOnDirection(template, coords, 'B', 999);
    expect(placed?.point[1]).toBeCloseTo(44.0, 5);
  });

  test('unknown stop id yields undefined', () => {
    expect(positionOnDirection(template, coords, 'Z', 60)).toBeUndefined();
  });
});

describe('pickTemplate', () => {
  const reverse = {
    stops: ['C', 'B', 'A'],
    offsets: [0, 180, 300],
    lastStopName: 'SUD',
  };

  test('matches the headsign to a terminus among serving directions', () => {
    expect(pickTemplate([template, reverse], 'B', 'NORD')).toBe(template);
    expect(pickTemplate([template, reverse], 'B', 'SUD')).toBe(reverse);
  });

  test('falls back to any serving direction on unknown headsigns', () => {
    expect(pickTemplate([template, reverse], 'B', 'BOH')).toBe(template);
  });

  test('directions not serving the stop are ignored', () => {
    const short = { stops: ['X'], offsets: [0], lastStopName: 'NORD' };
    expect(pickTemplate([short], 'B', 'NORD')).toBeUndefined();
  });
});

const row = (over: Partial<Arrival>): Arrival => ({
  line: '001',
  destination: 'NORD',
  theoretical: false,
  arrivalTime: '',
  countdown: "2'",
  vehicle: '09001',
  full: false,
  ...over,
});

const sighting = (
  stopId: string,
  over: Partial<Arrival>,
  fetchedAtSeconds = 1000,
): FleetSighting => ({ stopId, row: row(over), fetchedAtSeconds });

const offsets: BusOffsets = { '1': [template] };

describe('inferFleet — the count invariant', () => {
  test('every unique NumeroSociale yields exactly one marker', () => {
    const sightings = [
      sighting('B', { vehicle: '09001', countdown: "2'" }),
      sighting('C', { vehicle: '09001', countdown: "5'" }),
      sighting('C', { vehicle: '09002', countdown: "1'" }),
      sighting('A', { vehicle: '09003', line: '999', destination: 'BOH' }),
    ];
    const views = inferFleet(sightings, offsets, coords, 1000);
    expect(views.length).toBe(3);
    expect(views.length).toBe(uniqueFleetCount(sightings));
    expect(new Set(views.map((view) => view.id)).size).toBe(3);
  });

  test('vehicles without a usable template anchor at their stop', () => {
    const views = inferFleet(
      [sighting('B', { vehicle: '09009', line: '999' })],
      offsets,
      coords,
      1000,
    );
    expect(views.length).toBe(1);
    expect(views[0]?.lat).toBeCloseTo(44.1, 5);
    expect(views[0]?.bearing).toBeUndefined();
  });

  test('theoretical rows and blank vehicles are not fleet', () => {
    const sightings = [
      sighting('B', { theoretical: true, vehicle: '09001' }),
      sighting('B', { vehicle: '' }),
    ];
    expect(inferFleet(sightings, offsets, coords, 1000)).toEqual([]);
    expect(uniqueFleetCount(sightings)).toBe(0);
  });

  test('positions advance as the countdown melts', () => {
    const sightings = [sighting('C', { countdown: "3'" })];
    const early = inferFleet(sightings, offsets, coords, 1000);
    const later = inferFleet(sightings, offsets, coords, 1090);
    expect((later[0]?.lat ?? 0) > (early[0]?.lat ?? 1)).toBe(true);
  });

  test('bearing points along the travel direction', () => {
    const views = inferFleet([sighting('C', { countdown: "2'" })], offsets, coords, 1000);
    expect(views[0]?.bearing).toBeCloseTo(0);
  });
});

describe('effectiveCountdown', () => {
  test('melts with elapsed time and clamps at zero', () => {
    const entry = sighting('B', { countdown: "2'" }, 1000);
    expect(effectiveCountdown(entry, 1000)).toBe(120);
    expect(effectiveCountdown(entry, 1060)).toBe(60);
    expect(effectiveCountdown(entry, 2000)).toBe(0);
  });
});

describe('mergeSightings', () => {
  test('re-polled stops replace their rows, others survive TTL', () => {
    const current = [
      sighting('A', { vehicle: '09001' }, 1000),
      sighting('B', { vehicle: '09002' }, 1000),
    ];
    const fresh = [sighting('A', { vehicle: '09009' }, 1100)];
    const merged = mergeSightings(current, fresh, 1100, 240);
    expect(merged.map((entry) => entry.row.vehicle).sort()).toEqual([
      '09002',
      '09009',
    ]);
  });

  test('expired rows drop even without a re-poll', () => {
    const merged = mergeSightings(
      [sighting('B', {}, 100)],
      [],
      1000,
      240,
    );
    expect(merged).toEqual([]);
  });
});
