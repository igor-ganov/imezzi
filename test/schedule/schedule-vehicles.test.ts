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

const overnight: Schedule = {
  lines: [
    {
      id: 'N1',
      shortName: 'N1',
      longName: 'Night line',
      mode: 'bus',
      directions: [
        {
          stops: ['A', 'B', 'C'],
          offsets: [0, 120, 300],
          departures: { NIGHT: [86300] },
        },
      ],
    },
  ],
  serviceDates: { NIGHT: ['20260704'] },
  stops: schedule.stops,
};

describe('scheduleVehicles overnight trips', () => {
  test("continues yesterday's post-midnight trip via seconds + 86400", () => {
    const views = scheduleVehicles(overnight, { day: '20260705', seconds: 160 });
    expect(views.length).toBe(1);
    expect(views[0]?.id).toBe('N1:0:NIGHT:86300');
    expect(views[0]?.lat).toBeCloseTo(44.2 + (140 / 180) * 0.2);
    expect(views[0]?.lon).toBeCloseTo(8.2 + (140 / 180) * 0.2);
  });

  test('the same trip is visible before midnight on its service day', () => {
    const views = scheduleVehicles(overnight, { day: '20260704', seconds: 86360 });
    expect(views.length).toBe(1);
    expect(views[0]?.lat).toBeCloseTo(44.1);
  });

  test('no carry-over when the service did not run yesterday', () => {
    expect(
      scheduleVehicles(overnight, { day: '20260706', seconds: 160 }),
    ).toEqual([]);
  });
});

const multi: Schedule = {
  lines: [
    {
      id: 'L1',
      shortName: '1',
      longName: 'Line one',
      mode: 'metro',
      directions: [
        {
          stops: ['A', 'B'],
          offsets: [0, 120],
          departures: { WEEK: [36000], SAT: [36060] },
        },
        {
          stops: ['B', 'A'],
          offsets: [0, 120],
          departures: { WEEK: [36030] },
        },
      ],
    },
  ],
  serviceDates: { WEEK: ['20260704'], SAT: ['20260704'] },
  stops: schedule.stops,
};

describe('scheduleVehicles multiple services and directions', () => {
  test('emits one vehicle per active service departure per direction', () => {
    const views = scheduleVehicles(multi, { day: '20260704', seconds: 36090 });
    expect(views.map((view) => view.id).sort()).toEqual([
      'L1:0:SAT:36060',
      'L1:0:WEEK:36000',
      'L1:1:WEEK:36030',
    ]);
  });

  test('opposite directions travel toward opposite termini', () => {
    const views = scheduleVehicles(multi, { day: '20260704', seconds: 36090 });
    const outbound = views.find((view) => view.id === 'L1:0:WEEK:36000');
    const inbound = views.find((view) => view.id === 'L1:1:WEEK:36030');
    expect(outbound?.lat).toBeCloseTo(44.15);
    expect(inbound?.lat).toBeCloseTo(44.1);
  });

  test('inactive service days silence only that service', () => {
    const saturdayOnly: Schedule = {
      ...multi,
      serviceDates: { WEEK: ['20260703'], SAT: ['20260704'] },
    };
    const views = scheduleVehicles(saturdayOnly, {
      day: '20260704',
      seconds: 36090,
    });
    expect(views.map((view) => view.id)).toEqual(['L1:0:SAT:36060']);
  });
});
