import { describe, expect, test } from 'bun:test';
import { stopModes } from '../../src/lib/map/stop-modes.ts';
import { toSpecialStopsGeojson } from '../../src/lib/map/to-special-stops-geojson.ts';
import type { Schedule } from '../../src/lib/schedule/types.ts';

const schedule: Schedule = {
  serviceDates: {},
  stops: {
    ZEC: { name: 'Zecca', lat: 44.41, lon: 8.93 },
    RIG: { name: 'Righi', lat: 44.43, lon: 8.94 },
    BRIN: { name: 'Brin', lat: 44.42, lon: 8.9 },
  },
  lines: [
    {
      id: 'FRI',
      shortName: 'FRI',
      longName: 'Zecca - Righi',
      mode: 'funicular',
      directions: [{ stops: ['ZEC', 'RIG'], offsets: [0], departures: {} }],
    },
    {
      id: 'M',
      shortName: 'M',
      longName: 'Metro',
      mode: 'metro',
      directions: [{ stops: ['BRIN', 'ZEC'], offsets: [0], departures: {} }],
    },
  ],
};

describe('stopModes', () => {
  test('assigns each station the mode of the line serving it', () => {
    expect(stopModes(schedule).get('RIG')).toBe('funicular');
    expect(stopModes(schedule).get('BRIN')).toBe('metro');
  });

  test('a shared station keeps the loudest mode (metro over funicular)', () => {
    expect(stopModes(schedule).get('ZEC')).toBe('metro');
  });
});

describe('toSpecialStopsGeojson', () => {
  test('emits one point feature per station with its mode', () => {
    const fc = toSpecialStopsGeojson(schedule);
    expect(fc.features).toHaveLength(3);
    const righi = fc.features.find((f) => f.properties.id === 'RIG');
    expect(righi?.properties.mode).toBe('funicular');
    expect(righi?.geometry.coordinates).toEqual([8.94, 44.43]);
  });
});
