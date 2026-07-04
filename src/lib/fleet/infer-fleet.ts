import { groupBy } from '../group-by.ts';
import { normalizeLineLabel } from '../vehicles/normalize-line-label.ts';
import type { VehicleView } from '../vehicles/types.ts';
import { effectiveCountdown } from './effective-countdown.ts';
import { pickTemplate } from './pick-template.ts';
import { positionOnDirection } from './position-on-direction.ts';
import { soonestSighting } from './soonest-sighting.ts';
import type { BusOffsets, FleetSighting } from './types.ts';

/**
 * The whole live fleet: EVERY unique NumeroSociale across all
 * sightings yields exactly one marker (the count invariant the UI
 * exposes as data-fleet-computed / data-live-rendered). Placement is
 * between the two adjacent stops bracketing the melted countdown;
 * with no usable template the vehicle sits at its sighting stop.
 */
export const inferFleet = (
  sightings: readonly FleetSighting[],
  offsets: BusOffsets,
  coords: ReadonlyMap<string, readonly [number, number]>,
  nowSeconds: number,
): readonly VehicleView[] => {
  const live = sightings.filter(
    ({ row }) => !row.theoretical && row.vehicle !== '',
  );
  return Array.from(groupBy(live, ({ row }) => row.vehicle).values()).map(
    (group) => {
      const best = soonestSighting(group, nowSeconds);
      const label = normalizeLineLabel(best.row.line);
      const template = pickTemplate(
        offsets[label] ?? [],
        best.stopId,
        best.row.destination,
      );
      const placed = [template]
        .filter(
          (entry): entry is NonNullable<typeof entry> => entry !== undefined,
        )
        .map((entry) =>
          positionOnDirection(
            entry,
            coords,
            best.stopId,
            effectiveCountdown(best, nowSeconds),
          ),
        )[0];
      const anchor = coords.get(best.stopId) ?? [0, 0];
      return {
        id: `bus:${best.row.vehicle}`,
        label,
        mode: 'bus',
        lineKey: label,
        lon: placed?.point[0] ?? anchor[0],
        lat: placed?.point[1] ?? anchor[1],
        approximated: false,
        bearing: placed?.bearing,
      };
    },
  );
};
