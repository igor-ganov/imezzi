import { describe, expect, test } from 'bun:test';
import type { Arrival, LineStopRef, Stop } from '../../src/lib/amt/types.ts';
import { effectiveCountdown } from '../../src/lib/fleet/effective-countdown.ts';
import { fleetPlan } from '../../src/lib/fleet/fleet-plan.ts';
import { inferFleet } from '../../src/lib/fleet/infer-fleet.ts';
import { mergeSightings } from '../../src/lib/fleet/merge-sightings.ts';
import { advanceProgress } from '../../src/lib/fleet/fleet-memory.ts';
import { momentOf } from '../../src/lib/fleet/moment-of.ts';
import { pickTemplate } from '../../src/lib/fleet/pick-template.ts';
import { placeAtMoment } from '../../src/lib/fleet/place-at-moment.ts';
import type { BusOffsets, FleetSighting } from '../../src/lib/fleet/types.ts';
import { hotStops } from '../../src/lib/fleet/hot-stops.ts';
import { targetView } from '../../src/lib/fleet/target-view.ts';
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

describe('momentOf + placeAtMoment', () => {
  test('places between the two stops bracketing the moment', () => {
    const moment = momentOf(template, 'C', 120) ?? -1;
    expect(moment).toBe(180);
    const placed = placeAtMoment(template, coords, moment);
    expect(placed?.point[1]).toBeCloseTo(44.1 + (60 / 180) * 0.1, 5);
    expect(placed?.bearing).toBeCloseTo(0);
  });

  test('zero countdown puts the vehicle at its stop', () => {
    const placed = placeAtMoment(template, coords, momentOf(template, 'B', 0) ?? -1);
    expect(placed?.point[1]).toBeCloseTo(44.1, 5);
  });

  test('countdown beyond route start clamps to the first stop', () => {
    const placed = placeAtMoment(template, coords, momentOf(template, 'B', 999) ?? -1);
    expect(placed?.point[1]).toBeCloseTo(44.0, 5);
  });

  test('unknown stop id yields no moment', () => {
    expect(momentOf(template, 'Z', 60)).toBeUndefined();
  });
});

