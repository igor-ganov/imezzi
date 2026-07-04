import { describe, expect, test } from 'bun:test';
import { groupDirections, type TripStop } from '../../scripts/gtfs/group-directions.ts';

const stopsAt = (start: string, offsetMin: number): readonly TripStop[] => {
  const startSec =
    Number(start.split(':')[0]) * 3600 + Number(start.split(':')[1]) * 60;
  const clock = (sec: number): string => {
    const h = `${Math.floor(sec / 3600)}`.padStart(2, '0');
    const m = `${Math.floor((sec % 3600) / 60)}`.padStart(2, '0');
    return `${h}:${m}:00`;
  };
  return [
    { stopId: 'A', arrival: clock(startSec), sequence: 1 },
    { stopId: 'B', arrival: clock(startSec + offsetMin * 60), sequence: 2 },
  ];
};

describe('groupDirections', () => {
  test('trips sharing a stop sequence form one direction with sorted departures', () => {
    const directions = groupDirections(
      new Map([
        ['t2', { serviceId: 'WK', stops: stopsAt('07:00', 5) }],
        ['t1', { serviceId: 'WK', stops: stopsAt('06:00', 5) }],
      ]),
    );
    expect(directions.length).toBe(1);
    expect(directions[0]?.stops).toEqual(['A', 'B']);
    expect(directions[0]?.departures).toEqual({ WK: [21600, 25200] });
  });

  test('different stop sequences produce separate directions', () => {
    const outbound: readonly TripStop[] = [
      { stopId: 'A', arrival: '06:00:00', sequence: 1 },
      { stopId: 'B', arrival: '06:05:00', sequence: 2 },
    ];
    const inbound: readonly TripStop[] = [
      { stopId: 'B', arrival: '06:10:00', sequence: 1 },
      { stopId: 'A', arrival: '06:15:00', sequence: 2 },
    ];
    const directions = groupDirections(
      new Map([
        ['t1', { serviceId: 'WK', stops: outbound }],
        ['t2', { serviceId: 'WK', stops: inbound }],
      ]),
    );
    expect(directions.length).toBe(2);
    expect(directions.map((direction) => direction.stops)).toEqual([
      ['A', 'B'],
      ['B', 'A'],
    ]);
  });

  test('offsets are seconds from the first arrival of the template trip', () => {
    const stops: readonly TripStop[] = [
      { stopId: 'A', arrival: '06:00:00', sequence: 1 },
      { stopId: 'B', arrival: '06:03:00', sequence: 2 },
      { stopId: 'C', arrival: '06:10:00', sequence: 3 },
    ];
    const directions = groupDirections(
      new Map([['t1', { serviceId: 'WK', stops }]]),
    );
    expect(directions[0]?.offsets).toEqual([0, 180, 600]);
  });

  test('stops are ordered by sequence, not input order', () => {
    const shuffled: readonly TripStop[] = [
      { stopId: 'C', arrival: '06:10:00', sequence: 3 },
      { stopId: 'A', arrival: '06:00:00', sequence: 1 },
      { stopId: 'B', arrival: '06:05:00', sequence: 2 },
    ];
    const directions = groupDirections(
      new Map([['t1', { serviceId: 'WK', stops: shuffled }]]),
    );
    expect(directions[0]?.stops).toEqual(['A', 'B', 'C']);
    expect(directions[0]?.offsets).toEqual([0, 300, 600]);
  });

  test('departures are bucketed by service id', () => {
    const directions = groupDirections(
      new Map([
        ['t1', { serviceId: 'WK', stops: stopsAt('06:00', 5) }],
        ['t2', { serviceId: 'SU', stops: stopsAt('08:00', 5) }],
      ]),
    );
    expect(directions.length).toBe(1);
    expect(directions[0]?.departures).toEqual({
      WK: [21600],
      SU: [28800],
    });
  });

  test('empty trip map yields no directions', () => {
    expect(groupDirections(new Map())).toEqual([]);
  });
});
