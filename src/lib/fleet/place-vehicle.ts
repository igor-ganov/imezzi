import { normalizeLineLabel } from '../vehicles/normalize-line-label.ts';
import type { VehicleView } from '../vehicles/types.ts';
import { effectiveCountdown } from './effective-countdown.ts';
import { advanceProgress, type FleetProgress } from './fleet-memory.ts';
import { momentOf } from './moment-of.ts';
import { placeAtMoment } from './place-at-moment.ts';
import { resolveDirection } from './resolve-direction.ts';
import { roadOf } from './road-of.ts';
import type { BusOffsets, FleetSighting } from './types.ts';

type Path = readonly (readonly [number, number])[];

/** One vehicle: sticky direction, monotonic progress, placement. */
export const placeVehicle = (
  best: FleetSighting,
  offsets: BusOffsets,
  coords: ReadonlyMap<string, readonly [number, number]>,
  nowSeconds: number,
  pathsOf: (label: string) => readonly Path[] | undefined,
  previous: FleetProgress | undefined,
): { readonly view: VehicleView; readonly progress: FleetProgress } => {
  const label = normalizeLineLabel(best.row.line);
  const { template, templateKey } = resolveDirection(
    offsets,
    label,
    best.stopId,
    best.row.destination,
    previous,
  );
  const raw = [template]
    .filter((t): t is NonNullable<typeof t> => t !== undefined)
    .map((t) => momentOf(t, best.stopId, effectiveCountdown(best, nowSeconds)))[0];
  const moment = advanceProgress(
    previous,
    templateKey,
    raw ?? 0,
    template?.offsets[template.offsets.length - 1] ?? 0,
  );
  const placed = [template]
    .filter(
      (t): t is NonNullable<typeof t> => t !== undefined && raw !== undefined,
    )
    .map((t) =>
      placeAtMoment(t, coords, moment, roadOf(t, pathsOf(label), coords)),
    )[0];
  const anchor = coords.get(best.stopId) ?? [0, 0];
  return {
    view: {
      id: `bus:${best.row.vehicle}`,
      label,
      mode: 'bus',
      lineKey: label,
      lon: placed?.point[0] ?? anchor[0],
      lat: placed?.point[1] ?? anchor[1],
      approximated: false,
      bearing: placed?.bearing,
      ageSeconds: Math.max(nowSeconds - best.fetchedAtSeconds, 0),
    },
    progress: { templateKey, moment },
  };
};
