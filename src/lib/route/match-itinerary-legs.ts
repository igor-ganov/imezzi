import type { FleetTarget } from '../fleet/fleet-target.ts';
import { matchLegVehicle } from './match-leg-vehicle.ts';
import type { Itinerary } from './types.ts';

/** Vehicle id per transit leg index of the active itinerary. */
export const matchItineraryLegs = (
  targets: readonly FleetTarget[],
  itinerary: Itinerary | undefined,
  nowMs: number,
): ReadonlyMap<number, string | undefined> =>
  new Map(
    (itinerary?.legs ?? [])
      .map((leg, index) => ({ leg, index }))
      .filter(({ leg }) => leg.mode !== 'walk')
      .map(({ leg, index }): readonly [number, string | undefined] => [
        index,
        matchLegVehicle(
          targets,
          leg,
          (Date.parse(leg.startTime) - nowMs) / 1000,
        ),
      ]),
  );
