import { describe, expect, test } from 'bun:test';
import { romeDateString } from '../../src/lib/trains/rome-date-string.ts';

describe('romeDateString', () => {
  test('formats summer date in CEST (+0200)', () => {
    const formatted = romeDateString(new Date('2026-07-04T10:30:00Z'));
    expect(formatted).toBe('Sat Jul 04 2026 12:30:00 GMT+0200');
  });

  test('formats winter date in CET (+0100)', () => {
    const formatted = romeDateString(new Date('2026-01-15T10:30:00Z'));
    expect(formatted).toBe('Thu Jan 15 2026 11:30:00 GMT+0100');
  });

  test('last CET minute before the spring-forward jump', () => {
    const formatted = romeDateString(new Date('2026-03-29T00:59:00Z'));
    expect(formatted).toBe('Sun Mar 29 2026 01:59:00 GMT+0100');
  });

  test('spring-forward skips 02:xx and lands on 03:00 CEST', () => {
    const formatted = romeDateString(new Date('2026-03-29T01:00:00Z'));
    expect(formatted).toBe('Sun Mar 29 2026 03:00:00 GMT+0200');
  });

  test('last CEST minute before the autumn fall-back', () => {
    const formatted = romeDateString(new Date('2026-10-25T00:59:00Z'));
    expect(formatted).toBe('Sun Oct 25 2026 02:59:00 GMT+0200');
  });

  test('fall-back repeats 02:00, now in CET', () => {
    const formatted = romeDateString(new Date('2026-10-25T01:00:00Z'));
    expect(formatted).toBe('Sun Oct 25 2026 02:00:00 GMT+0100');
  });
});
