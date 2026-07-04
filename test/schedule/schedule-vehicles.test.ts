import { describe, expect, test } from 'bun:test';
import { scheduleVehicles } from '../../src/lib/schedule/schedule-vehicles.ts';
import type { Schedule } from '../../src/lib/schedule/types.ts';

const schedule: Schedule = {
  lines: [
    {
      id: 'MM-91',
      shortName: 'MM',
      longName: 'Brin - Brignole',
      mode: 'metro',
      directions: [
        {
          stops: ['A', 'B', 'C'],
          offsets: [0, 120, 300],
          departures: { WEEK: [36000, 36200] },
        },
      ],
    },
  ],
  serviceDates: { WEEK: ['20260704'] },
  stops: {
    A: { name: 'Brin', lat: 44.0, lon: 8.0 },
    B: { name: 'Dinegro', lat: 44.2, lon: 8.2 },
    C: { name: 'Brignole', lat: 44.4, lon: 8.4 },
  },
};

describe('scheduleVehicles', () => {
  test('positions a vehicle halfway through its first segment', () => {
    const views = scheduleVehicles(schedule, { day: '20260704', seconds: 36060 });
    expect(views.length).toBe(1);
    expect(views[0]?.lat).toBeCloseTo(44.1);
    expect(views[0]?.lon).toBeCloseTo(8.1);
    expect(views[0]?.approximated).toBe(true);
  });

  test('returns nothing outside service window', () => {
    expect(
      scheduleVehicles(schedule, { day: '20260704', seconds: 50000 }),
    ).toEqual([]);
  });

  test('ignores services not active today', () => {
    expect(
      scheduleVehicles(schedule, { day: '20260705', seconds: 36060 }),
    ).toEqual([]);
  });

  test('places two vehicles when both departures are en route', () => {
    const views = scheduleVehicles(schedule, { day: '20260704', seconds: 36290 });
    expect(views.length).toBe(2);
  });
});
