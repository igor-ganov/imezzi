import type { FleetTarget } from './fleet-target.ts';

export interface CarriedTarget {
  readonly target: FleetTarget;
  readonly builtAtSeconds: number;
}

export type TargetCarry = ReadonlyMap<string, CarriedTarget>;

/** How long a vehicle survives dropping out of the data. */
const GRACE_SECONDS = 60;

/**
 * Target continuity: a vehicle briefly absent from the sweep (its
 * stop was re-polled after it passed, the next one not yet) must NOT
 * vanish and re-adopt a far-away target on return — that was the
 * measured 2 km frame jump. Its last target is carried with growing
 * age (the stale factor brakes it smoothly) until data returns or
 * the grace expires.
 */
export const carryTargets = (
  previous: TargetCarry,
  fresh: readonly FleetTarget[],
  nowSeconds: number,
): { readonly targets: readonly FleetTarget[]; readonly carry: TargetCarry } => {
  const carry = new Map<string, CarriedTarget>(
    fresh.map((target) => [target.id, { target, builtAtSeconds: nowSeconds }]),
  );
  const alive = new Set(fresh.map((target) => target.id));
  // The carry keeps the ORIGINAL target; aging is applied only on
  // emission — otherwise chained frames would compound the age.
  const ghosts = [...previous.entries()].filter(
    ([id, entry]) =>
      !alive.has(id) &&
      nowSeconds - entry.builtAtSeconds <= GRACE_SECONDS &&
      nowSeconds >= entry.builtAtSeconds,
  );
  ghosts.forEach(([id, entry]) => carry.set(id, entry));
  return {
    targets: [
      ...fresh,
      ...ghosts.map(([, entry]) => ({
        ...entry.target,
        ageSeconds:
          entry.target.ageSeconds + (nowSeconds - entry.builtAtSeconds),
      })),
    ],
    carry,
  };
};
