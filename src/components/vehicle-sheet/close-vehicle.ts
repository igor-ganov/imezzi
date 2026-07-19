import { appState } from '../../lib/store/app-state.ts';

/** Dismiss the active vehicle: drop its sheet and its selection ring. */
export const closeVehicle = (): void => {
  appState.activeVehicleId.set(undefined);
  appState.selectedVehicleId.set(undefined);
};
