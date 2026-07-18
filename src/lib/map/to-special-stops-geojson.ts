import type { Schedule } from '../schedule/types.ts';
import type { FeatureCollection, PointGeometry } from './geojson.ts';
import { stopModes } from './stop-modes.ts';

export interface SpecialStopProps {
  readonly id: string;
  readonly name: string;
  readonly mode: string;
}

/**
 * Non-bus stations (funicular / cremagliera / metro / lift) → GeoJSON
 * for the `special-stops` source. AMT's app_stops.php CSV lists only
 * SIMON bus/tram stops, so these come from the bundled GTFS schedule
 * and render as mode-coloured dots the bus stops never showed.
 */
export const toSpecialStopsGeojson = (
  schedule: Schedule,
): FeatureCollection<PointGeometry, SpecialStopProps> => {
  const modes = stopModes(schedule);
  return {
    type: 'FeatureCollection',
    features: Object.entries(schedule.stops).map(([id, stop], index) => ({
      type: 'Feature',
      id: index,
      geometry: { type: 'Point', coordinates: [stop.lon, stop.lat] },
      properties: { id, name: stop.name, mode: modes.get(id) ?? 'funicular' },
    })),
  };
};
