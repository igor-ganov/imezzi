import { bearingOf } from './bearing-of.ts';

type Path = readonly (readonly [number, number])[];

const differs = (a: Path[number] | undefined, b: Path[number] | undefined) =>
  a?.[0] !== b?.[0] || a?.[1] !== b?.[1];

/**
 * Travel bearing at a path vertex, ALWAYS along increasing indices
 * (the projection is monotonic, so travel order = index order).
 * Duplicate vertices are skipped — a zero-length segment would spin
 * the arrow north; at the end (or at `limit`, e.g. a stop's segment
 * boundary right before the route doubles back) the bearing of the
 * last real segment is kept instead of peeking past the turn.
 */
export const bearingAt = (
  path: Path,
  index: number,
  limit: number = path.length - 1,
): number => {
  const here = path[index];
  const forward = path.findIndex(
    (p, i) => i > index && i <= limit && differs(p, here),
  );
  const backward = path.findLastIndex((p, i) => i < index && differs(p, here));
  return {
    true: () => bearingOf(here ?? [0, 0], path[forward] ?? [0, 0]),
    false: () => bearingOf(path[backward] ?? [0, 0], here ?? [0, 0]),
  }[`${forward >= 0}`]();
};
