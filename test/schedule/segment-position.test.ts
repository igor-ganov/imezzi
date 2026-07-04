import { describe, expect, test } from 'bun:test';
import { segmentPosition } from '../../src/lib/schedule/segment-position.ts';
import type { ScheduleStop } from '../../src/lib/schedule/types.ts';

const stop = (lat: number, lon: number): ScheduleStop => ({
  name: `${lat},${lon}`,
  lat,
  lon,
});

const stops = [stop(44.0, 8.0), stop(44.2, 8.2), stop(44.6, 8.6)];
const offsets = [0, 100, 300];

describe('segmentPosition', () => {
  test('before trip start returns undefined', () => {
    expect(segmentPosition(stops, offsets, -1)).toBeUndefined();
  });

  test('after trip end returns undefined', () => {
    expect(segmentPosition(stops, offsets, 301)).toBeUndefined();
  });

  test('exactly at trip start sits on the first stop', () => {
    expect(segmentPosition(stops, offsets, 0)).toEqual({ lat: 44.0, lon: 8.0 });
  });

  test('exactly at an intermediate offset sits on that stop', () => {
    expect(segmentPosition(stops, offsets, 100)).toEqual({
      lat: 44.2,
      lon: 8.2,
    });
  });

  test('exactly at the final offset sits on the last stop', () => {
    expect(segmentPosition(stops, offsets, 300)).toEqual({
      lat: 44.6,
      lon: 8.6,
    });
  });

  test('interpolates halfway through the first segment', () => {
    const position = segmentPosition(stops, offsets, 50);
    expect(position?.lat).toBeCloseTo(44.1);
    expect(position?.lon).toBeCloseTo(8.1);
  });

  test('interpolates within a later segment', () => {
    const position = segmentPosition(stops, offsets, 200);
    expect(position?.lat).toBeCloseTo(44.4);
    expect(position?.lon).toBeCloseTo(8.4);
  });

  test('missing coords of the segment start stop → undefined', () => {
    expect(
      segmentPosition([undefined, stops[1], stops[2]], offsets, 50),
    ).toBeUndefined();
  });

  test('missing coords of the segment end stop → undefined', () => {
    expect(
      segmentPosition([stops[0], undefined, stops[2]], offsets, 50),
    ).toBeUndefined();
  });

  test('segments away from the missing stop still resolve', () => {
    const position = segmentPosition(
      [undefined, stops[1], stops[2]],
      offsets,
      200,
    );
    expect(position?.lat).toBeCloseTo(44.4);
  });

  test('single-stop direction has no segment → undefined', () => {
    expect(segmentPosition([stops[0]], [0], 0)).toBeUndefined();
  });

  test('empty direction → undefined', () => {
    expect(segmentPosition([], [], 0)).toBeUndefined();
  });
});
