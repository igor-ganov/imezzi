import type { LineGeometry } from '../amt/types.ts';
import { fetchJson } from '../api/fetch-json.ts';

const cache = new Map<string, Promise<LineGeometry | undefined>>();

/** Memoized route polyline; undefined when AMT has no file for it. */
export const loadGeometry = (
  code: string,
  direction: number,
): Promise<LineGeometry | undefined> => {
  const key = `${code}/${direction}`;
  const cached =
    cache.get(key) ??
    fetchJson<LineGeometry>(`/api/geometry/${code}/${direction}`)
      .then((geometry) =>
        ({ true: geometry, false: undefined })[`${geometry.path.length > 1}`],
      )
      .catch(() => undefined);
  cache.set(key, cached);
  return cached;
};
