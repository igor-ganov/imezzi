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
