import { describe, expect, test } from 'bun:test';
import { prevDay } from '../../src/lib/schedule/prev-day.ts';

describe('prevDay', () => {
  test('steps back one day within a month', () => {
    expect(prevDay('20260704')).toBe('20260703');
  });

  test('crosses a month boundary into a 31-day month', () => {
    expect(prevDay('20260201')).toBe('20260131');
  });

  test('crosses a month boundary into a 30-day month', () => {
    expect(prevDay('20260501')).toBe('20260430');
  });

  test('crosses a year boundary', () => {
    expect(prevDay('20260101')).toBe('20251231');
  });

  test('lands on Feb 29 in a leap year', () => {
    expect(prevDay('20240301')).toBe('20240229');
  });

  test('lands on Feb 28 in a non-leap year', () => {
    expect(prevDay('20260301')).toBe('20260228');
  });

  test('steps off the leap day itself', () => {
    expect(prevDay('20240229')).toBe('20240228');
  });

  test('century non-leap rule: 2100-03-01 goes back to Feb 28', () => {
    expect(prevDay('21000301')).toBe('21000228');
  });

  test('400-year leap rule: 2000-03-01 goes back to Feb 29', () => {
    expect(prevDay('20000301')).toBe('20000229');
  });
});
