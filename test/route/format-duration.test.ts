import { describe, expect, test } from 'bun:test';
import { formatDuration } from '../../src/lib/route/format-duration.ts';

describe('formatDuration', () => {
  test('sub-minute durations round to whole minutes', () => {
    expect(formatDuration(59)).toBe('1 min');
    expect(formatDuration(0)).toBe('0 min');
  });

  test('exact and near-minute values', () => {
    expect(formatDuration(60)).toBe('1 min');
    expect(formatDuration(61)).toBe('1 min');
  });

  test('last minute before the hour threshold', () => {
    expect(formatDuration(3540)).toBe('59 min');
  });

  test('one hour pads the minute remainder', () => {
    expect(formatDuration(3600)).toBe('1 h 00');
  });

  test('an hour and a minute', () => {
    expect(formatDuration(3660)).toBe('1 h 01');
  });

  test('multiple hours', () => {
    expect(formatDuration(7260)).toBe('2 h 01');
  });
});
