import { describe, expect, test } from 'bun:test';
import { dedupeVehicles } from '../../src/lib/vehicles/dedupe-vehicles.ts';
import {
  pruneSnapshots,
  type LiveSnapshot,
} from '../../src/lib/vehicles/live-snapshot.ts';
import type { VehicleView } from '../../src/lib/vehicles/types.ts';

const snapshot = (fetchedAtSeconds: number): LiveSnapshot => ({
  context: {
    key: '001-00',
    label: '1',
    directions: [],
    stopCoords: {},
    monitoredStopIds: [],
  },
  arrivals: [],
  fetchedAtSeconds,
});

describe('pruneSnapshots', () => {
  test('keeps snapshots inside the TTL, drops older ones', () => {
    const kept = pruneSnapshots(
      [snapshot(1000), snapshot(1060), snapshot(1085)],
      1100,
      90,
    );
    expect(kept.map((entry) => entry.fetchedAtSeconds)).toEqual([1060, 1085]);
  });

  test('a snapshot exactly at the TTL boundary survives', () => {
    expect(pruneSnapshots([snapshot(1010)], 1100, 90).length).toBe(1);
  });

  test('handles the midnight wrap of day-seconds', () => {
    const kept = pruneSnapshots([snapshot(86370)], 30, 90);
    expect(kept.length).toBe(1);
  });

  test('empty input stays empty', () => {
    expect(pruneSnapshots([], 500, 90)).toEqual([]);
  });
});

const view = (id: string, lat: number): VehicleView => ({
  id,
  label: '1',
  mode: 'bus',
  lineKey: '001-00',
  lat,
  lon: 8.9,
  approximated: false,
});

describe('dedupeVehicles', () => {
  test('later sightings of the same vehicle win', () => {
    const views = dedupeVehicles([
      view('001-00:09001', 44.1),
      view('001-00:09002', 44.2),
      view('001-00:09001', 44.15),
    ]);
    expect(views.length).toBe(2);
    expect(views.find((entry) => entry.id === '001-00:09001')?.lat).toBe(
      44.15,
    );
  });

  test('distinct vehicles all survive', () => {
    const views = dedupeVehicles([view('a', 1), view('b', 2), view('c', 3)]);
    expect(views.map((entry) => entry.id)).toEqual(['a', 'b', 'c']);
  });

  test('empty input stays empty', () => {
    expect(dedupeVehicles([])).toEqual([]);
  });
});
