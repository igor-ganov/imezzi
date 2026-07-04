import { describe, expect, test } from 'bun:test';
import type { Arrival } from '../../src/lib/amt/types.ts';
import { decodePolyline } from '../../src/lib/route/decode-polyline.ts';
import { enrichLeg } from '../../src/lib/route/enrich-leg.ts';
import { mapItinerary } from '../../src/lib/route/map-itinerary.ts';
import { motisMode } from '../../src/lib/route/motis-mode.ts';
import type { Leg } from '../../src/lib/route/types.ts';

describe('decodePolyline', () => {
  test('decodes the canonical Google example (precision 5)', () => {
    const points = decodePolyline('_p~iF~ps|U_ulLnnqC_mqNvxq`@', 5);
    expect(points.length).toBe(3);
    expect(points[0]?.[1]).toBeCloseTo(38.5);
    expect(points[0]?.[0]).toBeCloseTo(-120.2);
    expect(points[2]?.[1]).toBeCloseTo(43.252);
  });

  test('empty string decodes to nothing', () => {
    expect(decodePolyline('', 7)).toEqual([]);
  });

  test('decodes a hand-encoded precision-7 pair of Genoa points', () => {
    const points = decodePolyline('o{h_nY_b_liDofoF~}zS', 7);
    expect(points.length).toBe(2);
    expect(points[0]?.[0]).toBeCloseTo(8.9342, 7);
    expect(points[0]?.[1]).toBeCloseTo(44.4077, 7);
    expect(points[1]?.[0]).toBeCloseTo(8.9, 7);
    expect(points[1]?.[1]).toBeCloseTo(44.42, 7);
  });

  test('decodes a single-point string', () => {
    expect(decodePolyline('_p~iF~ps|U', 5)).toEqual([[-120.2, 38.5]]);
  });
});

describe('motisMode', () => {
  test('maps transit families to mode tokens', () => {
    expect(motisMode('SUBWAY')).toBe('metro');
    expect(motisMode('REGIONAL_RAIL')).toBe('train');
    expect(motisMode('WALK')).toBe('walk');
    expect(motisMode('BUS')).toBe('bus');
  });

  test('covers every named branch', () => {
    expect(motisMode('METRO')).toBe('metro');
    expect(motisMode('RAIL')).toBe('train');
    expect(motisMode('HIGHSPEED_RAIL')).toBe('train');
    expect(motisMode('LONG_DISTANCE')).toBe('train');
    expect(motisMode('REGIONAL_FAST_RAIL')).toBe('train');
    expect(motisMode('FUNICULAR')).toBe('funicular');
    expect(motisMode('FERRY')).toBe('boat');
  });

  test('unknown and empty modes default to bus', () => {
    expect(motisMode('TRAM')).toBe('bus');
    expect(motisMode('')).toBe('bus');
  });
});

