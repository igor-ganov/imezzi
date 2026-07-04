import type { BusLineContext } from './bus-line-context.ts';
import type { StopArrival } from './stop-arrival.ts';

/**
 * One line's poll result, kept raw so positions can be recomputed
 * every tick: countdowns melt as wall-clock time passes and the
 * vehicles glide toward their next stop between polls (US-1).
 */
export interface LiveSnapshot {
  readonly context: BusLineContext;
  readonly arrivals: readonly StopArrival[];
  readonly fetchedAtSeconds: number;
}

/**
 * Keep snapshots young enough to trust (ambient cycles accumulate:
 * lines discovered two sweeps ago must not vanish from the map).
 * Day-seconds wrap at midnight is handled by modular distance.
 */
export const pruneSnapshots = (
  snapshots: readonly LiveSnapshot[],
  nowSeconds: number,
  ttlSeconds: number,
): readonly LiveSnapshot[] =>
  snapshots.filter(
    (snapshot) =>
      (nowSeconds - snapshot.fetchedAtSeconds + 86400) % 86400 <= ttlSeconds,
  );
