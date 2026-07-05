import { describe, expect, test } from 'bun:test';
import { routes } from '../../worker/routes.ts';

const NEVER = /$^/;

const patternAt = (index: number): RegExp => routes[index]?.pattern ?? NEVER;

const arrivals = patternAt(0);
const batch = patternAt(1);
const staticData = patternAt(2);
const geometry = patternAt(3);
const trains = patternAt(4);

describe('routes table', () => {
  test('declares the five API routes', () => {
    expect(routes.length).toBe(5);
  });
});

describe('arrivals batch route', () => {
  test('matches 1..40 comma-separated numeric ids', () => {
    expect(batch.test('/api/arrivals-batch/0001')).toBe(true);
    expect(batch.test('/api/arrivals-batch/1,2,3')).toBe(true);
    const forty = Array.from({ length: 40 }, (_, i) => `${i + 1}`).join(',');
    expect(batch.test(`/api/arrivals-batch/${forty}`)).toBe(true);
  });

  test('rejects over-long lists and malformed ids', () => {
    const fortyOne = Array.from({ length: 41 }, (_, i) => `${i + 1}`).join(',');
    expect(batch.test(`/api/arrivals-batch/${fortyOne}`)).toBe(false);
    expect(batch.test('/api/arrivals-batch/')).toBe(false);
    expect(batch.test('/api/arrivals-batch/1,,2')).toBe(false);
    expect(batch.test('/api/arrivals-batch/1,abc')).toBe(false);
    expect(batch.test('/api/arrivals-batch/1234567')).toBe(false);
  });

  test('captures the whole id list', () => {
    expect(batch.exec('/api/arrivals-batch/1,2')?.[1]).toBe('1,2');
  });
});

describe('arrivals route', () => {
  test('matches numeric stop ids up to six digits', () => {
    expect(arrivals.test('/api/arrivals/1')).toBe(true);
    expect(arrivals.test('/api/arrivals/0001')).toBe(true);
    expect(arrivals.test('/api/arrivals/123456')).toBe(true);
  });

  test('captures the stop id', () => {
    expect(arrivals.exec('/api/arrivals/0001')?.[1]).toBe('0001');
  });

  test('rejects non-numeric, empty and oversized ids', () => {
    expect(arrivals.test('/api/arrivals/abc')).toBe(false);
    expect(arrivals.test('/api/arrivals/')).toBe(false);
    expect(arrivals.test('/api/arrivals/1234567')).toBe(false);
    expect(arrivals.test('/api/arrivals/0001/extra')).toBe(false);
  });
});

describe('static data route', () => {
  test('matches exactly the three dataset names', () => {
    expect(staticData.test('/api/stops')).toBe(true);
    expect(staticData.test('/api/lines')).toBe(true);
    expect(staticData.test('/api/line-stops')).toBe(true);
  });

  test('captures the dataset name', () => {
    expect(staticData.exec('/api/line-stops')?.[1]).toBe('line-stops');
  });

  test('rejects unknown datasets', () => {
    expect(staticData.test('/api/stop')).toBe(false);
    expect(staticData.test('/api/lines-stops')).toBe(false);
    expect(staticData.test('/api/stops/1')).toBe(false);
  });
});

describe('geometry route', () => {
  test('matches line codes with either direction', () => {
    expect(geometry.test('/api/geometry/009-00/1')).toBe(true);
    expect(geometry.test('/api/geometry/MM/2')).toBe(true);
  });

  test('captures code and direction', () => {
    const match = geometry.exec('/api/geometry/009-00/2');
    expect(match?.[1]).toBe('009-00');
    expect(match?.[2]).toBe('2');
  });

  test('rejects invalid directions and codes', () => {
    expect(geometry.test('/api/geometry/001/3')).toBe(false);
    expect(geometry.test('/api/geometry/001/0')).toBe(false);
    expect(geometry.test('/api/geometry//1')).toBe(false);
    expect(geometry.test('/api/geometry/123456789/1')).toBe(false);
    expect(geometry.test('/api/geometry/00_1/1')).toBe(false);
  });
});

describe('trains route', () => {
  test('matches both boards with an S-prefixed station', () => {
    expect(trains.test('/api/trains/partenze/S04700')).toBe(true);
    expect(trains.test('/api/trains/arrivi/S04702')).toBe(true);
  });

  test('captures board and station', () => {
    const match = trains.exec('/api/trains/partenze/S04700');
    expect(match?.[1]).toBe('partenze');
    expect(match?.[2]).toBe('S04700');
  });

  test('rejects foreign prefixes, boards and lengths', () => {
    expect(trains.test('/api/trains/partenze/X04700')).toBe(false);
    expect(trains.test('/api/trains/departures/S04700')).toBe(false);
    expect(trains.test('/api/trains/partenze/S0470')).toBe(false);
    expect(trains.test('/api/trains/partenze/S047000')).toBe(false);
  });
});