describe('mapItinerary', () => {
  test('flags non-realtime transit legs with ⚠ and strips stop ids', () => {
    const itinerary = mapItinerary({
      duration: 600,
      startTime: '2026-07-04T09:00:00Z',
      endTime: '2026-07-04T09:10:00Z',
      transfers: 0,
      legs: [
        {
          mode: 'SUBWAY',
          from: {
            name: 'DE FERRARI',
            stopId: 'it-Liguria-Genova_MM06',
            lat: 44.4077,
            lon: 8.9342,
          },
          to: { name: 'BRIN', stopId: 'it-Liguria-Genova_MM01', lat: 44.42, lon: 8.9 },
          startTime: '2026-07-04T09:00:00Z',
          endTime: '2026-07-04T09:10:00Z',
          duration: 600,
          realTime: false,
          routeShortName: 'MM',
          legGeometry: { points: '_p~iF~ps|U_ulLnnqC', precision: 5 },
        },
      ],
    });
    expect(itinerary.legs[0]?.approximated).toBe(true);
    expect(itinerary.legs[0]?.from.stopId).toBe('MM06');
    expect(itinerary.legs[0]?.geometry.length).toBe(2);
  });

  test('walk legs are never approximated even without realtime', () => {
    const itinerary = mapItinerary({
      duration: 300,
      startTime: '2026-07-04T09:00:00Z',
      endTime: '2026-07-04T09:05:00Z',
      transfers: 0,
      legs: [
        {
          mode: 'WALK',
          from: { name: 'A', lat: 44.41, lon: 8.93 },
          to: { name: 'B', lat: 44.42, lon: 8.94 },
          startTime: '2026-07-04T09:00:00Z',
          endTime: '2026-07-04T09:05:00Z',
          duration: 300,
          realTime: false,
          legGeometry: { points: '', precision: 7 },
        },
      ],
    });
    expect(itinerary.legs[0]?.approximated).toBe(false);
  });

  test('realtime transit legs are not approximated', () => {
    const itinerary = mapItinerary({
      duration: 600,
      startTime: '2026-07-04T09:00:00Z',
      endTime: '2026-07-04T09:10:00Z',
      transfers: 0,
      legs: [
        {
          mode: 'BUS',
          from: { name: 'A', lat: 44.41, lon: 8.93 },
          to: { name: 'B', lat: 44.42, lon: 8.94 },
          startTime: '2026-07-04T09:00:00Z',
          endTime: '2026-07-04T09:10:00Z',
          duration: 600,
          realTime: true,
          routeShortName: '9',
          legGeometry: { points: '', precision: 7 },
        },
      ],
    });
    expect(itinerary.legs[0]?.approximated).toBe(false);
  });

  test('missing optional fields default to empty values', () => {
    const itinerary = mapItinerary({
      duration: 600,
      startTime: '2026-07-04T09:00:00Z',
      endTime: '2026-07-04T09:10:00Z',
      transfers: 1,
      legs: [
        {
          mode: 'BUS',
          from: { name: 'A', lat: 44.41, lon: 8.93 },
          to: { name: 'B', lat: 44.42, lon: 8.94 },
          startTime: '2026-07-04T09:00:00Z',
          endTime: '2026-07-04T09:10:00Z',
          duration: 600,
          realTime: false,
          legGeometry: { points: '', precision: 7 },
        },
      ],
    });
    const first = itinerary.legs[0];
    expect(first?.line).toBe('');
    expect(first?.headsign).toBe('');
    expect(first?.from.stopId).toBe('');
    expect(first?.to.stopId).toBe('');
    expect(first?.intermediateStops).toEqual([]);
    expect(itinerary.transfers).toBe(1);
    expect(itinerary.durationSec).toBe(600);
  });

  test('maps intermediate stops and un-prefixed stop ids', () => {
    const itinerary = mapItinerary({
      duration: 600,
      startTime: '2026-07-04T09:00:00Z',
      endTime: '2026-07-04T09:10:00Z',
      transfers: 0,
      legs: [
        {
          mode: 'BUS',
          from: { name: 'A', lat: 44.41, lon: 8.93, stopId: 'MM06' },
          to: { name: 'B', lat: 44.42, lon: 8.94 },
          startTime: '2026-07-04T09:00:00Z',
          endTime: '2026-07-04T09:10:00Z',
          duration: 600,
          realTime: false,
          legGeometry: { points: '', precision: 7 },
          intermediateStops: [
            { name: 'MID', lat: 44.415, lon: 8.935, stopId: 'it-Liguria-Genova_0042' },
          ],
        },
      ],
    });
    expect(itinerary.legs[0]?.from.stopId).toBe('MM06');
    expect(itinerary.legs[0]?.intermediateStops).toEqual([
      { name: 'MID', lat: 44.415, lon: 8.935, stopId: '0042' },
    ]);
  });
});

const arrival = (line: string, countdown: string): Arrival => ({
  line,
  destination: 'PONTEDECIMO',
  theoretical: false,
  arrivalTime: '',
  countdown,
  vehicle: '09301',
  full: false,
});

