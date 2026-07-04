import type { Arrival } from '../amt/types.ts';
import { parseCountdown } from '../arrivals/parse-countdown.ts';
import { normalizeLineLabel } from '../vehicles/normalize-line-label.ts';
import type { Leg } from './types.ts';

/** A live bus may run a bit early, but we still have to reach the stop. */
const EARLY_SEC = 180;
const LATE_SEC = 900;

/**
 * Overlay a live SIMON prediction on a planned transit leg: a
 * matching line at the boarding stop within ±15 min replaces the
 * scheduled departure and clears the ⚠ flag (route-planner §2).
 */
export const enrichLeg = (
  leg: Leg,
  arrivals: readonly Arrival[],
  nowSeconds: number,
  nowIso: string,
): Leg => {
  const scheduledWait =
    (Date.parse(leg.startTime) - Date.parse(nowIso)) / 1000;
  const live = arrivals
    .filter((row) => !row.theoretical)
    .filter(
      (row) => normalizeLineLabel(row.line) === normalizeLineLabel(leg.line ?? ''),
    )
    .map((row) => ({
      row,
      wait: parseCountdown(row.countdown, nowSeconds),
    }))
    .filter(
      ({ wait }) =>
        wait >= scheduledWait - EARLY_SEC && wait <= scheduledWait + LATE_SEC,
    )
    .sort((a, b) => a.wait - b.wait)[0];
  return {
    true: (): Leg => ({
      ...leg,
      approximated: false,
      startTime: new Date(
        Date.parse(nowIso) + (live?.wait ?? 0) * 1000,
      ).toISOString(),
    }),
    false: () => leg,
  }[`${live !== undefined}`]();
};
