import { staleFactor } from '../motion/stale-factor.ts';
import type { MotionState, MotionTarget } from './fleet-motion.ts';

/** Approach time constant (~63 % of the gap closes each τ). */
const TAU_SECONDS = 3;
/** Catch-up is capped at 6× real time — brisk but road-plausible. */
const MAX_RATE = 6;
/**
 * A correction beyond this is not driving, it is AMT data jumping
 * (a vehicle re-appearing several stops away): racing the whole
 * stretch at 6× reads as a light-speed bus, so the marker RELOCATES
 * instantly instead — and the snap is counted as an anomaly.
 */
const SNAP_SECONDS = 120;

/** Glide toward the target; snap on anomalous corrections. */
export const motionChase = (
  current: MotionState,
  target: MotionTarget,
  dtSeconds: number,
): MotionState => {
  const gap = target.targetMoment - current.moment;
  const gain =
    (1 - Math.exp(-dtSeconds / TAU_SECONDS)) * staleFactor(target.ageSeconds);
  const step = Math.min(Math.max(gap * gain, 0), MAX_RATE * dtSeconds);
  return {
    true: (): MotionState => ({
      templateKey: current.templateKey,
      moment: target.targetMoment,
      snaps: current.snaps + 1,
    }),
    false: (): MotionState => ({
      templateKey: current.templateKey,
      moment: current.moment + step,
      snaps: current.snaps,
    }),
  }[`${gap > SNAP_SECONDS}`]();
};
