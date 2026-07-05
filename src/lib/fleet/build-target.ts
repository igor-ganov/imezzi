import { normalizeLineLabel } from '../vehicles/normalize-line-label.ts';
import { templateLineOf } from './template-line-of.ts';
import { effectiveCountdown } from './effective-countdown.ts';
import { advanceProgress, type FleetProgress } from './fleet-memory.ts';
import type { FleetTarget } from './fleet-target.ts';
import { momentOf } from './moment-of.ts';
import { resolveDirection } from './resolve-direction.ts';
import { roadOf } from './road-of.ts';
import type { BusOffsets, FleetSighting } from './types.ts';

type Path = readonly (readonly [number, number])[];

/** One vehicle: sticky direction, monotonic extrapolated moment. */
export const buildTarget = (
  best: FleetSighting,
  offsets: BusOffsets,
  coords: ReadonlyMap<string, readonly [number, number]>,
  nowSeconds: number,
  pathsOf: (label: string) => readonly Path[] | undefined,
  previous: FleetProgress | undefined,
): { readonly target: FleetTarget; readonly progress: FleetProgress } => {
  const label = normalizeLineLabel(best.row.line);
  const templateLine = templateLineOf(label);
  const { template, templateKey } = resolveDirection(
    offsets,
    templateLine,
    best.stopId,
    best.row.destination,
    previous,
  );
  const raw = [template]
    .filter((t): t is NonNullable<typeof t> => t !== undefined)
    .map((t) =>
      momentOf(t, best.stopId, effectiveCountdown(best, nowSeconds)),
    )[0];
  const moment = advanceProgress(
    previous,
    templateKey,
    raw ?? 0,
    template?.offsets[template.offsets.length - 1] ?? 0,
  );
  return {
    target: {
      id: `bus:${best.row.vehicle}`,
      label,
      templateKey,
      template,
      road: [template]
        .filter((t): t is NonNullable<typeof t> => t !== undefined)
        .map((t) => roadOf(t, pathsOf(templateLine), coords))[0],
      targetMoment: moment,
      ageSeconds: Math.max(nowSeconds - best.fetchedAtSeconds, 0),
      builtAtMs: Date.now(),
      anchor: coords.get(best.stopId) ?? [0, 0],
      dimmed: false,
    },
    progress: { templateKey, moment },
  };
};
