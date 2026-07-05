type Coords = ReadonlyMap<string, readonly [number, number]>;

const distance = (
  a: readonly [number, number] | undefined,
  b: readonly [number, number] | undefined,
): number =>
  Math.hypot((a?.[0] ?? 0) - (b?.[0] ?? 0), (a?.[1] ?? 0) - (b?.[1] ?? 0)) || 1;

/** Fill out[from..to] between fixed endpoints ∝ inter-stop distance. */
export const retimeSpread = (
  stops: readonly string[],
  coords: Coords,
  out: number[],
  from: number,
  to: number,
  endValue: number,
): void => {
  const legs = Array.from({ length: to - from }, (_, i) =>
    distance(
      coords.get(stops[from + i] ?? ''),
      coords.get(stops[from + i + 1] ?? ''),
    ),
  );
  const total = legs.reduce((sum, leg) => sum + leg, 0);
  const base = out[from] ?? 0;
  legs.reduce((acc, leg, i) => {
    const advanced = acc + leg;
    out[from + i + 1] = base + ((endValue - base) * advanced) / total;
    return advanced;
  }, 0);
};
