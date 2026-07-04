import type { FeatureCollection, LineGeometryJson } from './geojson.ts';

export interface RouteLineProps {
  readonly key: string;
  readonly mode: string;
}

export interface RoutePath {
  readonly key: string;
  readonly mode: string;
  readonly path: readonly (readonly [number, number])[];
}

/** Fetched line geometries → GeoJSON for the `route-lines` source. */
export const toRouteLinesGeojson = (
  paths: readonly RoutePath[],
): FeatureCollection<LineGeometryJson, RouteLineProps> => ({
  type: 'FeatureCollection',
  features: paths.map((line) => ({
    type: 'Feature',
    geometry: { type: 'LineString', coordinates: line.path },
    properties: { key: line.key, mode: line.mode },
  })),
});
