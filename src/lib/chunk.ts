/** Split a list into consecutive slices of at most `size` items. */
export const chunk = <T>(
  items: readonly T[],
  size: number,
): readonly (readonly T[])[] => {
  const step = Math.max(size, 1);
  return Array.from({ length: Math.ceil(items.length / step) }, (_, i) =>
    items.slice(i * step, (i + 1) * step),
  );
};
