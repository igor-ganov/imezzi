import { describe, expect, test } from 'bun:test';
import type { Stop } from '../../src/lib/amt/types.ts';
import { servedStopIds } from '../../src/lib/lines/served-stop-ids.ts';
import type { Schedule } from '../../src/lib/schedule/types.ts';

const stop = (id: string, lines: readonly string[]): Stop => ({
  id,
  name: id,
  description: '',
  lat: 44,
  lon: 8,
  lines,
  monitored: true,
});

const stops = [
  stop('S1', ['009-00']),
  stop('S2', ['009-00', '018-00']),
  stop('S3', ['015-00']),
];

const schedule: Schedule = {
  lines: [
    {
      id: 'MM-91',
      shortName: 'MM',
      longName: 'Metro',
      mode: 'metro',
      directions: [
        { stops: ['M1', 'M2'], offsets: [0, 60], departures: {} },
        { stops: ['M2', 'M1'], offsets: [0, 60], departures: {} },
      ],
    },
    {
      id: 'FZ-160',
      shortName: 'FZ',
      longName: 'Funicular',
      mode: 'funicular',
      directions: [{ stops: ['F1'], offsets: [0], departures: {} }],
    },
  ],
  serviceDates: {},
  stops: {},
};

describe('servedStopIds', () => {
  test('bus selection collects stops via stop.lines', () => {
    expect(servedStopIds(new Set(['009-00']), stops, schedule)).toEqual(
      new Set(['S1', 'S2']),
    );
  });

  test('a stop served by any selected line is included once', () => {
    expect(
      servedStopIds(new Set(['009-00', '018-00']), stops, schedule),
    ).toEqual(new Set(['S1', 'S2']));
  });

  test('non-bus selection collects stops from all schedule directions', () => {
    expect(servedStopIds(new Set(['MM-91']), stops, schedule)).toEqual(
      new Set(['M1', 'M2']),
    );
  });

  test('mixed bus and schedule selection unions both sources', () => {
    expect(
      servedStopIds(new Set(['015-00', 'FZ-160']), stops, schedule),
    ).toEqual(new Set(['S3', 'F1']));
  });

  test('empty selection highlights nothing', () => {
    expect(servedStopIds(new Set(), stops, schedule)).toEqual(new Set());
  });

  test('unknown keys highlight nothing', () => {
    expect(servedStopIds(new Set(['999-00']), stops, schedule)).toEqual(
      new Set(),
    );
  });
});
