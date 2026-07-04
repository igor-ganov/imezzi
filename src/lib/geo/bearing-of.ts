/**
 * Compass bearing (degrees, 0 = north, clockwise) from one lon/lat
 * point to another; flat-earth approximation is fine at city scale.
 */
export const bearingOf = (
  from: readonly [number, number],
  to: readonly [number, number],
): number => {
  const dLon = (to[0] - from[0]) * Math.cos(((from[1] + to[1]) / 2) * (Math.PI / 180));
  const dLat = to[1] - from[1];
  return (Math.atan2(dLon, dLat) * (180 / Math.PI) + 360) % 360;
};
