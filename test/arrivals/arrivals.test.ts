import { describe, expect, test } from 'bun:test';
import { parseCountdown } from '../../src/lib/arrivals/parse-countdown.ts';
import { mergeBoardRows } from '../../src/lib/arrivals/merge-board-rows.ts';
import { scheduleBoardRows } from '../../src/lib/arrivals/schedule-board-rows.ts';
import type { BoardRow } from '../../src/lib/arrivals/board-row.ts';
import type { Arrival } from '../../src/lib/amt/types.ts';
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

  test("parses the zero countdown 0'", () => {
    expect(parseCountdown("0'", 0)).toBe(0);
  });

  test("parses the one-minute countdown 1'", () => {
    expect(parseCountdown("1'", 0)).toBe(60);
  });

  test('parses clock times with a dot separator', () => {
    expect(parseCountdown('05.24', 5 * 3600)).toBe(24 * 60);
  });

  test('parses single-digit clock hours', () => {
    expect(parseCountdown('5:24', 5 * 3600)).toBe(24 * 60);
  });

  test('a clock time equal to now is zero seconds away', () => {
    expect(parseCountdown('05:00', 5 * 3600)).toBe(0);
  });

  test('a clock time one minute in the past wraps to almost a day', () => {
    expect(parseCountdown('04:59', 5 * 3600)).toBe(86340);
  });

  test('trims surrounding whitespace before matching', () => {
    expect(parseCountdown("  18'  ", 0)).toBe(1080);
    expect(parseCountdown('\t05:24 ', 5 * 3600)).toBe(24 * 60);
  });

  test('garbage and empty strings mean arriving now', () => {
    expect(parseCountdown('', 0)).toBe(0);
    expect(parseCountdown('SOSPESA', 0)).toBe(0);
    expect(parseCountdown('5 min', 0)).toBe(0);
    expect(parseCountdown("18' circa", 0)).toBe(0);
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

  test('keeps a departure exactly 30 s in the past, clamped to 0', () => {
    const rows = scheduleBoardRows(schedule, 'A', {
      day: '20260704',
      seconds: 36030,
    });
    expect(rows.length).toBe(3);
    expect(rows[0]?.etaSeconds).toBe(0);
  });

  test('drops a departure 31 s in the past', () => {
    const rows = scheduleBoardRows(schedule, 'A', {
      day: '20260704',
      seconds: 36031,
    });
    expect(rows.map((row) => row.etaSeconds)).toEqual([269, 569]);
  });

  test('keeps a departure exactly 5400 s ahead', () => {
    const rows = scheduleBoardRows(schedule, 'A', {
      day: '20260704',
      seconds: 30600,
    });
    expect(rows.map((row) => row.etaSeconds)).toEqual([5400]);
  });

  test('drops departures beyond the 5400 s window', () => {
    expect(
      scheduleBoardRows(schedule, 'A', { day: '20260704', seconds: 30599 }),
    ).toEqual([]);
  });

  test('applies the stop offset for mid-route stops', () => {
    const rows = scheduleBoardRows(schedule, 'B', {
      day: '20260704',
      seconds: 36100,
    });
    expect(rows.map((row) => row.etaSeconds)).toEqual([20, 320, 620]);
    expect(rows[0]?.line).toBe('MM');
    expect(rows[0]?.destination).toBe('Brignole');
  });

  test('ignores services not active on the day', () => {
    expect(
      scheduleBoardRows(schedule, 'A', { day: '20260705', seconds: 36100 }),
    ).toEqual([]);
  });

  test('falls back to the line longName when the terminus stop is unknown', () => {
    const nameless: Schedule = {
      ...schedule,
      lines: [
        {
          id: 'MM-91',
          shortName: 'MM',
          longName: 'Brin - Brignole',
          mode: 'metro',
          directions: [
            {
              stops: ['A', 'X'],
              offsets: [0, 120],
              departures: { WEEK: [36200] },
            },
          ],
        },
      ],
    };
    const rows = scheduleBoardRows(nameless, 'A', {
      day: '20260704',
      seconds: 36100,
    });
    expect(rows.length).toBe(1);
    expect(rows[0]?.destination).toBe('Brin - Brignole');
  });
});

const arrival = (over: Partial<Arrival>): Arrival => ({
  line: '018',
  destination: 'SAMPIERDARENA',
  theoretical: false,
  arrivalTime: '',
  countdown: "3'",
  vehicle: '09301',
  full: false,
  ...over,
});

const timetableRow = (etaSeconds: number): BoardRow => ({
  line: 'MM',
  mode: 'metro',
  destination: 'Brignole',
  etaSeconds,
  approximated: true,
  full: false,
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

  test('caps the board at the given limit, soonest first', () => {
    const live = [
      arrival({ countdown: "9'" }),
      arrival({ countdown: "1'" }),
      arrival({ countdown: "5'" }),
    ];
    const timetable = [
      timetableRow(120),
      timetableRow(480),
    ];
    const rows = mergeBoardRows(live, timetable, 0, 2);
    expect(rows.length).toBe(2);
    expect(rows.map((row) => row.etaSeconds)).toEqual([60, 120]);
  });

  test('limit zero empties the board', () => {
    expect(mergeBoardRows([arrival({})], [], 0, 0)).toEqual([]);
  });

  test('equal ETAs keep live rows ahead of timetable rows (stable sort)', () => {
    const rows = mergeBoardRows(
      [arrival({ countdown: "2'" })],
      [timetableRow(120)],
      0,
      10,
    );
    expect(rows.map((row) => row.approximated)).toEqual([false, true]);
  });

  test('equal-ETA timetable rows keep their input order', () => {
    const first = { ...timetableRow(120), destination: 'FIRST' };
    const second = { ...timetableRow(120), destination: 'SECOND' };
    const rows = mergeBoardRows([], [first, second], 0, 10);
    expect(rows.map((row) => row.destination)).toEqual(['FIRST', 'SECOND']);
  });

  test('strips leading zeros from live line labels', () => {
    const rows = mergeBoardRows(
      [
        arrival({ line: '009' }),
        arrival({ line: '05/' }),
        arrival({ line: '0' }),
        arrival({ line: 'N2' }),
      ],
      [],
      0,
      10,
    );
    expect(rows.map((row) => row.line)).toEqual(['9', '5/', '0', 'N2']);
  });

  test('propagates the theoretical and full flags from live rows', () => {
    const rows = mergeBoardRows(
      [arrival({ theoretical: true, full: true })],
      [],
      0,
      10,
    );
    expect(rows[0]?.approximated).toBe(true);
    expect(rows[0]?.full).toBe(true);
  });
});
