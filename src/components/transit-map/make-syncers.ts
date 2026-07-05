import type { Map as MapLibreMap } from 'maplibre-gl';
import { uniqueFleetCount } from '../../lib/fleet/unique-fleet-count.ts';
import { toStopsGeojson } from '../../lib/map/to-stops-geojson.ts';
import { toVehiclesGeojson } from '../../lib/map/to-vehicles-geojson.ts';
import { appState } from '../../lib/store/app-state.ts';
import { applySelection } from './apply-selection.ts';
import { fleetFrame } from './fleet-frame.ts';
import type { MapData } from './map-data.ts';
import { markStopsRendered } from './mark-stops-rendered.ts';
import { makeMotionLoop } from './motion-loop.ts';
import type { makeStateMarker } from './state-marker.ts';
import { setSourceData } from './set-source-data.ts';

type ForData = (fn: (data: MapData) => void) => void;

/** Source-refresh closures shared by boot, ticker and store wiring. */
export const makeSyncers = (
  map: MapLibreMap,
  forData: ForData,
  mark: ReturnType<typeof makeStateMarker>,
) => {
  const motion = makeMotionLoop(
    (views) => setSourceData(map, 'vehicles', toVehiclesGeojson(views)),
    (meters) => mark.maxStep(meters),
  );
  motion.start();
  return {
    syncStops: (): void =>
      forData((data) => {
        setSourceData(map, 'stops', toStopsGeojson(data.stops));
        mark.stops(data.stops.length);
        mark.ready();
        markStopsRendered(map, () => mark.stopsRendered());
      }),
    syncVehicles: (): void =>
      forData((data) => {
        const frame = fleetFrame(data);
        motion.setFrame(frame);
        mark.vehicles(frame.schedule.length + frame.targets.length);
        mark.fleet(
          uniqueFleetCount(appState.fleetSightings.get()),
          frame.freshCount,
          frame.targets.length - frame.freshCount,
        );
      }),
    syncSelection: (): void =>
      forData((data) => void applySelection(map, data)),
  };
};
