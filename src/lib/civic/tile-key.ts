const CELL = 0.004;

/**
 * Grid cells covering a bounding box, as [cacheKey, cellBbox] —
 * the unit of viewport WFS fetching and session caching (AC-1.3).
 */
export const tilesInBbox = (
  west: number,
  south: number,
  east: number,
  north: number,
): readonly (readonly [string, readonly [number, number, number, number]])[] => {
  const x0 = Math.floor(west / CELL);
  const x1 = Math.floor(east / CELL);
  const y0 = Math.floor(south / CELL);
  const y1 = Math.floor(north / CELL);
  return Array.from({ length: x1 - x0 + 1 }, (_, dx) => x0 + dx).flatMap((x) =>
    Array.from({ length: y1 - y0 + 1 }, (_, dy) => y0 + dy).map(
      (y) =>
        [
          `${x}:${y}`,
          [x * CELL, y * CELL, (x + 1) * CELL, (y + 1) * CELL],
        ] as const,
    ),
  );
};
