import { loadGeometry } from './load-geometry.ts';

type Path = readonly (readonly [number, number])[];

const cache = new Map<string, readonly Path[]>();
const pending = new Set<string>();

const codeOf = (label: string): string =>
  ({ true: label.padStart(3, '0'), false: label }[`${/^\d+$/.test(label)}`] ??
  label);

/**
 * Road polylines per line label, filled lazily in the background as
 * the fleet discovers lines; `get` is synchronous for the render
 * tick — until a line's geometry lands its buses fall back to
 * straight segments, then snap to the road.
 */
export const fleetPaths = {
  get: (label: string): readonly Path[] | undefined => cache.get(label),
  ensure: (labels: ReadonlySet<string>): void =>
    [...labels]
      .filter((label) => !cache.has(label) && !pending.has(label))
      .forEach((label) => {
        pending.add(label);
        void Promise.all([
          loadGeometry(codeOf(label), 1),
          loadGeometry(codeOf(label), 2),
        ])
          .then((geometries) => {
            cache.set(
              label,
              geometries
                .filter(
                  (entry): entry is NonNullable<typeof entry> =>
                    entry !== undefined,
                )
                .map((entry) => entry.path),
            );
          })
          .finally(() => {
            pending.delete(label);
          });
      }),
};
