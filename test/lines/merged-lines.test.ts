import { describe, expect, test } from 'bun:test';
import type { Line } from '../../src/lib/amt/types.ts';
import { mergedLines } from '../../src/lib/lines/merged-lines.ts';
import type { Schedule } from '../../src/lib/schedule/types.ts';

const schedule: Schedule = {
  lines: [
    {
      id: 'MM-91',
      shortName: 'MM',
      longName: 'Metropolitana Brin - Brignole',
      mode: 'metro',
      directions: [],
    },
    {
      id: 'FZ-160',
      shortName: 'FZ',
      longName: 'Funicolare Zecca - Righi',
      mode: 'funicular',
      directions: [],
    },
  ],
  serviceDates: {},
  stops: {},
};

const appLines: readonly Line[] = [
  {
    id: '009-00',
    name: '9',
    from: 'CARICAMENTO',
    to: 'PONTEDECIMO',
    category: 'U',
  },
];

describe('mergedLines', () => {
  test('schedule lines come first, mapped to UI shape', () => {
    const lines = mergedLines(appLines, schedule);
    expect(lines[0]).toEqual({
      key: 'MM-91',
      label: 'MM',
      description: 'Metropolitana Brin - Brignole',
      mode: 'metro',
    });
    expect(lines[1]?.mode).toBe('funicular');
  });

  test('app bus lines follow with a from ⇄ to description', () => {
    const lines = mergedLines(appLines, schedule);
    expect(lines[2]).toEqual({
      key: '009-00',
      label: '9',
      description: 'CARICAMENTO ⇄ PONTEDECIMO',
      mode: 'bus',
    });
  });

  test('total length is the sum of both sources', () => {
    expect(mergedLines(appLines, schedule).length).toBe(3);
  });

  test('empty inputs merge into an empty list', () => {
    expect(
      mergedLines([], { lines: [], serviceDates: {}, stops: {} }),
    ).toEqual([]);
  });

  test('works with only app lines', () => {
    const lines = mergedLines(appLines, {
      lines: [],
      serviceDates: {},
      stops: {},
    });
    expect(lines.map((line) => line.key)).toEqual(['009-00']);
  });
});
