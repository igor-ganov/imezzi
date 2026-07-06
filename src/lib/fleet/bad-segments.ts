type Path = readonly (readonly [number, number])[];

const METERS = 111000;
const ABS_LIMIT_M = 700;
const RATIO_LIMIT = 4;

const dist = (
  a: readonly [number, number] | undefined,
  b: readonly [number, number] | undefined,
): number =>
  Math.hypot((a?.[0] ?? 0) - (b?.[0] ?? 0), (a?.[1] ?? 0) - (b?.[1] ?? 0)) *
  METERS;

/**
 * Flag stop-to-stop segments whose PROJECTED path stretch is wildly
 * longer than the straight line (>4× and >700 m): a slipped
 * projection (variant template vs the wrong polyline, loops) that
 * made markers fly kilometres of geometry per timeline second —
 * the audited city has ~2.4% such segments. Placement falls back to
 * the chord there.
 */
export const badSegments = (
  path: Path,
  indices: readonly number[],
  stops: readonly (readonly [number, number] | undefined)[],
): readonly boolean[] =>
  indices.slice(1).map((end, i) => {
    const start = indices[i] ?? 0;
    const straight = dist(stops[i], stops[i + 1]);
    const stretch = Array.from(
      { length: Math.max(end - start, 0) },
      (_, k) => dist(path[start + k], path[start + k + 1]),
    ).reduce((sum, leg) => sum + leg, 0);
    return stretch > ABS_LIMIT_M && stretch > straight * RATIO_LIMIT;
  });
