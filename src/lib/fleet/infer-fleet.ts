import { groupBy } from '../group-by.ts';
import type { VehicleView } from '../vehicles/types.ts';
import type { FleetMemory, FleetProgress } from './fleet-memory.ts';
import { placeVehicle } from './place-vehicle.ts';
import { soonestSighting } from './soonest-sighting.ts';
import type { BusOffsets, FleetSighting } from './types.ts';

type Path = readonly (readonly [number, number])[];
type PathsOf = (label: string) => readonly Path[] | undefined;

export interface FleetPlacementResult {
  readonly views: readonly VehicleView[];
  readonly memory: FleetMemory;
}

/**
 * The whole live fleet: EVERY unique NumeroSociale yields exactly
 * one marker (the count invariant). Direction is STICKY per vehicle
 * (SIMON headsigns rarely match GTFS termini verbatim, so a vehicle
 * keeps its direction while it still serves the sighted stop), and
 * progress along a direction is MONOTONIC via the returned memory —
 * vehicles never glide backward on prediction noise.
 */
export const inferFleet = (
  sightings: readonly FleetSighting[],
  offsets: BusOffsets,
  coords: ReadonlyMap<string, readonly [number, number]>,
  nowSeconds: number,
  pathsOf: PathsOf = () => undefined,
  memory: FleetMemory = new Map(),
): FleetPlacementResult => {
  const live = sightings.filter(
    ({ row }) => !row.theoretical && row.vehicle !== '',
  );
  const nextMemory = new Map<string, FleetProgress>();
  const views = Array.from(
    groupBy(live, ({ row }) => row.vehicle).values(),
  ).map((group) => {
    const best = soonestSighting(group, nowSeconds);
    const id = `bus:${best.row.vehicle}`;
    const { view, progress } = placeVehicle(
      best,
      offsets,
      coords,
      nowSeconds,
      pathsOf,
      memory.get(id),
    );
    nextMemory.set(id, progress);
    return view;
  });
  return { views, memory: nextMemory };
};
