/** One resolved Genoa address (official civic or OSM fallback). */
export interface CivicHit {
  readonly street: string;
  readonly display: string;
  readonly red: boolean;
  readonly municipio: string;
  readonly lon: number;
  readonly lat: number;
  readonly source: 'comune' | 'osm';
}
