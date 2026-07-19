import { describe, expect, test } from 'bun:test';
import { effectiveDay } from '../../src/lib/schedule/effective-day.ts';
import { scheduleVehicles } from '../../src/lib/schedule/schedule-vehicles.ts';
import type { Schedule } from '../../src/lib/schedule/types.ts';

// A published week-long window: 20260720 (Mon) .. 20260727 (Mon).
const week = ['20260720', '20260721', '20260722', '20260723', '20260724', '20260725', '20260726', '20260727'];

const schedule: Schedule = {
  lines: [
    {
      id: 'FGR-1',
      shortName: 'FGR',
      longName: 'Zecca - Righi',
      mode: 'funicular',
      directions: [{ stops: ['A', 'B'], offsets: [0, 300], departures: { W: [36000] } }],
    },
  ],
  serviceDates: { W: week },
  stops: {
    A: { name: 'Zecca', lat: 44.4, lon: 8.9 },
    B: { name: 'Righi', lat: 44.43, lon: 8.93 },
  },
};

describe('effectiveDay', () => {
  test('keeps a day the feed covers', () => {
    expect(effectiveDay(schedule, '20260722')).toBe('20260722');
  });

  test('borrows the nearest same-weekday date for an uncovered day', () => {
    // 20260719 (Sun) is off the front edge; the next Sunday is 20260726.
    expect(effectiveDay(schedule, '20260719')).toBe('20260726');
  });

  test('leaves the day untouched when no same-weekday date exists', () => {
    const monOnly: Schedule = { ...schedule, serviceDates: { W: ['20260720'] } };
    expect(effectiveDay(monOnly, '20260719')).toBe('20260719');
  });
});

describe('scheduleVehicles on an uncovered day', () => {
  test('still positions vehicles via the borrowed weekday timetable', () => {
    const views = scheduleVehicles(schedule, { day: '20260719', seconds: 36150 });
    expect(views.length).toBe(1);
    expect(views[0]?.mode).toBe('funicular');
  });
});
