import { describe, expect, test } from 'bun:test';
import { scheduleBoardRows } from '../../src/lib/arrivals/schedule-board-rows.ts';
import type { Schedule } from '../../src/lib/schedule/types.ts';

// A funicular station served on 2026-07-20 (day "20260720"), departing
// at 08:00 (28800 s) from its first stop with a 120 s offset there.
const schedule: Schedule = {
  serviceDates: { S1: ['20260720'] },
  stops: {
    ZEC: { name: 'Zecca', lat: 44.41, lon: 8.93 },
    RIG: { name: 'Righi', lat: 44.43, lon: 8.94 },
  },
  lines: [
    {
      id: 'FRI',
      shortName: 'FRI',
      longName: 'Zecca - Righi',
      mode: 'funicular',
      directions: [
        { stops: ['ZEC', 'RIG'], offsets: [0, 120], departures: { S1: [28800] } },
      ],
    },
  ],
};

describe('scheduleBoardRows — non-bus station timetable', () => {
  test('a funicular station shows its upcoming ⚠ departure', () => {
    const rows = scheduleBoardRows(schedule, 'RIG', {
      day: '20260720',
      seconds: 28800, // 08:00 — the arrival at RIG is 28800 + 120 = +120 s
    });
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      line: 'FRI',
      mode: 'funicular',
      destination: 'Righi',
      approximated: true,
    });
    expect(rows[0]?.etaSeconds).toBe(120);
  });

  test('a stop not on the line yields nothing', () => {
    expect(
      scheduleBoardRows(schedule, 'NOPE', { day: '20260720', seconds: 28800 }),
    ).toHaveLength(0);
  });
});
