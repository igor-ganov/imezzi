import type { VehicleView } from '../vehicles/types.ts';
import type { Itinerary } from './types.ts';

/**
 * A pictogram for every transit leg whose vehicle is not (yet) live:
 * the scheduled service must stay visible, parked at the leg's first
 * location with the ⚠ mark, until a real vehicle takes over
 * (route US-3: icons never vanish).
 */
export const parkedLegViews = (
  itinerary: Itinerary | undefined,
  matched: ReadonlyMap<number, string | undefined>,
): readonly VehicleView[] =>
  (itinerary?.legs ?? [])
    .map((leg, index) => ({ leg, index }))
    .filter(
      ({ leg, index }) =>
        leg.mode !== 'walk' && matched.get(index) === undefined,
    )
    .map(({ leg, index }) => ({
      id: `leg:${index}`,
      label: leg.line ?? '',
      mode: leg.mode,
      lineKey: leg.line ?? '',
      lon: leg.from.lon,
      lat: leg.from.lat,
      approximated: true,
      ageSeconds: 0,
      dimmed: false,
    }));
