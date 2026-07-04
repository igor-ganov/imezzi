/** Index of the polyline point closest to a lon/lat coordinate. */
export const nearestPathIndex = (
  path: readonly (readonly [number, number])[],
  point: readonly [number, number],
): number =>
  path.reduce(
    (best, candidate, index) => {
      const d =
        (candidate[0] - point[0]) ** 2 + (candidate[1] - point[1]) ** 2;
      return { true: { index, d }, false: best }[`${d < best.d}`];
    },
    { index: 0, d: Number.POSITIVE_INFINITY },
  ).index;
