import type { FleetTarget } from './fleet-target.ts';
import { liveGoal } from './live-target.ts';

export interface StripStop {
  readonly name: string;
  readonly passed: boolean;
}

export interface VehicleStrip {
  readonly stops: readonly StripStop[];
  /** Fraction of the trip already covered, 0–1 (progress bar). */
  readonly fraction: number;
}

const clamp = (value: number): number => Math.min(Math.max(value, 0), 1);

/**
 * The vehicle's whole trip as an in-train line diagram: every stop
 * with a passed flag plus the 0–1 progress of the car along the route
 * (collapsed vehicle sheet — the metro-style strip).
 */
export const vehicleStrip = (
  target: FleetTarget,
  names: ReadonlyMap<string, string>,
  nowMs: number,
): VehicleStrip => {
  const moment = liveGoal(target, nowMs).moment;
  const offsets = target.template?.offsets ?? [];
  const stops = (target.template?.stops ?? []).map((stopId, index) => ({
    name: names.get(stopId) ?? stopId,
    passed: (offsets[index] ?? 0) < moment,
  }));
  const last = offsets[offsets.length - 1] ?? 1;
  return { stops, fraction: clamp(moment / Math.max(last, 1)) };
};
