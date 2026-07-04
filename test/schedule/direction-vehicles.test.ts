import { describe, expect, test } from 'bun:test';
import { directionVehicles } from '../../src/lib/schedule/direction-vehicles.ts';
import type {
  Schedule,
  ScheduleDirection,
  ScheduleLine,
} from '../../src/lib/schedule/types.ts';

const direction: ScheduleDirection = {
  stops: ['A', 'B', 'C'],
  offsets: [0, 100, 300],
  departures: { WEEK: [1000, 1200], SUN: [1500] },
};

const line: ScheduleLine = {
  id: 'MM-91',
  shortName: 'MM',
  longName: 'Brin - Brignole',
  mode: 'metro',
  directions: [direction],
};

const schedule: Schedule = {
  lines: [line],
  serviceDates: {},
  stops: {
    A: { name: 'Brin', lat: 44.0, lon: 8.0 },
    B: { name: 'Dinegro', lat: 44.2, lon: 8.2 },
    C: { name: 'Brignole', lat: 44.6, lon: 8.6 },
  },
};

describe('directionVehicles', () => {
  test('maps an en-route trip to a vehicle view with line metadata', () => {
    const views = directionVehicles(
      schedule,
      line,
      direction,
      0,
      new Set(['WEEK']),
      1050,
    );
    expect(views.length).toBe(1);
    expect(views[0]?.id).toBe('MM-91:0:WEEK:1000');
    expect(views[0]?.label).toBe('MM');
    expect(views[0]?.mode).toBe('metro');
    expect(views[0]?.lineKey).toBe('MM-91');
    expect(views[0]?.approximated).toBe(true);
    expect(views[0]?.lat).toBeCloseTo(44.1);
    expect(views[0]?.lon).toBeCloseTo(8.1);
  });

  test('emits one vehicle per en-route departure of the same service', () => {
    const views = directionVehicles(
      schedule,
      line,
      direction,
      0,
      new Set(['WEEK']),
      1250,
    );
    expect(views.map((view) => view.id).sort()).toEqual([
      'MM-91:0:WEEK:1000',
      'MM-91:0:WEEK:1200',
    ]);
  });

  test('skips departures of inactive services even when en route', () => {
    expect(
      directionVehicles(schedule, line, direction, 0, new Set(['SUN']), 1100),
    ).toEqual([]);
  });

  test('empty service set yields nothing', () => {
    expect(
      directionVehicles(schedule, line, direction, 0, new Set(), 1050),
    ).toEqual([]);
  });

  test('embeds the direction index into the vehicle id', () => {
    const views = directionVehicles(
      schedule,
      line,
      direction,
      3,
      new Set(['SUN']),
      1550,
    );
    expect(views[0]?.id).toBe('MM-91:3:SUN:1500');
  });

  test('drops trips whose current segment misses stop coordinates', () => {
    const sparse: Schedule = {
      ...schedule,
      stops: {
        A: { name: 'Brin', lat: 44.0, lon: 8.0 },
        C: { name: 'Brignole', lat: 44.6, lon: 8.6 },
      },
    };
    expect(
      directionVehicles(sparse, line, direction, 0, new Set(['WEEK']), 1050),
    ).toEqual([]);
  });
});
