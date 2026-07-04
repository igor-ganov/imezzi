/** Evenly sample up to `limit` items, keeping first and spacing. */
export const sampleEvery = <T>(
  items: readonly T[],
  limit: number,
): readonly T[] => {
  const step = Math.max(1, Math.ceil(items.length / Math.max(limit, 1)));
  return items.filter((_, index) => index % step === 0);
};
