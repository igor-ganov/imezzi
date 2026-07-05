import { describe, expect, test } from 'bun:test';
import type { FleetTarget } from '../../src/lib/fleet/fleet-target.ts';
import { matchLegVehicle } from '../../src/lib/route/match-leg-vehicle.ts';
import { parkedLegViews } from '../../src/lib/route/parked-leg-views.ts';
import type { Itinerary, Leg } from '../../src/lib/route/types.ts';

const template = {
  stops: ['A', 'B', 'C'],
  offsets: [0, 120, 300],
  lastStopName: 'NORD',
};

const target = (
  id: string,
  targetMoment: number,
  label = '1',
): FleetTarget => ({
  id,
  label,
  templateKey: `${label}#0`,
  template,
  road: undefined,
  targetMoment,
  ageSeconds: 0,
  anchor: [8.9, 44.0],
  dimmed: false,
});

const leg = (over: Partial<Leg>): Leg => ({
  mode: 'bus',
  line: '1',
  headsign: 'NORD',
  from: { name: 'B', lat: 44.1, lon: 8.9, stopId: 'B' },
  to: { name: 'C', lat: 44.2, lon: 8.9, stopId: 'C' },
  startTime: new Date(0).toISOString(),
  endTime: new Date(0).toISOString(),
  durationSec: 180,
  geometry: [],
  approximated: false,
  intermediateStops: [],
  ...over,
});

describe('matchLegVehicle', () => {
  test('picks the vehicle arriving at boarding closest to plan time', () => {
    // Boarding at B (offset 120). Vehicle X is at moment 0 (ETA 120),
    // vehicle Y at moment 100 (ETA 20). Planned wait is 110 s → X.
    const id = matchLegVehicle(
      [target('bus:X', 0), target('bus:Y', 100)],
      leg({}),
      110,
    );
    expect(id).toBe('bus:X');
  });

  test('vehicles already past the boarding stop are skipped', () => {
    expect(
      matchLegVehicle([target('bus:X', 200)], leg({}), 60),
    ).toBeUndefined();
  });

  test('other lines never match', () => {
    expect(
      matchLegVehicle([target('bus:X', 0, '9')], leg({}), 60),
    ).toBeUndefined();
  });

  test('leading zeros in the leg line are normalized', () => {
    expect(
      matchLegVehicle([target('bus:X', 0)], leg({ line: '001' }), 110),
    ).toBe('bus:X');
  });
});

describe('parkedLegViews', () => {
  const itinerary: Itinerary = {
    legs: [leg({ mode: 'walk', line: '' }), leg({}), leg({ line: '9' })],
    startTime: '',
    endTime: '',
    durationSec: 0,
    transfers: 1,
  };

  test('unmatched transit legs park a ⚠ pictogram at their origin', () => {
    const views = parkedLegViews(itinerary, new Map([[1, 'bus:X']]));
    expect(views.length).toBe(1);
    expect(views[0]).toMatchObject({
      id: 'leg:2',
      label: '9',
      lat: 44.1,
      lon: 8.9,
      approximated: true,
    });
  });

  test('walk legs and matched legs produce nothing', () => {
    const views = parkedLegViews(
      itinerary,
      new Map([
        [1, 'bus:X'],
        [2, 'bus:Y'],
      ]),
    );
    expect(views).toEqual([]);
  });

  test('no itinerary — no pictograms', () => {
    expect(parkedLegViews(undefined, new Map())).toEqual([]);
  });
});
