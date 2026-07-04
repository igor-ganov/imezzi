import type { Arrival } from '../amt/types.ts';
import { fetchJson } from '../api/fetch-json.ts';
import { romeClock } from '../schedule/rome-clock.ts';
import { enrichLeg } from './enrich-leg.ts';
import { mapItinerary } from './map-itinerary.ts';
import type { MotisPlanResponse } from './motis-types.ts';
import { planUrl } from './plan-url.ts';
import type { Itinerary, Leg, Place } from './types.ts';

const liveEnrich = async (leg: Leg): Promise<Leg> => {
  const stopId = leg.from.stopId ?? '';
  const wanted = leg.mode !== 'walk' && /^\d{4}$/.test(stopId);
  const arrivals = await {
    true: () =>
      fetchJson<readonly Arrival[]>(`/api/arrivals/${stopId}`).catch(
        (): readonly Arrival[] => [],
      ),
    false: () => Promise.resolve<readonly Arrival[]>([]),
  }[`${wanted}`]();
  return enrichLeg(
    leg,
    arrivals,
    romeClock(new Date()).seconds,
    new Date().toISOString(),
  );
};

/**
 * Compute door-to-door itineraries (walk + all transit modes) and
 * overlay live AMT predictions on boarding legs (US-2).
 */
export const plan = async (
  from: Place,
  to: Place,
): Promise<readonly Itinerary[]> => {
  const response = await fetchJson<MotisPlanResponse>(planUrl(from, to, 4));
  const mapped = [
    ...response.itineraries.map(mapItinerary),
    ...(response.direct ?? []).map(mapItinerary),
  ];
  return Promise.all(
    mapped.map(async (itinerary) => ({
      ...itinerary,
      legs: await Promise.all(itinerary.legs.map(liveEnrich)),
    })),
  );
};
