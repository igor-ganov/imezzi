import {
  motionStep,
  type FleetMotion,
} from '../../lib/fleet/fleet-motion.ts';
import { liveGoal } from '../../lib/fleet/live-target.ts';
import { targetView } from '../../lib/fleet/target-view.ts';
import type { VehicleView } from '../../lib/vehicles/types.ts';
import type { FleetFrame } from './fleet-frame.ts';

/**
 * Advance the displayed moments one frame and materialize them into
 * views through the route geometry. Each target's goal MOVES in real
 * time (liveGoal dead reckoning), so vehicles glide continuously
 * instead of sprinting to a frozen point and standing until the next
 * data portion. `instant` (reduced motion) adopts goals directly.
 */
export const materializeFrame = (
  motion: FleetMotion,
  frame: FleetFrame,
  dt: number,
  instant: boolean,
): { readonly motion: FleetMotion; readonly views: readonly VehicleView[] } => {
  const nowMs = Date.now();
  const next = motionStep(
    motion,
    frame.targets.map((target) => {
      const goal = liveGoal(target, nowMs);
      return {
        id: target.id,
        templateKey: target.templateKey,
        targetMoment: goal.moment,
        ageSeconds: { true: 0, false: goal.ageSeconds }[`${instant}`] ?? 0,
      };
    }),
    { true: 3600, false: dt }[`${instant}`] ?? dt,
  );
  return {
    motion: next,
    views: frame.targets.map((target) =>
      targetView(
        target,
        frame.coords,
        next.get(target.id)?.moment ?? target.targetMoment,
      ),
    ),
  };
};
