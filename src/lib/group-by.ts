/** Group items by key (Map.groupBy is beyond our ES2023 lib). */
export const groupBy = <T, K>(
  items: readonly T[],
  keyOf: (item: T) => K,
): ReadonlyMap<K, readonly T[]> => {
  const map = new Map<K, readonly T[]>();
  items.forEach((item) => {
    const key = keyOf(item);
    map.set(key, [...(map.get(key) ?? []), item]);
  });
  return map;
};
