import { describe, expect, test } from 'bun:test';
import { itineraryLines } from '../../src/lib/route/itinerary-lines.ts';
import type { Itinerary, Leg } from '../../src/lib/route/types.ts';

const bareLeg: Leg = {
  mode: 'bus',
  from: { name: 'A', lat: 44.41, lon: 8.93 },
  to: { name: 'B', lat: 44.42, lon: 8.94 },
  startTime: '2026-07-04T09:00:00Z',
  endTime: '2026-07-04T09:10:00Z',
  durationSec: 600,
  geometry: [],
  approximated: false,
  intermediateStops: [],
};

const legOf = (mode: string, line: string): Leg => ({
  ...bareLeg,
  mode,
  line,
});

const itineraryOf = (legs: readonly Leg[]): Itinerary => ({
  legs,
  startTime: '2026-07-04T09:00:00Z',
  endTime: '2026-07-04T09:10:00Z',
  durationSec: 600,
  transfers: legs.length - 1,
});

describe('itineraryLines', () => {
  test('collects normalized labels of transit legs only', () => {
    const lines = itineraryLines(
      itineraryOf([legOf('walk', ''), legOf('bus', '009'), legOf('metro', 'MM')]),
    );
    expect(lines.size).toBe(2);
    expect(lines.has('9')).toBe(true);
    expect(lines.has('MM')).toBe(true);
    expect(lines.has('009')).toBe(false);
  });

  test('lower-case labels are upper-cased by normalization', () => {
    const lines = itineraryLines(itineraryOf([legOf('bus', '36b')]));
    expect(lines.has('36B')).toBe(true);
  });

  test('duplicate lines collapse into one entry', () => {
    const lines = itineraryLines(
      itineraryOf([legOf('bus', '9'), legOf('bus', '009')]),
    );
    expect(lines.size).toBe(1);
  });

  test('undefined itinerary yields an empty set', () => {
    expect(itineraryLines(undefined).size).toBe(0);
  });

  test('transit leg without a line contributes the empty label', () => {
    const lines = itineraryLines(itineraryOf([bareLeg]));
    expect(lines.has('')).toBe(true);
  });
});
