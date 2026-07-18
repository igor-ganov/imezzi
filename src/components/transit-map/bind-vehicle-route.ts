import type { Map as MapLibreMap } from 'maplibre-gl';
import { branch } from '../../lib/branch.ts';
import type { FeatureCollection, LineGeometryJson } from '../../lib/map/geojson.ts';
import {
  toRouteLinesGeojson,
  type RouteLineProps,
} from '../../lib/map/to-route-lines-geojson.ts';
import { appState } from '../../lib/store/app-state.ts';
import { setSourceData } from './set-source-data.ts';

const EMPTY: FeatureCollection<LineGeometryJson, RouteLineProps> = {
  type: 'FeatureCollection',
  features: [],
};

/**
 * Draw the selected vehicle's exact travel path — the road polyline
 * the fleet already snaps it to (target.road) — into `vehicle-route`,
 * clearing it when nothing is selected or the target has no geometry.
 */
export const bindVehicleRoute = (map: MapLibreMap): void => {
  const draw = (): void => {
    const target = [appState.selectedVehicleId.get()]
      .filter((id): id is string => id !== undefined)
      .map((id) => appState.fleetTargets.get().get(id))[0];
    const path = target?.road?.path ?? [];
    setSourceData(
      map,
      'vehicle-route',
      branch(path.length > 1)(
        () => toRouteLinesGeojson([{ key: target?.label ?? '', mode: 'bus', path }]),
        () => EMPTY,
      ),
    );
  };
  appState.selectedVehicleId.subscribe(draw);
  appState.fleetTargets.subscribe(draw);
};
