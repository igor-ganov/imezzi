import type { VehicleView } from '../vehicles/types.ts';
import { staleFactor } from './stale-factor.ts';

export interface MotionPoint {
  readonly lon: number;
  readonly lat: number;
}

/** ≈400 m at Genoa's latitude: beyond this, snap instead of chase. */
const JUMP_DEGREES = 0.0045;
/** Approach time constant: ~63 % of the gap closes each τ seconds. */
const TAU_SECONDS = 2;

const approach = (
  current: MotionPoint,
  target: VehicleView,
  dtSeconds: number,
): MotionPoint => {
  const gap = Math.hypot(target.lon - current.lon, target.lat - current.lat);
  const gain =
    (1 - Math.exp(-dtSeconds / TAU_SECONDS)) *
    staleFactor(target.ageSeconds ?? 0);
  return {
    true: (): MotionPoint => ({ lon: target.lon, lat: target.lat }),
    false: (): MotionPoint => ({
      lon: current.lon + (target.lon - current.lon) * gain,
      lat: current.lat + (target.lat - current.lat) * gain,
    }),
  }[`${gap > JUMP_DEGREES}`]();
};

/**
 * One display frame: every marker glides toward its computed target
 * (exponential approach — steady motion, no teleports, no discrete
 * polyline hops), decelerating to a standstill as its data ages.
 * Unknown ids appear at their target; ids gone from the targets drop.
 */
export const smoothStep = (
  displayed: ReadonlyMap<string, MotionPoint>,
  targets: readonly VehicleView[],
  dtSeconds: number,
): ReadonlyMap<string, MotionPoint> =>
  new Map(
    targets.map((target) => {
      const current = displayed.get(target.id);
      const next = {
        true: (): MotionPoint => ({ lon: target.lon, lat: target.lat }),
        false: () =>
          approach(
            current ?? { lon: target.lon, lat: target.lat },
            target,
            dtSeconds,
          ),
      }[`${current === undefined}`]();
      return [target.id, next] as const;
    }),
  );
