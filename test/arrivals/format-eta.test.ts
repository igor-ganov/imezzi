import { describe, expect, test } from 'bun:test';
import { formatEta } from '../../src/lib/arrivals/format-eta.ts';

describe('formatEta', () => {
  test('0 seconds is now', () => {
    expect(formatEta(0)).toBe('now');
  });

  test('44 seconds is still now', () => {
    expect(formatEta(44)).toBe('now');
  });

  test('45 seconds rounds up to 1 min', () => {
    expect(formatEta(45)).toBe('1 min');
  });

  test('60 seconds is 1 min', () => {
    expect(formatEta(60)).toBe('1 min');
  });

  test('minutes are rounded to the nearest whole minute', () => {
    expect(formatEta(150)).toBe('3 min');
    expect(formatEta(149)).toBe('2 min');
  });

  test('89 minutes stays in minutes', () => {
    expect(formatEta(89 * 60)).toBe('89 min');
  });

  test('89.5 minutes rounds up into hours', () => {
    expect(formatEta(89 * 60 + 30)).toBe('1.5 h');
  });

  test('90 minutes switches to fractional hours', () => {
    expect(formatEta(90 * 60)).toBe('1.5 h');
  });

  test('100 minutes rounds to one decimal of an hour', () => {
    expect(formatEta(100 * 60)).toBe('1.7 h');
  });

  test('whole hours drop the decimal', () => {
    expect(formatEta(2 * 3600)).toBe('2 h');
  });

  test('big values stay in hours', () => {
    expect(formatEta(10 * 3600)).toBe('10 h');
    expect(formatEta(25 * 3600)).toBe('25 h');
  });
});
