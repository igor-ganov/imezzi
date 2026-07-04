import { encodePolyline } from './encode-polyline.ts';
import arrivals from '../fixtures/arrivals.json' with { type: 'json' };
import busOffsets from '../fixtures/bus-offsets.json' with { type: 'json' };
import geometry from '../fixtures/geometry.json' with { type: 'json' };
import lines from '../fixtures/lines.json' with { type: 'json' };
import lineStops from '../fixtures/line-stops.json' with { type: 'json' };
import stops from '../fixtures/stops.json' with { type: 'json' };
import wfs from '../fixtures/wfs.json' with { type: 'json' };

/**
 * Fixtures are imported statically: Playwright's transform runs the
 * helpers from a cache directory, so runtime relative reads resolve
 * to the wrong place — bundled JSON cannot miss.
 */
export const FIXTURES = {
  'arrivals.json': arrivals,
  'bus-offsets.json': busOffsets,
  'geometry.json': geometry,
  'lines.json': lines,
  'line-stops.json': lineStops,
  'stops.json': stops,
  'wfs.json': wfs,
} as const;

export const fixture = (name: keyof typeof FIXTURES): unknown =>
  FIXTURES[name];

const romeDay = (date: Date): string =>
  new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Rome' })
    .format(date)
    .replaceAll('-', '');

/**
 * Metro schedule active today with departures every 5 minutes all
 * day — deterministic vehicles at any wall-clock time.
 */
export const makeSchedule = () => ({
  lines: [
    {
      id: 'MM-91',
      shortName: 'MM',
      longName: 'Sud - Nord',
      mode: 'metro',
      directions: [
        {
          stops: ['0003', '0001', '0002'],
          offsets: [0, 240, 480],
          departures: {
            ALLDAY: Array.from({ length: 288 }, (_, i) => i * 300),
          },
        },
      ],
    },
  ],
  serviceDates: {
    ALLDAY: [
      romeDay(new Date(Date.now() - 86400000)),
      romeDay(new Date()),
      romeDay(new Date(Date.now() + 86400000)),
    ],
  },
  stops: {
    '0003': { name: 'SUD/TEST', lat: 44.4025, lon: 8.9463 },
    '0001': { name: 'CENTRO/TEST', lat: 44.4095, lon: 8.9463 },
    '0002': { name: 'NORD/TEST', lat: 44.4165, lon: 8.9463 },
  },
});

const leg = (
  mode: string,
  overrides: Record<string, unknown>,
): Record<string, unknown> => ({
  mode,
  from: { name: 'START', lat: 44.4075, lon: 8.9443 },
  to: { name: 'END', lat: 44.4115, lon: 8.9483 },
  startTime: new Date(Date.now() + 9 * 60000).toISOString(),
  endTime: new Date(Date.now() + 19 * 60000).toISOString(),
  duration: 600,
  realTime: false,
  legGeometry: {
    points: encodePolyline(
      [
        [8.9443, 44.4075],
        [8.9483, 44.4115],
      ],
      7,
    ),
    precision: 7,
  },
  ...overrides,
});

/** Transitous plan: walk → metro (timetable ⚠) → bus 1 (enrichable). */
export const makePlan = () => ({
  itineraries: [
    {
      duration: 1800,
      startTime: new Date(Date.now() + 5 * 60000).toISOString(),
      endTime: new Date(Date.now() + 35 * 60000).toISOString(),
      transfers: 1,
      legs: [
        leg('WALK', {}),
        leg('SUBWAY', {
          routeShortName: 'MM',
          headsign: 'NORD',
          from: {
            name: 'SUD/TEST',
            stopId: 'it-Liguria-Genova_MM03',
            lat: 44.4025,
            lon: 8.9463,
          },
        }),
        leg('BUS', {
          routeShortName: '1',
          headsign: 'NORD',
          from: {
            name: 'CENTRO/TEST',
            stopId: 'it-Liguria-Genova_0001',
            lat: 44.4095,
            lon: 8.9463,
          },
          intermediateStops: [],
        }),
      ],
    },
    {
      duration: 2400,
      startTime: new Date(Date.now() + 8 * 60000).toISOString(),
      endTime: new Date(Date.now() + 48 * 60000).toISOString(),
      transfers: 0,
      legs: [leg('WALK', { duration: 2400 })],
    },
  ],
});

/** Minimal MapLibre style — no network dependencies beyond glyphs. */
export const emptyStyle = () => ({
  version: 8,
  name: 'e2e',
  sources: {},
  layers: [
    { id: 'bg', type: 'background', paint: { 'background-color': '#e8e4da' } },
  ],
  glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
});
