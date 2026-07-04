import type { Line } from '../amt/types.ts';
import type { Schedule } from '../schedule/types.ts';
import type { UiLine } from './ui-line.ts';

/**
 * One list for the filter: AMT app bus lines + GTFS non-bus lines
 * (metro, funiculars, lifts, Navebus, Casella) — live-map AC-2.3.
 */
export const mergedLines = (
  appLines: readonly Line[],
  schedule: Schedule,
): readonly UiLine[] => [
  ...schedule.lines.map((line) => ({
    key: line.id,
    label: line.shortName,
    description: line.longName,
    mode: line.mode,
  })),
  ...appLines.map((line) => ({
    key: line.id,
    label: line.name,
    description: `${line.from} ⇄ ${line.to}`,
    mode: 'bus',
  })),
];
