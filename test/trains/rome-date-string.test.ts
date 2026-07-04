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
});
