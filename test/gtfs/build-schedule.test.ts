import { describe, expect, test } from 'bun:test';
import { buildSchedule } from '../../scripts/gtfs/build-schedule.ts';

const routes = [
  {
    route_id: 'MM',
    route_short_name: 'MM',
    route_long_name: 'Metropolitana',
    route_type: '1',
  },
  { route_id: 'B9', route_short_name: '9', route_long_name: 'Bus 9', route_type: '3' },
  { route_id: 'AC', route_short_name: 'AC', route_long_name: 'Ascensore', route_type: '' },
];

const trips = [
  { route_id: 'MM', trip_id: 'm1', service_id: 'WK' },
  { route_id: 'MM', trip_id: 'm2', service_id: 'WK' },
  { route_id: 'B9', trip_id: 'b1', service_id: 'WK' },
  { route_id: 'AC', trip_id: 'a1', service_id: 'SU' },
];

const stopTimes = [
  { trip_id: 'm1', stop_id: 'BRIN', arrival_time: '06:00:00', stop_sequence: '1' },
  { trip_id: 'm1', stop_id: 'DEFE', arrival_time: '06:07:00', stop_sequence: '2' },
  { trip_id: 'm2', stop_id: 'BRIN', arrival_time: '06:10:00', stop_sequence: '1' },
  { trip_id: 'm2', stop_id: 'DEFE', arrival_time: '06:17:00', stop_sequence: '2' },
  { trip_id: 'b1', stop_id: 'CARI', arrival_time: '06:00:00', stop_sequence: '1' },
  { trip_id: 'a1', stop_id: 'PORT', arrival_time: '07:00:00', stop_sequence: '1' },
];

const calendarDates = [
  { service_id: 'WK', date: '20260704', exception_type: '1' },
  { service_id: 'WK', date: '20260705', exception_type: '1' },
  { service_id: 'WK', date: '20260706', exception_type: '2' },
  { service_id: 'SU', date: '20260705', exception_type: '1' },
];

describe('buildSchedule', () => {
  const schedule = buildSchedule(routes, trips, stopTimes, calendarDates);

  test('excludes bus routes (route_type 3)', () => {
    expect(schedule.lines.map((line) => line.id)).toEqual(['MM', 'AC']);
  });

  test('maps route metadata and mode', () => {
    expect(schedule.lines[0]?.shortName).toBe('MM');
    expect(schedule.lines[0]?.longName).toBe('Metropolitana');
    expect(schedule.lines[0]?.mode).toBe('metro');
    expect(schedule.lines[1]?.mode).toBe('lift');
  });

  test('groups the metro trips into one direction with both departures', () => {
    const directions = schedule.lines[0]?.directions ?? [];
    expect(directions.length).toBe(1);
    expect(directions[0]?.stops).toEqual(['BRIN', 'DEFE']);
    expect(directions[0]?.offsets).toEqual([0, 420]);
    expect(directions[0]?.departures).toEqual({ WK: [21600, 22200] });
  });

  test('elevator line keeps its own direction and service', () => {
    const directions = schedule.lines[1]?.directions ?? [];
    expect(directions[0]?.stops).toEqual(['PORT']);
    expect(directions[0]?.departures).toEqual({ SU: [25200] });
  });

  test('service dates keep only added exceptions', () => {
    expect(schedule.serviceDates).toEqual({
      WK: ['20260704', '20260705'],
      SU: ['20260705'],
    });
  });
});
