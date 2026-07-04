import type { BusDirectionTemplate } from './types.ts';

type Path = readonly (readonly [number, number])[];
type Point = readonly [number, number];

const gap = (a: Point | undefined, b: Path[number] | undefined) =>
  ((a?.[0] ?? 99) - (b?.[0] ?? 0)) ** 2 + ((a?.[1] ?? 99) - (b?.[1] ?? 0)) ** 2;

/**
 * The road polyline matching a direction template, oriented the same
 * way. Scored by BOTH endpoints (first stop ↔ path start AND
 * terminus ↔ path end): loop-shaped routes whose ends sit close
 * together fooled a terminus-only score into picking the reversed
 * path, sending vehicles off their actual street.
 */
export const matchPath = (
  paths: readonly Path[],
  template: BusDirectionTemplate,
  coords: ReadonlyMap<string, Point>,
): Path | undefined => {
  const first = coords.get(template.stops[0] ?? '');
  const last = coords.get(template.stops[template.stops.length - 1] ?? '');
  const scored = paths
    .filter((path) => path.length > 1)
    .flatMap((path) => {
      const reversed = [...path].reverse();
      return [
        {
          path,
          score: gap(first, path[0]) + gap(last, path[path.length - 1]),
        },
        {
          path: reversed,
          score:
            gap(first, reversed[0]) + gap(last, reversed[reversed.length - 1]),
        },
      ];
    })
    .sort((a, b) => a.score - b.score)[0];
  return scored?.path;
};