describe('advanceProgress', () => {
  test('small regressions hold, advances pass through', () => {
    const held = advanceProgress({ templateKey: '1#0', moment: 180 }, '1#0', 60, 1200);
    expect(held).toBe(180);
    expect(advanceProgress({ templateKey: '1#0', moment: 180 }, '1#0', 200, 1200)).toBe(200);
  });

  test('a direction change resets progress', () => {
    expect(advanceProgress({ templateKey: '1#0', moment: 180 }, '1#1', 30, 1200)).toBe(30);
  });

  test('a new-trip-sized regression resets progress', () => {
    expect(advanceProgress({ templateKey: '1#0', moment: 900 }, '1#0', 10, 1200)).toBe(10);
  });

  test('no history means the raw moment', () => {
    expect(advanceProgress(undefined, '1#0', 42, 1200)).toBe(42);
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

const viewsOf = (result: ReturnType<typeof inferFleet>) =>
  result.targets.map((entry) => targetView(entry, coords, entry.targetMoment));

describe('inferFleet — the count invariant', () => {
  test('every unique NumeroSociale yields exactly one marker', () => {
    const sightings = [
      sighting('B', { vehicle: '09001', countdown: "2'" }),
      sighting('C', { vehicle: '09001', countdown: "5'" }),
      sighting('C', { vehicle: '09002', countdown: "1'" }),
      sighting('A', { vehicle: '09003', line: '999', destination: 'BOH' }),
    ];
    const views = viewsOf(inferFleet(sightings, offsets, coords, 1000));
    expect(views.length).toBe(3);
    expect(views.length).toBe(uniqueFleetCount(sightings));
    expect(new Set(views.map((view) => view.id)).size).toBe(3);
  });

  test('vehicles without a usable template anchor at their stop', () => {
    const views = viewsOf(
      inferFleet(
        [sighting('B', { vehicle: '09009', line: '999' })],
        offsets,
        coords,
        1000,
      ),
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
    expect(inferFleet(sightings, offsets, coords, 1000).targets).toEqual([]);
    expect(uniqueFleetCount(sightings)).toBe(0);
  });

  test('positions advance as the countdown melts', () => {
    const sightings = [sighting('C', { countdown: "3'" })];
    const early = viewsOf(inferFleet(sightings, offsets, coords, 1000));
    const later = viewsOf(inferFleet(sightings, offsets, coords, 1090));
    expect((later[0]?.lat ?? 0) > (early[0]?.lat ?? 1)).toBe(true);
  });

  test('bearing points along the travel direction', () => {
    const views = viewsOf(inferFleet([sighting('C', { countdown: "2'" })], offsets, coords, 1000));
    expect(views[0]?.bearing).toBeCloseTo(0);
  });
});

describe('inferFleet — barrata labels match base templates (regression)', () => {
  test('a 1/ (barrata) run tracks the 1 template, keeps its label', () => {
    // Live-caught: SIMON line '604/' found no template and anchored
    // to sighting stops, teleporting kilometres between them.
    const result = inferFleet(
      [sighting('B', { line: '1/' })],
      offsets,
      coords,
      1000,
    );
    expect(result.targets[0]?.template).toBeDefined();
    expect(result.targets[0]?.label).toBe('1/');
  });
});

describe('inferFleet — no freeze at the sighted stop (regression)', () => {
  test('a vehicle keeps moving past its stop at schedule speed', () => {
    // Sighted 1' from B at t=1000. At t=1120 the countdown is −60:
    // the bus PASSED B and must be en route to C — the old clamp
    // parked it at B until the next sweep, then teleported it.
    const result = inferFleet(
      [sighting('B', { countdown: "1'" }, 1000)],
      offsets,
      coords,
      1120,
    );
    const view = viewsOf(result)[0];
    expect(view?.lat ?? 0).toBeGreaterThan(44.1);
    expect(view?.lat ?? 0).toBeLessThan(44.2);
  });

  test('extrapolation clamps at the terminus', () => {
    const result = inferFleet(
      [sighting('B', { countdown: "1'" }, 1000)],
      offsets,
      coords,
      1000 + 9999,
    );
    expect(viewsOf(result)[0]?.lat).toBeCloseTo(44.2, 5);
  });

  test('wrapped clock rows (already passed) are excluded everywhere', () => {
    // Live probe caught this: 120 s → 86400 s on re-poll after the
    // bus passed the stop. Such a row teleported the vehicle to the
    // route start; it must count neither as data nor as a marker.
    const wrapped = [sighting('B', { countdown: "1439'" }, 1000)];
    expect(inferFleet(wrapped, offsets, coords, 1000).targets).toEqual([]);
    expect(uniqueFleetCount(wrapped)).toBe(0);
  });
});

describe('inferFleet — no backward motion (regression)', () => {
  test('a re-poll with a GROWN countdown must not slide the bus back', () => {
    // First poll: 2' to C → moment 180. Second poll (30 s later):
    // traffic makes the prediction WORSE — 4' to C → raw moment 60,
    // i.e. 120 s BEHIND. The bus must hold, never glide backward.
    const first = inferFleet(
      [sighting('C', { countdown: "2'" }, 1000)],
      offsets,
      coords,
      1000,
    );
    const firstLat = viewsOf(first)[0]?.lat ?? 0;
    const second = inferFleet(
      [sighting('C', { countdown: "4'" }, 1030)],
      offsets,
      coords,
      1030,
      () => undefined,
      first.memory,
    );
    expect(viewsOf(second)[0]?.lat ?? 0).toBeGreaterThanOrEqual(firstLat);
  });

  test('best-stop flapping between two sightings cannot regress', () => {
    const first = inferFleet(
      [
        sighting('B', { countdown: "1'" }, 1000),
        sighting('C', { countdown: "4'" }, 1000),
      ],
      offsets,
      coords,
      1000,
    );
    const firstLat = viewsOf(first)[0]?.lat ?? 0;
    // 70 s later B's row is gone (bus passed); C alone now implies a
    // moment slightly before the held one — hold, don't move back.
    const second = inferFleet(
      [sighting('C', { countdown: "3'" }, 1070)],
      offsets,
      coords,
      1070,
      () => undefined,
      first.memory,
    );
    expect(viewsOf(second)[0]?.lat ?? 0).toBeGreaterThanOrEqual(firstLat);
  });

  test('a very large regression on the same line starts a new trip', () => {
    const atTerminus = inferFleet(
      [sighting('C', { countdown: "0'" }, 1000)],
      offsets,
      coords,
      1000,
    );
    expect(viewsOf(atTerminus)[0]?.lat).toBeCloseTo(44.2, 5);
    const nextTrip = inferFleet(
      [sighting('B', { countdown: "9'" }, 1900)],
      offsets,
      coords,
      1900,
      () => undefined,
      atTerminus.memory,
    );
    // raw moment = 120 - 540 → clamped 0 → a 300 s regression from
    // the terminus: accepted as the next departure, back at the start.
    expect(viewsOf(nextTrip)[0]?.lat).toBeCloseTo(44.0, 5);
  });
});

describe('inferFleet — sticky direction (regression)', () => {
  const reverse = {
    stops: ['C', 'B', 'A'],
    offsets: [0, 180, 300],
    lastStopName: 'SUD',
  };
  const twoWay: BusOffsets = { '1': [template, reverse] };

  test('a stop served by both directions keeps the assigned one', () => {
    // Headsign matching neither terminus: the first tick assigns the
    // fallback direction; a later tick at another shared stop must
    // NOT flip the direction (random arrow flips came from this).
    const first = inferFleet(
      [sighting('B', { destination: 'BOH', countdown: "2'" }, 1000)],
      twoWay,
      coords,
      1000,
    );
    const second = inferFleet(
      [sighting('A', { destination: 'BOH', countdown: "1'" }, 1060)],
      twoWay,
      coords,
      1060,
      () => undefined,
      first.memory,
    );
    expect(first.memory.get('bus:09001')?.templateKey).toBe('1#0');
    expect(second.memory.get('bus:09001')?.templateKey).toBe('1#0');
  });
});

describe('hotStops', () => {
  test('yields each tracked vehicle`s next stop, deduped and capped', () => {
    const result = inferFleet(
      [
        sighting('B', { vehicle: '09001', countdown: "1'" }),
        sighting('B', { vehicle: '09002', countdown: "2'" }),
      ],
      offsets,
      coords,
      1000,
    );
    // Both vehicles are still before B (moments 60 and 0) — the next
    // stop for each is B, deduped into one entry.
    expect(hotStops(result.targets, 30)).toEqual(['B']);
    expect(hotStops(result.targets, 0)).toEqual([]);
  });

  test('a vehicle at the terminus contributes nothing', () => {
    const result = inferFleet(
      [sighting('C', { countdown: "0'" })],
      offsets,
      coords,
      1000,
    );
    expect(hotStops(result.targets, 30)).toEqual([]);
  });
});

describe('effectiveCountdown', () => {
  test('melts with elapsed time and goes negative past the stop', () => {
    const entry = sighting('B', { countdown: "2'" }, 1000);
    expect(effectiveCountdown(entry, 1000)).toBe(120);
    expect(effectiveCountdown(entry, 1060)).toBe(60);
    expect(effectiveCountdown(entry, 2000)).toBe(-880);
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
