/** Per-vehicle continuity between ticks (direction + progress). */
export interface FleetProgress {
  readonly templateKey: string;
  readonly moment: number;
}

export type FleetMemory = ReadonlyMap<string, FleetProgress>;

/** A huge regression on the same direction = the next trip started. */
const NEW_TRIP_CAP_SECONDS = 600;

/**
 * Monotonic progress: on the same direction a vehicle never moves
 * backward — a re-poll that grows the countdown (traffic, prediction
 * noise) holds the vehicle in place instead of sliding it back. Only
 * a direction change or a very large regression (the next trip on
 * the same line: over half the route, capped at 10 min) resets it.
 */
export const advanceProgress = (
  previous: FleetProgress | undefined,
  templateKey: string,
  rawMoment: number,
  routeSeconds: number,
): number => {
  const sameDirection = previous?.templateKey === templateKey;
  const held = previous?.moment ?? rawMoment;
  const newTrip =
    held - rawMoment > Math.min(NEW_TRIP_CAP_SECONDS, routeSeconds * 0.5);
  const onSameDirection =
    { true: rawMoment, false: Math.max(rawMoment, held) }[`${newTrip}`] ??
    rawMoment;
  return (
    { true: onSameDirection, false: rawMoment }[`${sameDirection}`] ??
    rawMoment
  );
};
