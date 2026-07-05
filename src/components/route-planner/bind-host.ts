import { appState } from '../../lib/store/app-state.ts';
import type { RoutePlannerHost } from './planner-host.ts';

/** Mirror route store slices onto the island's reactive state. */
export const bindPlannerHost = (host: RoutePlannerHost): void => {
  appState.origin.subscribe((value) => {
    host.origin = value;
  });
  appState.destination.subscribe((value) => {
    host.destination = value;
  });
  appState.pickMode.subscribe((value) => {
    host.pickMode = value;
  });
  appState.itineraries.subscribe((value) => {
    host.itineraries = value;
  });
  appState.itinerary.subscribe((value) => {
    host.itinerary = value;
  });
  appState.plannerOpen.subscribe((value) => {
    host.open = value;
  });
};
