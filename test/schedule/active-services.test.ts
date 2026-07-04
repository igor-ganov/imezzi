import { describe, expect, test } from 'bun:test';
import { activeServices } from '../../src/lib/schedule/active-services.ts';
import type { Schedule } from '../../src/lib/schedule/types.ts';

const schedule: Schedule = {
  lines: [],
  serviceDates: {
    WEEK: ['20260703', '20260704'],
    SAT: ['20260704'],
    SUN: ['20260705'],
    NEVER: [],
  },
  stops: {},
};

describe('activeServices', () => {
  test('collects every service running on the day', () => {
    expect(activeServices(schedule, '20260704')).toEqual(
      new Set(['WEEK', 'SAT']),
    );
  });

  test('returns a single service when only one matches', () => {
    expect(activeServices(schedule, '20260705')).toEqual(new Set(['SUN']));
  });

  test('returns nothing on an unlisted day', () => {
    expect(activeServices(schedule, '20260801')).toEqual(new Set());
  });

  test('a service with no dates is never active', () => {
    expect(activeServices(schedule, '20260704').has('NEVER')).toBe(false);
  });

  test('empty serviceDates yields an empty set', () => {
    expect(activeServices({ ...schedule, serviceDates: {} }, '20260704')).toEqual(
      new Set(),
    );
  });
});
