import { nearestPathIndex } from './nearest-path-index.ts';

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Position between two stops: `fraction` 0 = at previous stop,
 * 1 = at target stop. Follows the route polyline when present,
 * otherwise interpolates the straight segment.
 */
export const placeOnPath = (
  path: readonly (readonly [number, number])[],
  from: readonly [number, number],
  to: readonly [number, number],
  fraction: number,
): readonly [number, number] => {
  const direct: readonly [number, number] = [
    lerp(from[0], to[0], fraction),
    lerp(from[1], to[1], fraction),
  ];
  const onPath = (): readonly [number, number] => {
    const start = nearestPathIndex(path, from);
    const end = nearestPathIndex(path, to);
    const index = Math.round(lerp(start, end, fraction));
    return path[index] ?? direct;
  };
  return { true: onPath, false: () => direct }[`${path.length > 1}`]();
};
