type Path = readonly (readonly [number, number])[];
type Point = readonly [number, number];

const nearestFrom = (path: Path, point: Point, start: number): number =>
  path.reduce(
    (best, candidate, index) => {
      const d =
        (candidate[0] - point[0]) ** 2 + (candidate[1] - point[1]) ** 2;
      return { true: { index, d }, false: best }[
        `${index >= start && d < best.d}`
      ];
    },
    { index: start, d: Number.POSITIVE_INFINITY },
  ).index;

/**
 * Project a direction's stops onto its road polyline MONOTONICALLY:
 * each stop is searched only forward of the previous stop's match.
 * Routes that double back along parallel streets would otherwise
 * project onto the wrong pass, making vehicles jump to the return
 * carriageway, drive against their arrow, or slide backward.
 */
export const projectStops = (
  path: Path,
  stops: readonly (Point | undefined)[],
): readonly number[] =>
  stops.reduce<readonly number[]>((indices, point) => {
    const previous = indices[indices.length - 1] ?? 0;
    const index = {
      true: () => previous,
      false: () => nearestFrom(path, point ?? [0, 0], previous),
    }[`${point === undefined}`]();
    return [...indices, index];
  }, []);
