import type { LineStopRef, Stop } from '../amt/types.ts';
import { groupBy } from '../group-by.ts';

/**
 * The city sweep plan: every Nth monitored stop of every line
 * direction plus its terminus. SIMON lists only the next ~2 arrivals
 * per line at a stop, so a stride under half a typical headway of
 * travel guarantees every running vehicle appears in at least one
 * polled stop's predictions (live-map US-1: EVERY bus).
 */
export const fleetPlan = (
  stops: readonly Stop[],
  refs: readonly LineStopRef[],
  stride: number,
): readonly string[] => {
  const monitored = new Set(
    stops.filter((stop) => stop.monitored).map((stop) => stop.id),
  );
  const plan = new Set<string>();
  groupBy(refs, (ref) => `${ref.lineId}_${ref.direction}`).forEach((list) => {
    const ids = [...list]
      .sort((a, b) => a.position - b.position)
      .map((ref) => ref.stopId)
      .filter((id) => monitored.has(id));
    ids
      .filter((_, index) => index % Math.max(stride, 1) === 0)
      .forEach((id) => plan.add(id));
    [ids[ids.length - 1]]
      .filter((id): id is string => id !== undefined)
      .forEach((id) => plan.add(id));
  });
  return [...plan];
};
