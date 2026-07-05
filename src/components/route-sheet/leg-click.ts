import type { Leg } from '../../lib/route/types.ts';
import { appState } from '../../lib/store/app-state.ts';

/**
 * Leg click: zoom the map on the leg AND highlight the vehicle icon
 * serving it — the matched live bus, or its parked pictogram
 * (route US-3/US-4).
 */
export const onLegClick = (leg: Leg, index: number): void => {
  appState.focusLeg.set(leg);
  appState.selectedVehicleId.set(
    {
      true: undefined,
      false: appState.legVehicles.get().get(index) ?? `leg:${index}`,
    }[`${leg.mode === 'walk'}`],
  );
};
