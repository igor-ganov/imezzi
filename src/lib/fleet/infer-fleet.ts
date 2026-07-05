import { groupBy } from '../group-by.ts';
import { buildTarget } from './build-target.ts';
import type { FleetMemory, FleetProgress } from './fleet-memory.ts';
import type { FleetTarget } from './fleet-target.ts';
import { isActiveSighting } from './is-active-sighting.ts';
import { soonestSighting } from './soonest-sighting.ts';
import type { BusOffsets, FleetSighting } from './types.ts';

type Path = readonly (readonly [number, number])[];
type PathsOf = (label: string) => readonly Path[] | undefined;

export interface FleetInference {
  readonly targets: readonly FleetTarget[];
  readonly memory: FleetMemory;
}

/**
 * The whole live fleet as timeline targets: EVERY unique active
 * NumeroSociale yields exactly one target (the count invariant).
 * Expired clock-wrapped rows are excluded — observed live, they
 * teleported vehicles back to their route start. Direction is
 * sticky, progress is monotonic and extrapolates past the sighted
 * stop at schedule speed.
 */
export const inferFleet = (
  sightings: readonly FleetSighting[],
  offsets: BusOffsets,
  coords: ReadonlyMap<string, readonly [number, number]>,
  nowSeconds: number,
  pathsOf: PathsOf = () => undefined,
  memory: FleetMemory = new Map(),
): FleetInference => {
  const live = sightings.filter(isActiveSighting);
  const nextMemory = new Map<string, FleetProgress>();
  const targets = Array.from(
    groupBy(live, ({ row }) => row.vehicle).values(),
  ).map((group) => {
    const best = soonestSighting(group, nowSeconds);
    const id = `bus:${best.row.vehicle}`;
    const { target, progress } = buildTarget(
      best,
      offsets,
      coords,
      nowSeconds,
      pathsOf,
      memory.get(id),
    );
    nextMemory.set(id, progress);
    return target;
  });
  return { targets, memory: nextMemory };
};
