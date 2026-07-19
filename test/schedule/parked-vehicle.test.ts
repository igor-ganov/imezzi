import { describe, expect, test } from 'bun:test';
import { scheduleVehicles } from '../../src/lib/schedule/schedule-vehicles.ts';
import type { Schedule } from '../../src/lib/schedule/types.ts';

const funicular: Schedule = {
  lines: [
    {
      id: 'FGR-1',
      shortName: 'FGR',
      longName: 'Zecca - Righi',
      mode: 'funicular',
      directions: [
        {
          stops: ['A', 'B'],
          offsets: [0, 300],
          departures: { WEEK: [36000, 39000] },
        },
      ],
    },
  ],
  serviceDates: { WEEK: ['20260704'] },
  stops: {
    A: { name: 'Zecca', lat: 44.4, lon: 8.9 },
    B: { name: 'Righi', lat: 44.43, lon: 8.93 },
  },
};

describe('parked schedule vehicles', () => {
  test('parks an idle direction at its origin when a run is still to come', () => {
    const views = scheduleVehicles(funicular, { day: '20260704', seconds: 37000 });
    expect(views.length).toBe(1);
    expect(views[0]?.id).toBe('FGR-1:0:park');
    expect(views[0]?.lat).toBeCloseTo(44.4);
    expect(views[0]?.lon).toBeCloseTo(8.9);
    expect(views[0]?.approximated).toBe(true);
  });

  test('waits at the depot before the first departure', () => {
    const views = scheduleVehicles(funicular, { day: '20260704', seconds: 30000 });
    expect(views.map((view) => view.id)).toEqual(['FGR-1:0:park']);
  });

  test('en-route runs win over the parked car', () => {
    const views = scheduleVehicles(funicular, { day: '20260704', seconds: 36150 });
    expect(views.length).toBe(1);
    expect(views[0]?.id).toBe('FGR-1:0:WEEK:36000');
  });

  test('no car parked once the last run of the day has departed', () => {
    expect(
      scheduleVehicles(funicular, { day: '20260704', seconds: 40000 }),
    ).toEqual([]);
  });

  test('no car parked when the service does not run today', () => {
    expect(
      scheduleVehicles(funicular, { day: '20260705', seconds: 30000 }),
    ).toEqual([]);
  });
});
