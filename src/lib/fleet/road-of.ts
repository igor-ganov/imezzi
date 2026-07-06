import { projectStops } from '../geo/project-stops.ts';
import { badSegments } from './bad-segments.ts';
import { matchPath } from './match-path.ts';
import type { BusDirectionTemplate } from './types.ts';

type Path = readonly (readonly [number, number])[];

export interface Road {
  readonly path: Path;
  /** Monotonic path index of each template stop. */
  readonly indices: readonly number[];
  /** Segments whose projection slipped — place on the chord there. */
  readonly bad: readonly boolean[];
}

const cache = new WeakMap<
  BusDirectionTemplate,
  WeakMap<readonly Path[], Road | 'none'>
>();

const build = (
  template: BusDirectionTemplate,
  paths: readonly Path[],
  coords: ReadonlyMap<string, readonly [number, number]>,
): Road | 'none' => {
  const path = matchPath(paths, template, coords);
  const stops = template.stops.map((stopId) => coords.get(stopId));
  return {
    true: (): Road | 'none' => {
      const indices = projectStops(path ?? [], stops);
      return {
        path: path ?? [],
        indices,
        bad: badSegments(path ?? [], indices, stops),
      };
    },
    false: (): Road | 'none' => 'none',
  }[`${path !== undefined}`]();
};

/**
 * Oriented polyline + monotonic stop projections for a template,
 * memoized by identity (templates and path arrays are stable module
 * singletons) — the projection is O(stops × path) and must not run
 * per animation tick.
 */
export const roadOf = (
  template: BusDirectionTemplate,
  paths: readonly Path[] | undefined,
  coords: ReadonlyMap<string, readonly [number, number]>,
): Road | undefined => {
  const inner = cache.get(template) ?? new WeakMap<readonly Path[], Road | 'none'>();
  cache.set(template, inner);
  const entry =
    inner.get(paths ?? []) ??
    { true: (): Road | 'none' => 'none', false: () => build(template, paths ?? [], coords) }[
      `${paths === undefined}`
    ]();
  [paths].filter((p): p is readonly Path[] => p !== undefined).forEach((p) =>
    inner.set(p, entry),
  );
  return [entry].filter((e): e is Road => e !== 'none')[0];
};
