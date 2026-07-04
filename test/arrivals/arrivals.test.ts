import { describe, expect, test } from 'bun:test';
import { parseCountdown } from '../../src/lib/arrivals/parse-countdown.ts';
import { mergeBoardRows } from '../../src/lib/arrivals/merge-board-rows.ts';
import { scheduleBoardRows } from '../../src/lib/arrivals/schedule-board-rows.ts';
import type { Schedule } from '../../src/lib/schedule/types.ts';

describe('parseCountdown', () => {
  test("parses minute countdowns like 18'", () => {
    expect(parseCountdown("18'", 0)).toBe(1080);
  });

  test('parses clock times relative to now', () => {
    expect(parseCountdown('05:24', 5 * 3600)).toBe(24 * 60);
  });

  test('wraps clock times across midnight', () => {
    expect(parseCountdown('00:10', 23 * 3600 + 3300)).toBe(900);
  });

  test('treats unknown text as arriving now', () => {
    expect(parseCountdown('IN ARRIVO', 0)).toBe(0);
  });
});

const schedule: Schedule = {
  lines: [
    {
      id: 'MM-91',
      shortName: 'MM',
      longName: 'Brin - Brignole',
      mode: 'metro',
      directions: [
        {
          stops: ['A', 'B'],
          offsets: [0, 120],
          departures: { WEEK: [36000, 36300, 36600] },
        },
      ],
    },
  ],
  serviceDates: { WEEK: ['20260704'] },
  stops: {
    A: { name: 'Brin', lat: 44, lon: 8 },
    B: { name: 'Brignole', lat: 44.4, lon: 8.4 },
  },
};

describe('scheduleBoardRows', () => {
  test('lists upcoming timetable departures with ⚠ flag', () => {
    const rows = scheduleBoardRows(schedule, 'A', {
      day: '20260704',
      seconds: 36100,
    });
    expect(rows.length).toBe(2);
    expect(rows[0]?.approximated).toBe(true);
    expect(rows[0]?.destination).toBe('Brignole');
  });

  test('returns nothing for stops off the line', () => {
    expect(
      scheduleBoardRows(schedule, 'Z', { day: '20260704', seconds: 36100 }),
    ).toEqual([]);
  });
});

describe('mergeBoardRows', () => {
  test('interleaves live and timetable rows by ETA', () => {
    const live = [
      {
        line: '018',
        destination: 'SAMPIERDARENA',
        theoretical: false,
        arrivalTime: '10:05:00',
        countdown: "3'",
        vehicle: '09301',
        full: false,
      },
    ];
    const timetable = scheduleBoardRows(schedule, 'A', {
      day: '20260704',
      seconds: 36100,
    });
    const rows = mergeBoardRows(live, timetable, 36100, 10);
    expect(rows[0]?.line).toBe('18');
    expect(rows[0]?.approximated).toBe(false);
    expect(rows[1]?.line).toBe('MM');
  });
});
