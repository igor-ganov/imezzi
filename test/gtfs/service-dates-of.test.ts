import { describe, expect, test } from 'bun:test';
import { serviceDatesOf } from '../../scripts/gtfs/service-dates-of.ts';

describe('serviceDatesOf', () => {
  test('groups added dates by service id', () => {
    const services = serviceDatesOf([
      { service_id: 'WK', date: '20260704', exception_type: '1' },
      { service_id: 'WK', date: '20260705', exception_type: '1' },
      { service_id: 'SU', date: '20260705', exception_type: '1' },
    ]);
    expect(services.get('WK')).toEqual(['20260704', '20260705']);
    expect(services.get('SU')).toEqual(['20260705']);
  });

  test('removed dates (exception_type 2) are ignored', () => {
    const services = serviceDatesOf([
      { service_id: 'WK', date: '20260704', exception_type: '1' },
      { service_id: 'WK', date: '20260706', exception_type: '2' },
    ]);
    expect(services.get('WK')).toEqual(['20260704']);
  });

  test('a service with only removals never appears', () => {
    const services = serviceDatesOf([
      { service_id: 'HO', date: '20260706', exception_type: '2' },
    ]);
    expect(services.has('HO')).toBe(false);
    expect(services.size).toBe(0);
  });

  test('empty input yields an empty map', () => {
    expect(serviceDatesOf([]).size).toBe(0);
  });
});
