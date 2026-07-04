import { describe, expect, test } from 'bun:test';
import { toSeconds } from '../../scripts/gtfs/to-seconds.ts';

describe('toSeconds', () => {
  test('parses a standard time of day', () => {
    expect(toSeconds('08:30:15')).toBe(30615);
  });

  test('handles service-day times past midnight (>24 h)', () => {
    expect(toSeconds('25:10:00')).toBe(90600);
  });

  test('accepts un-padded components', () => {
    expect(toSeconds('0:0:0')).toBe(0);
    expect(toSeconds('6:5:4')).toBe(21904);
  });

  test('24:00:00 is exactly one service day', () => {
    expect(toSeconds('24:00:00')).toBe(86400);
  });

  test('missing components count as zero', () => {
    expect(toSeconds('6')).toBe(21600);
    expect(toSeconds('')).toBe(0);
  });
});
