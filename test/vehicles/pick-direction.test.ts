import { describe, expect, test } from 'bun:test';
import type { BusDirection } from '../../src/lib/vehicles/bus-line-context.ts';
import { pickDirection } from '../../src/lib/vehicles/pick-direction.ts';

const direction = (dir: number, lastStopName: string): BusDirection => ({
  dir,
  stopIds: [],
  lastStopName,
  path: [],
});

describe('pickDirection', () => {
  test('exact terminus match wins', () => {
    const directions = [direction(1, 'PONTEDECIMO'), direction(2, 'CARICAMENTO')];
    expect(pickDirection(directions, 'CARICAMENTO')?.dir).toBe(2);
  });

  test('terminus containing the destination matches (substring one way)', () => {
    const directions = [
      direction(1, 'VIA PONTEDECIMO CAPOLINEA'),
      direction(2, 'CARICAMENTO'),
    ];
    expect(pickDirection(directions, 'PONTEDECIMO')?.dir).toBe(1);
  });

  test('destination containing the terminus matches (substring other way)', () => {
    const directions = [direction(1, 'BRIN'), direction(2, 'NERVI')];
    expect(pickDirection(directions, 'NERVI VIA OBERDAN')?.dir).toBe(2);
  });

  test('matching is case-insensitive and trims whitespace', () => {
    const directions = [direction(1, 'BRIN'), direction(2, 'CARICAMENTO')];
    expect(pickDirection(directions, '  caricamento ')?.dir).toBe(2);
  });

  test('no match falls back to the first direction', () => {
    const directions = [direction(1, 'BRIN'), direction(2, 'NERVI')];
    expect(pickDirection(directions, 'VOLTRI')?.dir).toBe(1);
  });

  test('empty directions yield undefined', () => {
    expect(pickDirection([], 'PONTEDECIMO')).toBeUndefined();
  });

  test('terminus-contains-destination is preferred over the reverse', () => {
    const directions = [
      direction(1, 'NER'),
      direction(2, 'NERVI CAPOLINEA'),
    ];
    expect(pickDirection(directions, 'NERVI')?.dir).toBe(2);
  });
});
