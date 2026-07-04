const FRESH_SECONDS = 45;
const FROZEN_SECONDS = 120;

/**
 * How much a vehicle is still allowed to move, by data age: fresh
 * predictions animate fully; as the data ages past 45 s the point
 * decelerates linearly, and beyond 120 s it freezes entirely until
 * a new sighting arrives.
 */
export const staleFactor = (ageSeconds: number): number =>
  Math.min(
    Math.max(
      (FROZEN_SECONDS - ageSeconds) / (FROZEN_SECONDS - FRESH_SECONDS),
      0,
    ),
    1,
  );
