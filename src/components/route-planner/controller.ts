import { branch } from '../../lib/branch.ts';
import { plan } from '../../lib/route/plan.ts';
import type { Place } from '../../lib/route/types.ts';
import { appState } from '../../lib/store/app-state.ts';

export interface PlannerHost {
  busy: boolean;
}

/** Imperative shell: geolocation, auto-planning (route-planner US-1/2). */
export const makePlannerController = (host: PlannerHost) => {
  const compute = async (): Promise<void> => {
    const from = appState.origin.get();
    const to = appState.destination.get();
    await branch(from !== undefined && to !== undefined)(
      async () => {
        host.busy = true;
        const itineraries = await plan(
          from ?? { name: '', lat: 0, lon: 0 },
          to ?? { name: '', lat: 0, lon: 0 },
        ).catch((): readonly never[] => []);
        appState.itineraries.set(itineraries);
        appState.itinerary.set(itineraries[0]);
        host.busy = false;
      },
      () => Promise.resolve(),
    );
  };
  const locate = (): void =>
    navigator.geolocation.getCurrentPosition((position) =>
      appState.origin.set({
        name: 'My location',
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      }),
    );
  const clear = (): void => {
    appState.itinerary.set(undefined);
    appState.itineraries.set([]);
    appState.origin.set(undefined);
    appState.destination.set(undefined);
    appState.pickMode.set(undefined);
  };
  appState.origin.subscribe(() => void compute());
  appState.destination.subscribe(() => void compute());
  return { locate, clear };
};

export type Endpoint = Place | undefined;
