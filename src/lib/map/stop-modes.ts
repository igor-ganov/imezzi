import type { Schedule } from '../schedule/types.ts';

/** Line-mode significance: a shared station takes its loudest mode. */
const RANK: Readonly<Record<string, number>> = {
  lift: 1,
  train: 2,
  funicular: 3,
  metro: 4,
};

/**
 * Each non-bus station's transit mode. Built from the schedule lines
 * that serve it — a station touched by several modes keeps the
 * highest-ranked one (Map insertion order: lower ranks are written
 * first and overwritten by higher).
 */
export const stopModes = (schedule: Schedule): ReadonlyMap<string, string> =>
  new Map(
    schedule.lines
      .flatMap((line) =>
        line.directions
          .flatMap((direction) => direction.stops)
          .map((stopId) => [stopId, line.mode] as const),
      )
      .sort(([, a], [, b]) => (RANK[a] ?? 0) - (RANK[b] ?? 0)),
  );
