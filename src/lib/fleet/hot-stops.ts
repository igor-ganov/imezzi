import type { FleetTarget } from './fleet-target.ts';

/**
 * The stop each tracked vehicle reaches next: re-polling these every
 * tick keeps corrections small (fresh data before the extrapolation
 * drifts), instead of waiting ~2.5 min for the rotation to return.
 */
export const hotStops = (
  targets: readonly FleetTarget[],
  limit: number,
): readonly string[] => [
  ...new Set(
    targets.flatMap((target) => {
      const ahead = target.template?.offsets.findIndex(
        (offset) => offset > target.targetMoment,
      );
      return [target.template?.stops[ahead ?? -1]].filter(
        (stopId): stopId is string => stopId !== undefined,
      );
    }),
  ),
].slice(0, limit);