const leg: Leg = {
  mode: 'bus',
  line: '9',
  headsign: 'PONTEDECIMO',
  from: { name: 'CARICAMENTO', lat: 44.41, lon: 8.93, stopId: '0001' },
  to: { name: 'BRIGNOLE', lat: 44.4, lon: 8.94, stopId: '0002' },
  startTime: '2026-07-04T09:10:00Z',
  endTime: '2026-07-04T09:25:00Z',
  durationSec: 900,
  geometry: [],
  approximated: true,
  intermediateStops: [],
};

describe('enrichLeg', () => {
  test('live prediction near the scheduled departure clears ⚠', () => {
    const enriched = enrichLeg(
      leg,
      [
        {
          line: '009',
          destination: 'PONTEDECIMO',
          theoretical: false,
          arrivalTime: '',
          countdown: "9'",
          vehicle: '09301',
          full: false,
        },
      ],
      0,
      '2026-07-04T09:00:00Z',
    );
    expect(enriched.approximated).toBe(false);
    expect(enriched.startTime).toBe('2026-07-04T09:09:00.000Z');
  });

  test('theoretical rows never enrich', () => {
    const enriched = enrichLeg(
      leg,
      [
        {
          line: '009',
          destination: 'PONTEDECIMO',
          theoretical: true,
          arrivalTime: '',
          countdown: "9'",
          vehicle: '',
          full: false,
        },
      ],
      0,
      '2026-07-04T09:00:00Z',
    );
    expect(enriched.approximated).toBe(true);
  });

  test('predictions earlier than we can reach the stop are ignored', () => {
    const enriched = enrichLeg(
      { ...leg, startTime: '2026-07-04T09:20:00Z' },
      [
        {
          line: '009',
          destination: 'PONTEDECIMO',
          theoretical: false,
          arrivalTime: '',
          countdown: "9'",
          vehicle: '09301',
          full: false,
        },
      ],
      0,
      '2026-07-04T09:00:00Z',
    );
    expect(enriched.approximated).toBe(true);
  });

  test('far-off predictions are ignored', () => {
    const enriched = enrichLeg(
      leg,
      [
        {
          line: '009',
          destination: 'PONTEDECIMO',
          theoretical: false,
          arrivalTime: '',
          countdown: "55'",
          vehicle: '09301',
          full: false,
        },
      ],
      0,
      '2026-07-04T09:00:00Z',
    );
    expect(enriched.approximated).toBe(true);
  });

  test('a bus exactly 180 s early still enriches (window lower bound)', () => {
    const enriched = enrichLeg(leg, [arrival('009', "7'")], 0, '2026-07-04T09:00:00Z');
    expect(enriched.approximated).toBe(false);
    expect(enriched.startTime).toBe('2026-07-04T09:07:00.000Z');
  });

  test('a bus exactly 900 s late still enriches (window upper bound)', () => {
    const enriched = enrichLeg(leg, [arrival('009', "25'")], 0, '2026-07-04T09:00:00Z');
    expect(enriched.approximated).toBe(false);
    expect(enriched.startTime).toBe('2026-07-04T09:25:00.000Z');
  });

  test('picks the soonest of several matching predictions', () => {
    const enriched = enrichLeg(
      leg,
      [arrival('009', "12'"), arrival('009', "8'"), arrival('009', "10'")],
      0,
      '2026-07-04T09:00:00Z',
    );
    expect(enriched.approximated).toBe(false);
    expect(enriched.startTime).toBe('2026-07-04T09:08:00.000Z');
  });

  test('predictions for other lines are ignored', () => {
    const enriched = enrichLeg(leg, [arrival('010', "10'")], 0, '2026-07-04T09:00:00Z');
    expect(enriched.approximated).toBe(true);
    expect(enriched.startTime).toBe(leg.startTime);
  });

  test('no arrivals leaves the leg untouched', () => {
    expect(enrichLeg(leg, [], 0, '2026-07-04T09:00:00Z')).toEqual(leg);
  });
});
