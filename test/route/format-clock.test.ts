import { describe, expect, test } from 'bun:test';
import { formatClock } from '../../src/lib/route/format-clock.ts';

describe('formatClock', () => {
  test('summer instant renders in Rome CEST (+2)', () => {
    expect(formatClock('2026-07-04T10:30:00Z')).toBe('12:30');
  });

  test('winter instant renders in Rome CET (+1)', () => {
    expect(formatClock('2026-01-15T10:30:00Z')).toBe('11:30');
  });

  test('UTC midnight rolls into the next Rome hour', () => {
    expect(formatClock('2026-01-15T23:30:00Z')).toBe('00:30');
  });
});
