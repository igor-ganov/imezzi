import type { VehicleView } from '../vehicles/types.ts';
import type { FeatureCollection, PointGeometry } from './geojson.ts';

export interface VehicleProps {
  readonly id: string;
  readonly label: string;
  readonly mode: string;
  readonly lineKey: string;
  readonly approximated: boolean;
  readonly dimmed: boolean;
  /** Compass degrees for the direction arrow; -1 = unknown. */
  readonly bearing: number;
}

/** Vehicle views → GeoJSON points for the `vehicles` source. */
export const toVehiclesGeojson = (
  vehicles: readonly VehicleView[],
): FeatureCollection<PointGeometry, VehicleProps> => ({
  type: 'FeatureCollection',
  features: vehicles.map((vehicle) => ({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [vehicle.lon, vehicle.lat] },
    properties: {
      id: vehicle.id,
      label: vehicle.label,
      mode: vehicle.mode,
      lineKey: vehicle.lineKey,
      approximated: vehicle.approximated,
      dimmed: vehicle.dimmed ?? false,
      bearing: vehicle.bearing ?? -1,
    },
  })),
});
