import { Map as MapLibreMap } from 'maplibre-gl';
import { buildStyle } from '../../lib/map/build-style.ts';
import { hasHardwareGl } from '../../lib/map/has-hardware-gl.ts';
import { appState } from '../../lib/store/app-state.ts';
import { addLayers } from './add-layers.ts';
import { bindAll } from './bind-all.ts';
import { exposeMap } from './expose-map.ts';
import { wireStore } from './wire-store.ts';
import { loadMapData, type MapData } from './map-data.ts';
import { makeStateMarker } from './state-marker.ts';
import { makeSyncers } from './make-syncers.ts';

const GENOA: readonly [number, number] = [8.9463, 44.4095];

/** Imperative shell around the MapLibre instance (site design §5). */
export const makeMapController = (container: HTMLElement) => {
  const state: { data?: MapData } = {};
  const mark = makeStateMarker(container);
  const forData = (fn: (data: MapData) => void) =>
    [state.data]
      .filter((data): data is MapData => data !== undefined)
      .forEach(fn);
  const start = () => {
    const relief = hasHardwareGl();
    const map = new MapLibreMap({
      container,
      style: buildStyle(appState.theme.get(), relief),
      center: [GENOA[0], GENOA[1]],
      zoom: 13.2,
      attributionControl: {
        compact: true,
        customAttribution: '© AMT Genova · © Comune di Genova (CC BY 4.0)',
      },
    });
    const { syncStops, syncVehicles, syncSelection } = makeSyncers(
      map,
      forData,
      mark,
    );
    map.on('style.load', () => {
      addLayers(map, appState.theme.get());
      syncStops();
      syncVehicles();
      syncSelection();
    });
    bindAll(map);
    exposeMap(map);
    loadMapData().then((data) => {
      state.data = data;
      syncStops();
      syncVehicles();
    });
    // 500 ms tick: schedule vehicles and live snapshots are both
    // parametric in wall-clock time, so each tick moves the fleet.
    globalThis.setInterval(syncVehicles, 500);
    appState.itinerary.subscribe((itinerary) =>
      mark.routeLegs(itinerary?.legs.length ?? 0),
    );
    wireStore(map, { syncSelection, syncVehicles });
  };
  return { start };
};
