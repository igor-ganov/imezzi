import type { FleetTarget } from './fleet-target.ts';

export interface LiveGoal {
  readonly moment: number;
  readonly ageSeconds: number;
}

/**
 * The MOVING goal: between data portions the target advances at
 * schedule speed in real time (dead reckoning), clamped at the trip
 * end, and its age grows — so the render chase follows a continuous
 * motion instead of sprinting to a frozen point and standing still
 * until the next portion (the observed jerkiness).
 */
export const liveGoal = (target: FleetTarget, nowMs: number): LiveGoal => {
  const elapsed = Math.max((nowMs - target.builtAtMs) / 1000, 0);
  const tripEnd =
    target.template?.offsets[target.template.offsets.length - 1] ??
    target.targetMoment;
  return {
    moment: Math.min(target.targetMoment + elapsed, tripEnd),
    ageSeconds: target.ageSeconds + elapsed,
  };
};
