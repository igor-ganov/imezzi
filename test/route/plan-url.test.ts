import { describe, expect, test } from 'bun:test';
import { planUrl } from '../../src/lib/route/plan-url.ts';

describe('planUrl', () => {
  test('builds the Transitous plan URL from lat/lon pairs', () => {
    const url = planUrl(
      { name: 'Caricamento', lat: 44.41, lon: 8.93 },
      { name: 'Brignole', lat: 44.4, lon: 8.94 },
      3,
    );
    expect(url).toBe(
      'https://api.transitous.org/api/v1/plan' +
        '?fromPlace=44.41,8.93&toPlace=44.4,8.94&numItineraries=3',
    );
  });

  test('negative coordinates pass through unchanged', () => {
    const url = planUrl(
      { name: 'A', lat: -1.5, lon: -2.25 },
      { name: 'B', lat: 0, lon: 0 },
      1,
    );
    expect(url).toContain('fromPlace=-1.5,-2.25');
    expect(url).toContain('toPlace=0,0');
    expect(url).toContain('numItineraries=1');
  });
});
