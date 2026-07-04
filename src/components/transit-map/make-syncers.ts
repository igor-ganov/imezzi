import type { Map as MapLibreMap } from 'maplibre-gl';
import { uniqueFleetCount } from '../../lib/fleet/unique-fleet-count.ts';
import { toStopsGeojson } from '../../lib/map/to-stops-geojson.ts';
import { toVehiclesGeojson } from '../../lib/map/to-vehicles-geojson.ts';
import { appState } from '../../lib/store/app-state.ts';
import { applySelection } from './apply-selection.ts';
import type { MapData } from './map-data.ts';
import { markStopsRendered } from './mark-stops-rendered.ts';
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
      markStopsRendered(map, () => mark.stopsRendered());
    }),
  syncVehicles: (): void =>
    forData((data) => {
      const views = vehiclesNow(data);
      setSourceData(map, 'vehicles', toVehiclesGeojson(views));
      mark.vehicles(views.length);
      mark.fleet(
        uniqueFleetCount(appState.fleetSightings.get()),
        views.filter((view) => view.id.startsWith('bus:')).length,
      );
    }),
  syncSelection: (): void =>
    forData((data) => void applySelection(map, data)),
});
