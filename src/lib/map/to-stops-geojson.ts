import type { Stop } from '../amt/types.ts';
import type { FeatureCollection, PointGeometry } from './geojson.ts';

export interface StopProps {
  readonly id: string;
  readonly name: string;
  readonly monitored: boolean;
  readonly lines: string;
}

/** AMT stops → GeoJSON point collection for the `stops` source. */
export const toStopsGeojson = (
  stops: readonly Stop[],
): FeatureCollection<PointGeometry, StopProps> => ({
  type: 'FeatureCollection',
  features: stops.map((stop, index) => ({
    type: 'Feature',
    id: index,
    geometry: { type: 'Point', coordinates: [stop.lon, stop.lat] },
    properties: {
      id: stop.id,
      name: stop.name,
      monitored: stop.monitored,
      lines: stop.lines.join(','),
    },
  })),
});
