import type { Stop } from '../amt/types.ts';
import type { FleetTarget } from './fleet-target.ts';
import { liveGoal } from './live-target.ts';
import { nearestStop } from './nearest-stop.ts';

export interface LineDiagram {
  /** Every stop name of the trip, in order. */
  readonly stops: readonly string[];
  /** The vehicle rides between stops[at] and stops[at + 1]. */
  readonly at: number;
  /** Its position within that segment, 0–1. */
  readonly fraction: number;
  /** Stop nearest the user, or -1 when unlocated. */
  readonly meAt: number;
}

const clamp = (value: number, hi: number): number =>
  Math.min(Math.max(value, 0), hi);

/**
 * The vehicle's whole trip as a metro line diagram: the ordered stops,
 * which two the vehicle is currently between (with the fraction along
 * that leg), and where the user stands on the same line.
 */
export const lineDiagram = (
  target: FleetTarget,
  stops: ReadonlyMap<string, Stop>,
  me: { readonly lon: number; readonly lat: number } | undefined,
  nowMs: number,
): LineDiagram => {
  const ids = target.template?.stops ?? [];
  const offsets = target.template?.offsets ?? [];
  const moment = liveGoal(target, nowMs).moment;
  const at = clamp(
    offsets.filter((offset) => offset <= moment).length - 1,
    Math.max(ids.length - 2, 0),
  );
  const span = Math.max((offsets[at + 1] ?? 0) - (offsets[at] ?? 0), 1);
  return {
    stops: ids.map((id) => stops.get(id)?.name ?? id),
    at,
    fraction: clamp((moment - (offsets[at] ?? 0)) / span, 1),
    meAt: nearestStop(ids, stops, me),
  };
};
