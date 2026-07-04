/** Minimal GeoJSON model used by the map sources. */

export interface PointGeometry {
  readonly type: 'Point';
  readonly coordinates: readonly [number, number];
}

export interface LineGeometryJson {
  readonly type: 'LineString';
  readonly coordinates: readonly (readonly [number, number])[];
}

export interface Feature<G, P> {
  readonly type: 'Feature';
  readonly id?: number;
  readonly geometry: G;
  readonly properties: P;
}

export interface FeatureCollection<G, P> {
  readonly type: 'FeatureCollection';
  readonly features: readonly Feature<G, P>[];
}
