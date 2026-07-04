import { describe, expect, test } from 'bun:test';
import { bestSighting } from '../../src/lib/vehicles/best-sighting.ts';
import type { StopArrival } from '../../src/lib/vehicles/stop-arrival.ts';

const sighting = (stopId: string, countdown: string): StopArrival => ({
  stopId,
  row: {
    line: '9',
    destination: 'PONTEDECIMO',
    theoretical: false,
    arrivalTime: '',
    countdown,
    vehicle: '09301',
    full: false,
  },
});

describe('bestSighting', () => {
  test('a single sighting is returned as-is', () => {
    const only = sighting('A', "7'");
    expect(bestSighting([only], 0)).toBe(only);
  });

  test('picks the sighting with the soonest countdown', () => {
    const best = bestSighting(
      [sighting('A', "5'"), sighting('B', "2'"), sighting('C', "9'")],
      0,
    );
    expect(best.stopId).toBe('B');
  });

  test('ties resolve to the earliest sighting in the list', () => {
    const best = bestSighting(
      [sighting('A', "3'"), sighting('B', "3'"), sighting('C', "3'")],
      0,
    );
    expect(best.stopId).toBe('A');
  });

  test('compares minute countdowns against clock times', () => {
    const best = bestSighting(
      [sighting('A', '00:30'), sighting('B', "1'")],
      0,
    );
    expect(best.stopId).toBe('B');
  });

  test('an arriving-now text beats every countdown', () => {
    const best = bestSighting(
      [sighting('A', "1'"), sighting('B', 'IN ARRIVO')],
      0,
    );
    expect(best.stopId).toBe('B');
  });
});
