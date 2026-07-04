import { parseCountdown } from '../arrivals/parse-countdown.ts';
import { groupBy } from '../group-by.ts';
import { bestSighting } from './best-sighting.ts';
import type { BusLineContext } from './bus-line-context.ts';
import { normalizeLineLabel } from './normalize-line-label.ts';
import { pickDirection } from './pick-direction.ts';
import { placeOnPath } from './place-on-path.ts';
import type { StopArrival } from './stop-arrival.ts';
import type { VehicleView } from './types.ts';

const SEGMENT_SECONDS = 120;

/**
 * Infer live bus positions from per-stop SIMON predictions: the same
 * NumeroSociale seen across a line's stops sits before its soonest
 * predicted stop, `countdown/120 s` of a segment away (design §2).
 * `fetchedAtSeconds` parametrises the position over wall-clock time:
 * the remaining countdown shrinks as seconds pass, so recomputing
 * every tick animates the vehicle toward the stop between polls.
 */
export const inferBusVehicles = (
  context: BusLineContext,
  arrivals: readonly StopArrival[],
  nowSeconds: number,
  fetchedAtSeconds: number = nowSeconds,
): readonly VehicleView[] => {
  const mine = arrivals.filter(
    ({ row }) =>
      normalizeLineLabel(row.line) === normalizeLineLabel(context.label) &&
      row.vehicle !== '',
  );
  return Array.from(
    groupBy(mine, ({ row }) => row.vehicle).values(),
  ).flatMap((sightings) => {
    const best = bestSighting(sightings, nowSeconds);
    const direction = pickDirection(context.directions, best.row.destination);
    const index = direction?.stopIds.indexOf(best.stopId) ?? -1;
    const target = context.stopCoords[best.stopId];
    const prev =
      context.stopCoords[direction?.stopIds[Math.max(index - 1, 0)] ?? ''] ??
      target;
    const elapsed = Math.max(nowSeconds - fetchedAtSeconds, 0);
    const countdown = Math.max(
      parseCountdown(best.row.countdown, fetchedAtSeconds) - elapsed,
      0,
    );
    const fraction = 1 - Math.min(countdown / SEGMENT_SECONDS, 1);
    return [direction]
      .filter(() => direction !== undefined && index >= 0 && target !== undefined)
      .map(() => {
        const [lon, lat] = placeOnPath(
          direction?.path ?? [],
          prev ?? [0, 0],
          target ?? [0, 0],
          fraction,
        );
        return {
          id: `${context.key}:${best.row.vehicle}`,
          label: context.label,
          mode: 'bus',
          lineKey: context.key,
          lat,
          lon,
          approximated: best.row.theoretical,
        };
      });
  });
};
