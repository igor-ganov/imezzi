import { describe, expect, test } from 'bun:test';
import { romeClock } from '../../src/lib/schedule/rome-clock.ts';

describe('romeClock', () => {
  test('converts a summer UTC instant to Rome CEST (+2)', () => {
    const clock = romeClock(new Date(Date.UTC(2026, 6, 4, 10, 0, 0)));
    expect(clock).toEqual({ day: '20260704', seconds: 12 * 3600 });
  });

  test('converts a winter UTC instant to Rome CET (+1)', () => {
    const clock = romeClock(new Date(Date.UTC(2026, 0, 15, 10, 30, 45)));
    expect(clock).toEqual({
      day: '20260115',
      seconds: 11 * 3600 + 30 * 60 + 45,
    });
  });

  test('rolls the service date at Rome midnight, not UTC midnight', () => {
    const clock = romeClock(new Date(Date.UTC(2026, 6, 3, 22, 30, 0)));
    expect(clock).toEqual({ day: '20260704', seconds: 30 * 60 });
  });

  test('reports midnight as second 0 of the new day (hour % 24 guard)', () => {
    const clock = romeClock(new Date(Date.UTC(2026, 6, 3, 22, 0, 0)));
    expect(clock.day).toBe('20260704');
    expect(clock.seconds).toBe(0);
  });

  test('one second before Rome midnight still belongs to the old day', () => {
    const clock = romeClock(new Date(Date.UTC(2026, 6, 3, 21, 59, 59)));
    expect(clock).toEqual({ day: '20260703', seconds: 86399 });
  });

  test('spring forward 2026-03-29: 02:00-03:00 CET does not exist', () => {
    const before = romeClock(new Date(Date.UTC(2026, 2, 29, 0, 59, 59)));
    const after = romeClock(new Date(Date.UTC(2026, 2, 29, 1, 0, 0)));
    expect(before).toEqual({ day: '20260329', seconds: 3600 + 59 * 60 + 59 });
    expect(after).toEqual({ day: '20260329', seconds: 3 * 3600 });
  });

  test('fall back 2026-10-25: 02:30 wall-clock happens twice', () => {
    const first = romeClock(new Date(Date.UTC(2026, 9, 25, 0, 30, 0)));
    const second = romeClock(new Date(Date.UTC(2026, 9, 25, 1, 30, 0)));
    expect(first).toEqual({ day: '20261025', seconds: 2 * 3600 + 30 * 60 });
    expect(second).toEqual({ day: '20261025', seconds: 2 * 3600 + 30 * 60 });
  });
});
