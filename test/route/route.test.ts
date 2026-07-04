import { describe, expect, test } from 'bun:test';
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
});

describe('motisMode', () => {
  test('maps transit families to mode tokens', () => {
    expect(motisMode('SUBWAY')).toBe('metro');
    expect(motisMode('REGIONAL_RAIL')).toBe('train');
    expect(motisMode('WALK')).toBe('walk');
    expect(motisMode('BUS')).toBe('bus');
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
});
