import type { BusDirectionTemplate } from './types.ts';

type Path = readonly (readonly [number, number])[];

const gap = (a: readonly [number, number] | undefined, b: Path[number] | undefined) =>
  ((a?.[0] ?? 99) - (b?.[0] ?? 0)) ** 2 + ((a?.[1] ?? 99) - (b?.[1] ?? 0)) ** 2;

/**
 * The road polyline matching a direction template, oriented the same
 * way: of all candidate paths (both AMT directions), pick the one
 * whose endpoint lies closest to the template's terminus — reversed
 * if its start matches better than its end.
 */
export const matchPath = (
  paths: readonly Path[],
  template: BusDirectionTemplate,
  coords: ReadonlyMap<string, readonly [number, number]>,
): Path | undefined => {
  const terminus = coords.get(
    template.stops[template.stops.length - 1] ?? '',
  );
  const scored = paths
    .filter((path) => path.length > 1)
    .flatMap((path) => [
      { path, score: gap(terminus, path[path.length - 1]) },
      { path: [...path].reverse(), score: gap(terminus, path[0]) },
    ])
    .sort((a, b) => a.score - b.score)[0];
  return scored?.path;
};
