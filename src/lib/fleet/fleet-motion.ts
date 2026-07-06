import { motionChase } from './motion-chase.ts';

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
  /** Discrete relocations taken (anomalous data corrections). */
  readonly snaps: number;
}

export type FleetMotion = ReadonlyMap<string, MotionState>;

/**
 * One display frame IN TIMELINE SPACE: each vehicle's displayed
 * moment glides toward its target moment — never backward, at a
 * capped catch-up rate, decelerating to a stop as data ages. The
 * position is derived from the moment via the route geometry, so
 * catch-ups physically drive along the road. A direction change
 * adopts the new moment immediately (a genuinely different journey);
 * an oversized correction relocates instantly and is counted (see
 * motion-chase.ts).
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
          motionChase(
            current ?? {
              templateKey: target.templateKey,
              moment: target.targetMoment,
              snaps: 0,
            },
            target,
            dtSeconds,
          ),
        false: (): MotionState => ({
          templateKey: target.templateKey,
          moment: target.targetMoment,
          snaps: current?.snaps ?? 0,
        }),
      }[`${sameDirection}`]();
      return [target.id, next] as const;
    }),
  );
