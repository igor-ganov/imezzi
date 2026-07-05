import type { FleetTarget } from '../fleet/fleet-target.ts';
import { normalizeLineLabel } from '../vehicles/normalize-line-label.ts';
import type { Leg } from './types.ts';

/** Tolerance around the planned boarding time, seconds. */
const WINDOW_SECONDS = 900;

/**
 * The live vehicle that will serve a transit leg: same line, still
 * before the boarding stop on its direction, with the arrival there
 * closest to the leg's planned departure (route US-3/US-4: clicking
 * a leg highlights the actual bus coming for you).
 */
export const matchLegVehicle = (
  targets: readonly FleetTarget[],
  leg: Leg,
  legWaitSeconds: number,
): string | undefined => {
  const label = normalizeLineLabel(leg.line ?? '');
  const candidates = targets
    .filter((target) => target.label === label)
    .flatMap((target) => {
      const index = target.template?.stops.indexOf(leg.from.stopId ?? '') ?? -1;
      const boardOffset = target.template?.offsets[index] ?? 0;
      const eta = boardOffset - target.targetMoment;
      return [{ target, eta }].filter(
        () => index >= 0 && eta >= -60 && eta <= legWaitSeconds + WINDOW_SECONDS,
      );
    })
    .sort(
      (a, b) =>
        Math.abs(a.eta - legWaitSeconds) - Math.abs(b.eta - legWaitSeconds),
    );
  return candidates[0]?.target.id;
};
