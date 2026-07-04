import type { Arrival } from '../amt/types.ts';

/** Travel-time template of one bus direction (public/data artifact). */
export interface BusDirectionTemplate {
  readonly stops: readonly string[];
  readonly offsets: readonly number[];
  readonly lastStopName: string;
}

/** All bus routes' templates, keyed by normalized short name. */
export type BusOffsets = Readonly<
  Record<string, readonly BusDirectionTemplate[]>
>;

/** One SIMON row observed at a stop during the city sweep. */
export interface FleetSighting {
  readonly stopId: string;
  readonly row: Arrival;
  readonly fetchedAtSeconds: number;
}
