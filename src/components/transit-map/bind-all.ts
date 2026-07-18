import type { Map as MapLibreMap } from 'maplibre-gl';
import { bindCivicEvents } from './bind-civic-events.ts';
import { bindMe } from './bind-me.ts';
import { bindPickMode } from './bind-pick-mode.ts';
import { bindRouteMode } from './bind-route-mode.ts';
import { bindRouteToTap } from './bind-route-to-tap.ts';
import { bindSearchPin } from './bind-search-pin.ts';
import { bindSelectedVehicle } from './bind-selected-vehicle.ts';
import { bindSpecialStopEvents } from './bind-special-stop-events.ts';
import { bindStopEvents } from './bind-stop-events.ts';
import { bindVehicleEvents } from './bind-vehicle-events.ts';
import { bindVehicleRoute } from './bind-vehicle-route.ts';
import { startCivicLoader } from './civic-loader.ts';

/** All map-instance event/signal bindings, in one place. */
export const bindAll = (map: MapLibreMap): void => {
  bindStopEvents(map);
  bindSpecialStopEvents(map);
  bindCivicEvents(map);
  bindSearchPin(map);
  bindRouteMode(map);
  bindRouteToTap(map);
  bindPickMode(map);
  bindMe(map);
  bindSelectedVehicle(map);
  bindVehicleEvents(map);
  bindVehicleRoute(map);
  startCivicLoader(map);
};
