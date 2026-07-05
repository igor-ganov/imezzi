export interface RotationSlice {
  readonly slice: readonly string[];
  readonly cursor: number;
}

/**
 * Next sweep slice: the clients' hot stops first, then as much of
 * the rotating plan window as the subrequest budget leaves room for.
 * The cursor advances by exactly what was taken from the plan — hot
 * stops never push plan stops out of coverage.
 */
export const nextSlice = (
  plan: readonly string[],
  cursor: number,
  hot: readonly string[],
  size: number,
): RotationSlice => {
  const lead = [...new Set(hot)].slice(0, size);
  const room = size - lead.length;
  const rotation = plan.slice(cursor, cursor + room);
  return {
    slice: [...new Set([...lead, ...rotation])],
    cursor: (cursor + rotation.length) % Math.max(plan.length, 1),
  };
};
