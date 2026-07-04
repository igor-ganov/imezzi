import type { Map as MapLibreMap } from 'maplibre-gl';
import { branch } from '../../lib/branch.ts';

const queryable = (map: MapLibreMap): boolean => {
  try {
    return (
      map.queryRenderedFeatures(undefined, { layers: ['stops-hit'] }).length >
      0
    );
  } catch {
    return false;
  }
};

/**
 * Fire `done` only when the stop hit layer actually answers feature
 * queries — the moment a user click can land (E2E readiness signal).
 * GeoJSON sources parse asynchronously, so a rendered frame alone
 * proves nothing; probe each frame until the layer responds.
 */
export const markStopsRendered = (map: MapLibreMap, done: () => void): void => {
  const probe = (): void =>
    branch(queryable(map))(done, () => {
      map.once('render', probe);
    });
  map.once('render', probe);
};
