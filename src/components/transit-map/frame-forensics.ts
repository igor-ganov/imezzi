import type { FleetMotion } from '../../lib/fleet/fleet-motion.ts';
import type { FleetTarget } from '../../lib/fleet/fleet-target.ts';

/**
 * Per-frame observation snapshot on __imezzi.frameDebug: goal vs
 * displayed moment for a few targets — this is what separated the
 * smooth-timeline/quantized-geometry bug from a chase bug.
 */
export const publishFrameDebug = (
  targets: readonly FleetTarget[],
  motion: FleetMotion,
  dt: number,
): void => {
  Object.assign(
    (globalThis as { readonly __imezzi?: Record<string, unknown> }).__imezzi ??
      {},
    {
      frameDebug: targets.slice(0, 3).map((target) => ({
        id: target.id,
        targetMoment: target.targetMoment,
        displayed: motion.get(target.id)?.moment,
        builtAgoMs: Date.now() - target.builtAtMs,
        dt,
      })),
    },
  );
};
