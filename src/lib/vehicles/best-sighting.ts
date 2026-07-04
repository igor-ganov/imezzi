import { parseCountdown } from '../arrivals/parse-countdown.ts';
import type { StopArrival } from './stop-arrival.ts';

/** The sighting with the soonest countdown — the vehicle's next stop. */
export const bestSighting = (
  sightings: readonly StopArrival[],
  nowSeconds: number,
): StopArrival =>
  sightings.reduce((a, b) =>
    ({ true: a, false: b })[
      `${
        parseCountdown(a.row.countdown, nowSeconds) <=
        parseCountdown(b.row.countdown, nowSeconds)
      }`
    ],
  );
