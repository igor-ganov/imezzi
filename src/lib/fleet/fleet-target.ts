import type { Road } from './road-of.ts';
import type { BusDirectionTemplate } from './types.ts';

/**
 * A vehicle's computed goal, geometry-free: the render layer chases
 * `targetMoment` in timeline space and derives coordinates from the
 * template + road each frame, so every movement follows the street.
 */
export interface FleetTarget {
  readonly id: string;
  readonly label: string;
  readonly templateKey: string;
  readonly template: BusDirectionTemplate | undefined;
  readonly road: Road | undefined;
  readonly targetMoment: number;
  readonly ageSeconds: number;
  /** Sighting-stop coordinate — the anchor when no template fits. */
  readonly anchor: readonly [number, number];
  readonly dimmed: boolean;
}
