import {
  motionStep,
  type FleetMotion,
} from '../../lib/fleet/fleet-motion.ts';
import { targetView } from '../../lib/fleet/target-view.ts';
import type { VehicleView } from '../../lib/vehicles/types.ts';
import type { FleetFrame } from './fleet-frame.ts';

/**
 * Advance the displayed moments one frame and materialize them into
 * views through the route geometry. `instant` (reduced motion)
 * adopts targets directly.
 */
export const materializeFrame = (
  motion: FleetMotion,
  frame: FleetFrame,
  dt: number,
  instant: boolean,
): { readonly motion: FleetMotion; readonly views: readonly VehicleView[] } => {
  const next = motionStep(
    motion,
    frame.targets.map((target) => ({
      id: target.id,
      templateKey: target.templateKey,
      targetMoment: target.targetMoment,
      ageSeconds: { true: 0, false: target.ageSeconds }[`${instant}`] ?? 0,
    })),
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
