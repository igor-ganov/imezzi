import { liveGoal } from './live-target.ts';
import type { FleetTarget } from './fleet-target.ts';

export interface VehicleBoardRow {
  readonly stopId: string;
  readonly name: string;
  readonly etaSeconds: number;
  /** Arrival wall clock, HH:MM (Rome time of the viewer's session). */
  readonly arrival: string;
}

const clockAt = (nowMs: number, etaSeconds: number): string =>
  new Date(nowMs + etaSeconds * 1000).toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Rome',
  });

/**
 * The remaining stops of a vehicle's trip with wait + arrival times,
 * derived from its template offsets against the LIVE goal moment
 * (vehicle sheet, tap on the icon).
 */
export const vehicleBoard = (
  target: FleetTarget,
  names: ReadonlyMap<string, string>,
  nowMs: number,
): readonly VehicleBoardRow[] => {
  const moment = liveGoal(target, nowMs).moment;
  return (target.template?.stops ?? [])
    .map((stopId, index) => ({
      stopId,
      etaSeconds: (target.template?.offsets[index] ?? 0) - moment,
    }))
    .filter(({ etaSeconds }) => etaSeconds >= 0)
    .map(({ stopId, etaSeconds }) => ({
      stopId,
      name: names.get(stopId) ?? stopId,
      etaSeconds,
      arrival: clockAt(nowMs, etaSeconds),
    }));
};
