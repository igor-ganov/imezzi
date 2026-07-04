import type { Map as MapLibreMap } from 'maplibre-gl';
import { toStopsGeojson } from '../../lib/map/to-stops-geojson.ts';
import { toVehiclesGeojson } from '../../lib/map/to-vehicles-geojson.ts';
import { applySelection } from './apply-selection.ts';
import type { MapData } from './map-data.ts';
import type { makeStateMarker } from './state-marker.ts';
import { setSourceData } from './set-source-data.ts';
import { vehiclesNow } from './vehicles-now.ts';

type ForData = (fn: (data: MapData) => void) => void;

/** Source-refresh closures shared by boot, ticker and store wiring. */
export const makeSyncers = (
  map: MapLibreMap,
  forData: ForData,
  mark: ReturnType<typeof makeStateMarker>,
) => ({
  syncStops: (): void =>
    forData((data) => {
      setSourceData(map, 'stops', toStopsGeojson(data.stops));
      mark.stops(data.stops.length);
      mark.ready();
      // First idle after the data lands = the stop layer is actually
      // rendered and clickable (E2E waits on this DOM signal).
      map.once('idle', () => mark.stopsRendered());
    }),
  syncVehicles: (): void =>
    forData((data) => {
      const views = vehiclesNow(data);
      setSourceData(map, 'vehicles', toVehiclesGeojson(views));
      mark.vehicles(views.length);
    }),
  syncSelection: (): void =>
    forData((data) => void applySelection(map, data)),
});
