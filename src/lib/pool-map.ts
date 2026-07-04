/** Map with bounded parallelism: chunks of `limit` run concurrently. */
export const poolMap = <T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<readonly R[]> => {
  const size = Math.max(limit, 1);
  const chunks = Array.from(
    { length: Math.ceil(items.length / size) },
    (_, index) => items.slice(index * size, (index + 1) * size),
  );
  return chunks.reduce<Promise<readonly R[]>>(
    async (accPromise, chunk) => {
      const acc = await accPromise;
      return [...acc, ...(await Promise.all(chunk.map(fn)))];
    },
    Promise.resolve([]),
  );
};
