import { Map as MapLibreMap } from 'maplibre-gl';
import { styleUrl } from '../../lib/map/style-url.ts';
import { appState } from '../../lib/store/app-state.ts';
import { addLayers } from './add-layers.ts';
import { bindCivicEvents } from './bind-civic-events.ts';
import { bindPickMode } from './bind-pick-mode.ts';
import { bindRouteMode } from './bind-route-mode.ts';
import { bindSearchPin } from './bind-search-pin.ts';
import { bindStopEvents } from './bind-stop-events.ts';
import { startCivicLoader } from './civic-loader.ts';
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
    const map = new MapLibreMap({
      container,
      style: styleUrl(appState.theme.get()),
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
    bindStopEvents(map);
    bindCivicEvents(map);
    bindSearchPin(map);
    bindRouteMode(map);
    bindPickMode(map);
    startCivicLoader(map);
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
