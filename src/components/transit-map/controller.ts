import { Map as MapLibreMap } from 'maplibre-gl';
import { styleUrl } from '../../lib/map/style-url.ts';
import { toStopsGeojson } from '../../lib/map/to-stops-geojson.ts';
import { toVehiclesGeojson } from '../../lib/map/to-vehicles-geojson.ts';
import { appState } from '../../lib/store/app-state.ts';
import { addLayers } from './add-layers.ts';
import { applySelection } from './apply-selection.ts';
import { bindCivicEvents } from './bind-civic-events.ts';
import { bindPickMode } from './bind-pick-mode.ts';
import { bindRouteMode } from './bind-route-mode.ts';
import { bindSearchPin } from './bind-search-pin.ts';
import { bindStopEvents } from './bind-stop-events.ts';
import { startCivicLoader } from './civic-loader.ts';
import { wireStore } from './wire-store.ts';
import { loadMapData, type MapData } from './map-data.ts';
import { setSourceData } from './set-source-data.ts';
import { vehiclesNow } from './vehicles-now.ts';

const GENOA: readonly [number, number] = [8.9463, 44.4095];

/** Imperative shell around the MapLibre instance (site design §5). */
export const makeMapController = (container: HTMLElement) => {
  const state: { data?: MapData } = {};
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
    const syncStops = () =>
      forData((data) => setSourceData(map, 'stops', toStopsGeojson(data.stops)));
    const syncVehicles = () =>
      forData((data) =>
        setSourceData(map, 'vehicles', toVehiclesGeojson(vehiclesNow(data))),
      );
    const syncSelection = () =>
      forData((data) => void applySelection(map, data));
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
    globalThis.setInterval(syncVehicles, 1000);
    wireStore(map, { syncSelection, syncVehicles });
  };
  return { start };
};
