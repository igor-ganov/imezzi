import { staleFactor } from '../motion/stale-factor.ts';

/** What the render layer needs per vehicle to chase its target. */
export interface MotionTarget {
  readonly id: string;
  readonly templateKey: string;
  readonly targetMoment: number;
  readonly ageSeconds: number;
}

export interface MotionState {
  readonly templateKey: string;
  readonly moment: number;
}

export type FleetMotion = ReadonlyMap<string, MotionState>;

/** Approach time constant (~63 % of the gap closes each τ). */
const TAU_SECONDS = 3;
/** Catch-up is capped at 6× real time — brisk but road-plausible. */
const MAX_RATE = 6;

const chase = (
  current: MotionState,
  target: MotionTarget,
  dtSeconds: number,
): MotionState => {
  const gain =
    (1 - Math.exp(-dtSeconds / TAU_SECONDS)) * staleFactor(target.ageSeconds);
  const step = Math.min(
    Math.max((target.targetMoment - current.moment) * gain, 0),
    MAX_RATE * dtSeconds,
  );
  return { templateKey: current.templateKey, moment: current.moment + step };
};

/**
 * One display frame IN TIMELINE SPACE: each vehicle's displayed
 * moment glides toward its target moment — never backward, at a
 * capped catch-up rate, decelerating to a stop as data ages. The
 * position is derived from the moment via the route geometry, so
 * catch-ups physically drive along the road; the straight-chord
 * teleports were a geo-space smoothing artifact. A direction change
 * adopts the new moment immediately (a genuinely different journey).
 */
export const motionStep = (
  motion: FleetMotion,
  targets: readonly MotionTarget[],
  dtSeconds: number,
): FleetMotion =>
  new Map(
    targets.map((target) => {
      const current = motion.get(target.id);
      const sameDirection = current?.templateKey === target.templateKey;
      const next = {
        true: () =>
          chase(
            current ?? { templateKey: target.templateKey, moment: target.targetMoment },
            target,
            dtSeconds,
          ),
        false: (): MotionState => ({
          templateKey: target.templateKey,
          moment: target.targetMoment,
        }),
      }[`${sameDirection}`]();
      return [target.id, next] as const;
    }),
  );
