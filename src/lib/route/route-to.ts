import { appState } from '../store/app-state.ts';
import type { Place } from './types.ts';

/**
 * Single entry for "route here" from anywhere — a stop board, a
 * civic card, a long-press on the map: sets the destination, closes
 * whatever sheet initiated it and opens the planner (route US-5).
 */
export const routeTo = (place: Place): void => {
  appState.destination.set(place);
  appState.pickMode.set(undefined);
  appState.activeStopId.set(undefined);
  appState.activeCivic.set(undefined);
  appState.plannerOpen.set(true);
};
