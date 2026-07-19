import { describe, expect, test } from 'bun:test';
import type { Stop } from '../../src/lib/amt/types.ts';
import type { FleetTarget } from '../../src/lib/fleet/fleet-target.ts';
import { lineDiagram } from '../../src/lib/fleet/line-diagram.ts';

const stop = (id: string, name: string, lat: number, lon: number): Stop => ({
  id,
  name,
  description: '',
  lat,
  lon,
  lines: [],
  monitored: true,
});

const stops = new Map([
  ['A', stop('A', 'Alpha', 44.0, 8.0)],
  ['B', stop('B', 'Bravo', 44.1, 8.1)],
  ['C', stop('C', 'Charlie', 44.2, 8.2)],
]);

const target: FleetTarget = {
  id: 'bus:7',
  label: '7',
  templateKey: '7:0',
  template: { stops: ['A', 'B', 'C'], offsets: [0, 120, 300], lastStopName: 'Charlie' },
  road: undefined,
  targetMoment: 180,
  ageSeconds: 0,
  builtAtMs: 1000,
  anchor: [0, 0],
  dimmed: false,
};

describe('lineDiagram', () => {
  test('lists every stop name of the trip in order', () => {
    const diagram = lineDiagram(target, stops, undefined, 1000);
    expect(diagram.stops).toEqual(['Alpha', 'Bravo', 'Charlie']);
  });

  test('places the vehicle on the leg between its two current stops', () => {
    // moment 180 sits in segment B→C (offsets 120..300): a third along.
    const diagram = lineDiagram(target, stops, undefined, 1000);
    expect(diagram.at).toBe(1);
    expect(diagram.fraction).toBeCloseTo((180 - 120) / (300 - 120));
  });

  test('clamps to the last leg past the terminus', () => {
    const diagram = lineDiagram(target, stops, undefined, 400000);
    expect(diagram.at).toBe(1);
    expect(diagram.fraction).toBe(1);
  });

  test('marks the stop nearest the located user', () => {
    const diagram = lineDiagram(target, stops, { lon: 8.19, lat: 44.19 }, 1000);
    expect(diagram.meAt).toBe(2);
  });

  test('meAt is -1 when the user is unlocated', () => {
    expect(lineDiagram(target, stops, undefined, 1000).meAt).toBe(-1);
  });
});
