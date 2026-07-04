import { describe, expect, test } from 'bun:test';
import type { BusLineContext } from '../../src/lib/vehicles/bus-line-context.ts';
import { inferBusVehicles } from '../../src/lib/vehicles/infer-bus-vehicles.ts';
import { nearestPathIndex } from '../../src/lib/vehicles/nearest-path-index.ts';
import { pickDirection } from '../../src/lib/vehicles/pick-direction.ts';

const context: BusLineContext = {
  key: '009-00',
  label: '9',
  directions: [
    {
      dir: 1,
      stopIds: ['A', 'B', 'C'],
      lastStopName: 'PONTEDECIMO',
      path: [
        [8.0, 44.0],
        [8.05, 44.05],
        [8.1, 44.1],
        [8.2, 44.2],
      ],
    },
    {
      dir: 2,
      stopIds: ['C', 'B', 'A'],
      lastStopName: 'CARICAMENTO',
      path: [],
    },
  ],
  stopCoords: { A: [8.0, 44.0], B: [8.1, 44.1], C: [8.2, 44.2] },
  monitoredStopIds: ['A', 'B', 'C'],
};

const row = (over: Partial<Parameters<typeof inferBusVehicles>[1][number]['row']>) => ({
  line: '009',
  destination: 'PONTEDECIMO',
  theoretical: false,
  arrivalTime: '',
  countdown: "2'",
  vehicle: '09301',
  full: false,
  ...over,
});

describe('inferBusVehicles', () => {
  test('places a vehicle before its soonest predicted stop', () => {
    const views = inferBusVehicles(
      context,
      [
        { stopId: 'B', row: row({ countdown: "1'" }) },
        { stopId: 'C', row: row({ countdown: "4'" }) },
      ],
      0,
    );
    expect(views.length).toBe(1);
    expect(views[0]?.lineKey).toBe('009-00');
    expect(views[0]?.lat).toBeCloseTo(44.05, 1);
    expect(views[0]?.approximated).toBe(false);
  });

  test('ignores rows of other lines', () => {
    const views = inferBusVehicles(
      context,
      [{ stopId: 'B', row: row({ line: '018' }) }],
      0,
    );
    expect(views).toEqual([]);
  });

  test('one vehicle per NumeroSociale across stops', () => {
    const views = inferBusVehicles(
      context,
      [
        { stopId: 'A', row: row({ countdown: "1'" }) },
        { stopId: 'B', row: row({ countdown: "3'" }) },
        { stopId: 'C', row: row({ countdown: "6'" }) },
      ],
      0,
    );
    expect(views.length).toBe(1);
  });

  test('ignores rows with an empty NumeroSociale', () => {
    const views = inferBusVehicles(
      context,
      [{ stopId: 'B', row: row({ vehicle: '' }) }],
      0,
    );
    expect(views).toEqual([]);
  });

  test('unknown stop id yields no vehicle', () => {
    const views = inferBusVehicles(
      context,
      [{ stopId: 'Z', row: row({}) }],
      0,
    );
    expect(views).toEqual([]);
  });

  test('theoretical predictions mark the vehicle approximated', () => {
    const views = inferBusVehicles(
      context,
      [{ stopId: 'B', row: row({ theoretical: true }) }],
      0,
    );
    expect(views.length).toBe(1);
    expect(views[0]?.approximated).toBe(true);
  });

  test('direction without a path interpolates the straight segment', () => {
    const views = inferBusVehicles(
      context,
      [
        {
          stopId: 'B',
          row: row({ destination: 'CARICAMENTO', countdown: "1'" }),
        },
      ],
      0,
    );
    expect(views.length).toBe(1);
    expect(views[0]?.lon).toBeCloseTo(8.15, 10);
    expect(views[0]?.lat).toBeCloseTo(44.15, 10);
  });

  test('zero countdown places the vehicle at the predicted stop', () => {
    const views = inferBusVehicles(
      context,
      [
        {
          stopId: 'B',
          row: row({ destination: 'CARICAMENTO', countdown: "0'" }),
        },
      ],
      0,
    );
    expect(views[0]?.lon).toBeCloseTo(8.1, 10);
    expect(views[0]?.lat).toBeCloseTo(44.1, 10);
  });

  test('separate NumeroSociale values become separate vehicles', () => {
    const views = inferBusVehicles(
      context,
      [
        { stopId: 'B', row: row({ vehicle: '09301' }) },
        { stopId: 'C', row: row({ vehicle: '09302' }) },
      ],
      0,
    );
    expect(views.map((view) => view.id).sort()).toEqual([
      '009-00:09301',
      '009-00:09302',
    ]);
  });

  test('matches padded SIMON codes against the UI label', () => {
    const views = inferBusVehicles(
      context,
      [{ stopId: 'B', row: row({ line: '9' }) }],
      0,
    );
    expect(views.length).toBe(1);
  });
});

describe('pickDirection', () => {
  test('matches announced destination to a terminus', () => {
    expect(pickDirection(context.directions, 'PONTEDECIMO')?.dir).toBe(1);
    expect(pickDirection(context.directions, 'CARICAMENTO')?.dir).toBe(2);
  });
});

describe('nearestPathIndex', () => {
  test('finds the closest polyline point', () => {
    const path = context.directions[0]?.path ?? [];
    expect(nearestPathIndex(path, [8.09, 44.09])).toBe(2);
  });
});
